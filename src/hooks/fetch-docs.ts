import { useState, useEffect, useCallback } from 'react';
import { createWorker, Worker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Use Partial because we initialize it with a subset of fields.
type OCRProgress = any;

interface UseTesseractOCR {
    extractedText: string;
    isLoading: boolean;
    progress: OCRProgress;
    error: string;
    previewUrl: string | null;
    performOCR: () => Promise<void>;
    setFile: (file: File | null) => void;
    file: File | null;
}

// Set the worker source for pdf.js to avoid issues with bundlers
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * A custom React hook to perform Optical Character Recognition (OCR) on an image or PDF using Tesseract.js.
 * It encapsulates the worker initialization, state management, and the OCR process.
 * @returns {UseTesseractOCR} An object containing state and functions for the OCR process.
 */
export const useTesseractOCR = (): UseTesseractOCR => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState<OCRProgress>({ status: 'idle', progress: 0 });
    const [error, setError] = useState<string>('');
    const [worker, setWorker] = useState<Worker | null>(null);

    const initializeWorker = useCallback(async () => {
        try {
            const newWorker = await createWorker('eng', 1, {
                logger: (m: any) => {
                    // Remap progress to a 0-1 scale if it's not already
                    const progressValue = m.progress ? m.progress : 0;
                    setProgress({ status: m.status, progress: progressValue });
                },
            });
            setWorker(newWorker);
        } catch (err) {
            console.error('Failed to initialize Tesseract worker', err);
            setError('Could not initialize OCR worker. Please refresh the page.');
        }
    }, []);

    useEffect(() => {
        if (!worker) {
            initializeWorker();
        }

        return () => {
            if (worker) {
                worker.terminate();
            }
        };
    }, [worker, initializeWorker]);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }

        // For PDFs, we don't generate a direct preview URL
        if (file.type === 'application/pdf') {
            setPreviewUrl(null); // Or a generic PDF icon URL
        } else {
            const newPreviewUrl = URL.createObjectURL(file);
            setPreviewUrl(newPreviewUrl);
            return () => {
                URL.revokeObjectURL(newPreviewUrl);
            };
        }
    }, [file]);

    const processPdf = (file: File, worker: Worker): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                if (e.target?.result) {
                    try {
                        const pdf = await pdfjsLib.getDocument({ data: e.target.result as ArrayBuffer }).promise;
                        let fullText = '';
                        for (let i = 1; i <= pdf.numPages; i++) {
                            setProgress({ status: `Processing PDF page ${i}/${pdf.numPages}`, progress: (i - 1) / pdf.numPages });
                            const page = await pdf.getPage(i);
                            const viewport = page.getViewport({ scale: 2.0 }); // Increased scale for better quality
                            const canvas = document.createElement('canvas');
                            const context = canvas.getContext('2d');
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;
                            if (context) {
                                await page.render({ canvasContext: context, viewport: viewport }).promise;
                                const { data: { text } } = await worker.recognize(canvas);
                                fullText += text + '\n';
                            }
                        }
                        resolve(fullText);
                    } catch (err) {
                        reject(err);
                    }
                }
            };
            reader.onerror = (err) => {
                reject(err);
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const performOCR = async () => {
        if (!file || !worker) {
            setError('Please upload a document and wait for the worker to initialize.');
            return;
        }

        setIsLoading(true);
        setExtractedText('');
        setError('');
        setProgress({ status: 'starting', progress: 0 });

        try {
            let text = '';
            if (file.type === 'application/pdf') {
                text = await processPdf(file, worker);
            } else {
                const { data } = await worker.recognize(file);
                text = data.text;
            }

            if (text) {
                setExtractedText(text);
            } else {
                setExtractedText('No text could be extracted from the document.');
            }
        } catch (err) {
            console.error('OCR error:', err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(`Failed to perform OCR: ${errorMessage}`);
        } finally {
            setIsLoading(false);
            setProgress({ status: 'idle', progress: 0 });
        }
    };

    return {
        extractedText,
        isLoading,
        progress,
        error,
        previewUrl,
        performOCR,
        setFile,
        file,
    };
};
