import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = ['1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3', 'openclose.mp3'];

console.log('Generating Data URIs for audio files...\n');

const audioDataUris = {};

files.forEach(file => {
  try {
    // Check if file is in audios directory or public directory
    let filePath = path.join(__dirname, 'public', 'audios', file);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, 'public', file);
    }
    
    const data = fs.readFileSync(filePath);
    const base64 = data.toString('base64');
    const dataUri = `data:audio/mp3;base64,${base64}`;
    
    // Store in object - use filename without extension as key
    const key = file.replace('.mp3', '');
    audioDataUris[key] = dataUri;
    
    console.log(`✓ Generated data URI for ${file}`);
    console.log(`  Length: ${dataUri.length} characters`);
    console.log('');
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

// Create output file with all data URIs
const outputPath = path.join(__dirname, 'public', 'audios', 'audio-data-uris.js');
const outputContent = `// Generated audio data URIs
export const AUDIO_DATA_URIS = ${JSON.stringify(audioDataUris, null, 2)};

// Individual exports for each audio file
${Object.entries(audioDataUris).map(([name, uri]) => `export const ${name.toUpperCase()}_AUDIO_URI = '${uri}';`).join('\n')}
`;

fs.writeFileSync(outputPath, outputContent);
console.log(`✓ Generated audio data URIs file: ${outputPath}`);
console.log(`✓ Total files processed: ${Object.keys(audioDataUris).length}`); 