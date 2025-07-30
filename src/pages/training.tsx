import { useState, useEffect } from 'react';
import { Save, Upload, Brain, Globe, Loader2, Volume2, Play, Pause, Settings, Trash, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/app-context';
import { useUpdateChatbot } from '@/hooks/use-chatbots';
import { useCustomSounds, type CustomSound } from '@/hooks/use-custom-sounds';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadFieldsManager } from '@/components/lead-fields-manager';
import { SoundSelector } from '@/components/sound-selector';
// @ts-ignore
import { isEqual } from 'lodash-es';

export default function Training() {
  const { activeChatbot } = useApp();
  const updateChatbot = useUpdateChatbot();
  const { toast } = useToast();
  const { data: customSounds = [], refetch: refetchCustomSounds } = useCustomSounds();

  const [trainingData, setTrainingData] = useState(() => {
    const initial = activeChatbot?.plainData || '';
    return initial;
  });
  const [urls, setUrls] = useState('');
  const [fetchedContent, setFetchedContent] = useState<string[]>([]);
  const [fetchingStates, setFetchingStates] = useState<{ [url: string]: 'idle' | 'fetching' | 'success' | 'error' }>({});
  const [fetchProgress, setFetchProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [questionFlow, setQuestionFlow] = useState<any>(null);
  const [isGeneratingFlow, setIsGeneratingFlow] = useState(false);
  const [editedFlow, setEditedFlow] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState(activeChatbot?.whatsapp || '');
  const [phone, setPhone] = useState(activeChatbot?.phone || '');
  const [website, setWebsite] = useState(activeChatbot?.website || '');

  // AI Provider Settings
  const [aiProvider, setAiProvider] = useState(activeChatbot?.aiProvider || 'platform');
  const [customApiKey, setCustomApiKey] = useState(activeChatbot?.customApiKey || '');

  // Popup Sound Settings
  const [popupSoundEnabled, setPopupSoundEnabled] = useState(activeChatbot?.popupSoundEnabled ?? true);
  const [popupSoundVolume, setPopupSoundVolume] = useState(activeChatbot?.popupSoundVolume ?? 50);
  const [selectedPopupSound, setSelectedPopupSound] = useState(activeChatbot?.customPopupSound || '/openclose.mp3');
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const [audioRefs, setAudioRefs] = useState<{ [key: string]: HTMLAudioElement }>({});

  // Popup Delay Settings
  const [chatBubblePopupDelay, setChatBubblePopupDelay] = useState(activeChatbot?.popupDelay ?? 3000);
  const [messagePopupDelay, setMessagePopupDelay] = useState(activeChatbot?.replyDelay ?? 1000);

  // Track changes for button states
  const [hasTrainingDataChanges, setHasTrainingDataChanges] = useState(false);
  const [hasContactChanges, setHasContactChanges] = useState(false);
  const [hasAiSettingsChanges, setHasAiSettingsChanges] = useState(false);
  const [hasSoundSettingsChanges, setHasSoundSettingsChanges] = useState(false);
  const [hasPopupDelayChanges, setHasPopupDelayChanges] = useState(false);
  const [hasFlowChanges, setHasFlowChanges] = useState(false);
  
  // Confirmation dialogs
  const [showDeleteTrainingDataDialog, setShowDeleteTrainingDataDialog] = useState(false);
  const [showDeleteQuestionFlowDialog, setShowDeleteQuestionFlowDialog] = useState(false);
  
  // Debounced change detection for training data
  const [debouncedTrainingData, setDebouncedTrainingData] = useState(trainingData);



  // Sync AI provider and sound settings with activeChatbot changes
  useEffect(() => {
    if (activeChatbot) {
      setAiProvider(activeChatbot.aiProvider || 'platform');
      setCustomApiKey(activeChatbot.customApiKey || '');
      setPopupSoundEnabled(activeChatbot.popupSoundEnabled ?? true);
      setPopupSoundVolume(activeChatbot.popupSoundVolume ?? 50);
      setSelectedPopupSound(activeChatbot.customPopupSound || '/openclose.mp3');
      setChatBubblePopupDelay(activeChatbot.popupDelay ?? 3000);
      setMessagePopupDelay(activeChatbot.replyDelay ?? 1000);
      
      // Refresh custom sounds when chatbot changes
      refetchCustomSounds();
    }
  }, [activeChatbot, refetchCustomSounds]);

  // Debounce training data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTrainingData(trainingData);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [trainingData]);

  // Track training data changes with debounced value
  useEffect(() => {
    const originalData = activeChatbot?.plainData || '';
    // Normalize whitespace for comparison to handle edge cases
    const normalizedTrainingData = debouncedTrainingData.trim();
    const normalizedOriginalData = originalData.trim();
    const hasChanges = normalizedTrainingData !== normalizedOriginalData;
    
    setHasTrainingDataChanges(hasChanges);
    console.log('[Training] Training data change detection:', {
      trainingDataLength: trainingData.length,
      debouncedTrainingDataLength: debouncedTrainingData.length,
      originalDataLength: originalData.length,
      normalizedTrainingDataLength: normalizedTrainingData.length,
      normalizedOriginalDataLength: normalizedOriginalData.length,
      hasChanges,
      trainingDataPreview: trainingData.substring(0, 50) + '...',
      originalDataPreview: originalData.substring(0, 50) + '...'
    });
  }, [debouncedTrainingData, activeChatbot?.plainData]);

  // Track contact info changes
  useEffect(() => {
    const originalWhatsapp = activeChatbot?.whatsapp || '';
    const originalPhone = activeChatbot?.phone || '';
    const originalWebsite = activeChatbot?.website || '';
    setHasContactChanges(
      whatsapp !== originalWhatsapp || 
      phone !== originalPhone || 
      website !== originalWebsite
    );
  }, [whatsapp, phone, website, activeChatbot?.whatsapp, activeChatbot?.phone, activeChatbot?.website]);

  // Track AI settings changes
  useEffect(() => {
    const originalAiProvider = activeChatbot?.aiProvider || 'platform';
    const originalApiKey = activeChatbot?.customApiKey || '';
    setHasAiSettingsChanges(
      aiProvider !== originalAiProvider || 
      customApiKey !== originalApiKey
    );
  }, [aiProvider, customApiKey, activeChatbot?.aiProvider, activeChatbot?.customApiKey]);

  // Track sound settings changes
  useEffect(() => {
    const originalSoundEnabled = activeChatbot?.popupSoundEnabled ?? true;
    const originalSoundVolume = activeChatbot?.popupSoundVolume ?? 50;
    const originalCustomSound = activeChatbot?.customPopupSound || '/openclose.mp3';
    setHasSoundSettingsChanges(
      popupSoundEnabled !== originalSoundEnabled ||
      popupSoundVolume !== originalSoundVolume ||
      selectedPopupSound !== originalCustomSound
    );
  }, [popupSoundEnabled, popupSoundVolume, selectedPopupSound, activeChatbot?.popupSoundEnabled, activeChatbot?.popupSoundVolume, activeChatbot?.customPopupSound]);

  // Track popup delay settings changes
  useEffect(() => {
    const originalChatBubbleDelay = activeChatbot?.popupDelay ?? 3000;
    const originalMessageDelay = activeChatbot?.replyDelay ?? 1000;
    setHasPopupDelayChanges(
      chatBubblePopupDelay !== originalChatBubbleDelay ||
      messagePopupDelay !== originalMessageDelay
    );
  }, [chatBubblePopupDelay, messagePopupDelay, activeChatbot?.popupDelay, activeChatbot?.replyDelay]);

  // Track flow changes
  useEffect(() => {
    if (questionFlow && editedFlow) {
      try {
        const parsedEditedFlow = JSON.parse(editedFlow);
        const hasChanges = !isEqual(parsedEditedFlow, questionFlow);
        setHasFlowChanges(hasChanges);
        console.log('[Training] Flow changes tracked:', { hasChanges, editedFlowLength: editedFlow.length, questionFlowKeys: Object.keys(questionFlow || {}) });
      } catch {
        // If JSON is invalid, consider it changed
        setHasFlowChanges(true);
        console.log('[Training] Flow changes tracked: Invalid JSON, marked as changed');
      }
    } else if (editedFlow && editedFlow.trim() !== '') {
      // If there's edited flow but no original flow, consider it changed
      setHasFlowChanges(true);
      console.log('[Training] Flow changes tracked: Has edited flow but no original flow');
    } else {
      setHasFlowChanges(false);
      console.log('[Training] Flow changes tracked: No changes');
    }
  }, [editedFlow, questionFlow]);



  // Mutation for fetching URL content
  const fetchUrlContent = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest('POST', '/api/training/fetch-url', { url });
      return response.json();
    },
  });

  // Mutation for generating question flow (AI)
  const generateQuestionFlow = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/training/generate', { content });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to generate question flow');
      }
      return response.json();
    },
  });

  // Sound testing function with pause support
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  
  const testSound = async () => {
    if (!popupSoundEnabled) {
      toast({
        title: 'Sound Disabled',
        description: 'Please enable popup sound first.',
        variant: 'destructive',
      });
      return;
    }

    // If already playing, pause it
    if (audioRef && !audioRef.paused) {
      audioRef.pause();
      setIsPlayingSound(false);
      return;
    }

    setIsPlayingSound(true);
    try {
      const soundUrl = selectedPopupSound || '/openclose.mp3';
      const audio = new Audio(soundUrl);
      
      // Set volume based on current volume setting
      audio.volume = popupSoundVolume / 100;
      
      // Store reference for pause functionality
      setAudioRef(audio);
      
      audio.onended = () => {
        setIsPlayingSound(false);
        setAudioRef(null);
      };
      
      audio.onerror = () => {
        setIsPlayingSound(false);
        setAudioRef(null);
        toast({
          title: 'Sound Error',
          description: 'Failed to play sound. Please check your sound file.',
          variant: 'destructive',
        });
      };
      
      await audio.play();
    } catch (error) {
      setIsPlayingSound(false);
      setAudioRef(null);
      toast({
        title: 'Sound Error',
        description: 'Failed to play sound.',
        variant: 'destructive',
      });
    }
  };

  // Update volume on existing audio if playing
  useEffect(() => {
    if (audioRef && !audioRef.paused) {
      audioRef.volume = popupSoundVolume / 100;
    }
  }, [popupSoundVolume, audioRef]);

  // Handle sound file upload
  const handleSoundFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/mpeg', 'audio/x-m4a'];
      if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(mp3|wav|ogg|m4a)$/)) {
        toast({
          title: 'Invalid File',
          description: 'Please select a supported audio file (MP3, WAV, OGG, M4A)',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 3MB)
      if (file.size > 3 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Sound file must be less than 3MB',
          variant: 'destructive',
        });
        return;
      }

      // Convert to Data URI
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setSelectedPopupSound(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear file input when custom sound is removed
  const clearCustomSound = () => {
    setSelectedPopupSound('/openclose.mp3');
    // Clear the file input
    const fileInput = document.getElementById('customSound') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Delete custom sound from database
  const handleDeleteCustomSound = async () => {
    try {
      // Remove the custom popup sound from the chatbot
      await updateChatbot.mutateAsync({
        id: activeChatbot!.id,
        data: {
          customPopupSound: '/openclose.mp3', // Reset to default
        },
      });
      
      setHasSoundSettingsChanges(true);
      toast({
        title: 'Sound deleted',
        description: 'Custom sound has been removed successfully.',
      });
      
      // Reset selected sound if it was the deleted one
      if (selectedPopupSound !== '/openclose.mp3') {
        setSelectedPopupSound('/openclose.mp3');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete custom sound. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Save AI provider settings
  const handleSaveAiSettings = async () => {
    if (!activeChatbot || !hasAiSettingsChanges) return;

    try {
      await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: {
          aiProvider,
          customApiKey: aiProvider === 'platform' ? '' : customApiKey,
        },
      });
      setHasAiSettingsChanges(false);
      toast({
        title: 'AI Settings Saved',
        description: 'AI provider settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save AI settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Save popup sound settings
  const handleSaveSoundSettings = async () => {
    if (!activeChatbot || !hasSoundSettingsChanges) return;

    try {
      await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: {
          popupSoundEnabled,
          popupSoundVolume,
          customPopupSound: selectedPopupSound,
        },
      });
      setHasSoundSettingsChanges(false);
      
      // Refresh custom sounds after saving
      refetchCustomSounds();
      
      toast({
        title: 'Sound Settings Saved',
        description: 'Popup sound settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save sound settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Save popup delay settings
  const handleSavePopupDelaySettings = async () => {
    if (!activeChatbot || !hasPopupDelayChanges) return;

    try {
      await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: {
          popupDelay: chatBubblePopupDelay,
          replyDelay: messagePopupDelay,
        },
      });
      setHasPopupDelayChanges(false);
      toast({
        title: 'Popup Delay Settings Saved',
        description: 'Popup delay settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save popup delay settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

    const handleSave = async () => {
    if (!activeChatbot) {
      toast({
        title: 'Error',
        description: 'No active chatbot selected.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Save both plainData and trainingData (question flow)
      const parsedFlow = editedFlow && editedFlow.trim() !== '' ? JSON.parse(editedFlow) : null;
      
      console.log('[Training] Saving chatbot data:', {
        id: activeChatbot.id,
        plainData: trainingData,
        trainingData: parsedFlow,
      });
      
      const result = await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: {
          plainData: trainingData,
          trainingData: parsedFlow ? JSON.stringify(parsedFlow) : undefined,
        },
      });
      
      console.log('[Training] Save result:', result);
      setHasTrainingDataChanges(false);
      setHasFlowChanges(false);
      
      // Show success message
      const wordCount = trainingData ? trainingData.split(/\s+/).filter(word => word.length > 0).length : 0;
      toast({
        title: 'Data Saved',
        description: `Training data (${wordCount} words) and question flow saved successfully.`,
      });
    } catch (error) {
      console.error('[Training] Error saving chatbot data:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFetchUrls = async () => {
    const urlList = urls.split('\n').filter(url => url.trim());
    
    if (urlList.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter at least one URL.',
        variant: 'destructive',
      });
      return;
    }

    // Initialize fetching states
    const initialStates: { [url: string]: 'idle' | 'fetching' | 'success' | 'error' } = {};
    urlList.forEach(url => {
      initialStates[url.trim()] = 'fetching';
    });
    setFetchingStates(initialStates);
    setFetchProgress({ current: 0, total: urlList.length });

    const newContent: string[] = [];
    
    for (let i = 0; i < urlList.length; i++) {
      const url = urlList[i].trim();
      setFetchProgress({ current: i + 1, total: urlList.length });
      
      try {
        const result = await fetchUrlContent.mutateAsync(url);
        newContent.push(`\n\n--- Content from ${url} ---\n${result.content}`);
        
        // Update state to success
        setFetchingStates(prev => ({ ...prev, [url]: 'success' }));
        
        toast({
          title: 'Content fetched',
          description: `Successfully fetched content from ${url}`,
        });
      } catch (error) {
        // Update state to error
        setFetchingStates(prev => ({ ...prev, [url]: 'error' }));
        
        toast({
          title: 'Fetch error',
          description: `Failed to fetch content from ${url}`,
          variant: 'destructive',
        });
      }
    }
    
    if (newContent.length > 0) {
      setFetchedContent(prev => [...prev, ...newContent]);
      setTrainingData(prev => prev + newContent.join(''));
      setUrls('');
    }
    
    // Reset progress after completion
    setTimeout(() => {
      setFetchProgress({ current: 0, total: 0 });
    }, 2000);
  };

  // Updated handler for generating question flow (AI)
  const handleGenerateFlow = async () => {
    setIsGeneratingFlow(true);
    try {
      if (!trainingData) {
        toast({
          title: 'Error',
          description: 'No training data to generate flow from.',
          variant: 'destructive',
        });
        setIsGeneratingFlow(false);
        return;
      }
      // Compose content with contact info (fields may be blank)
      const contactInfo = `\n\nContact Info:\nWhatsApp: ${whatsapp}\nPhone: ${phone}\nWebsite: ${website}`;
      const contentWithContact = trainingData + contactInfo;
      const result = await generateQuestionFlow.mutateAsync(contentWithContact);
      setQuestionFlow(result);
      setEditedFlow(JSON.stringify(result, null, 2));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate question flow',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingFlow(false);
    }
  };


  const addSampleData = (type: string) => {
    let sampleText = '';
    
    switch (type) {
      case 'faq':
        sampleText = `\n\nFREQUENTLY ASKED QUESTIONS:

Q: What are your business hours?
A: We're open Monday through Friday, 9 AM to 6 PM EST.

Q: How can I contact support?
A: You can reach our support team via email at support@company.com or through this chat.

Q: What is your return policy?
A: We offer a 30-day return policy for all products in original condition.

Q: Do you offer free shipping?
A: Yes, we offer free shipping on orders over $50.`;
        break;
        
      case 'product':
        sampleText = `\n\nPRODUCT INFORMATION:

Our main product is a comprehensive business management platform that helps companies:
- Streamline operations
- Manage customer relationships
- Track sales and analytics
- Automate workflows

Key features include:
- Real-time dashboard
- Mobile app access
- Integration with popular tools
- 24/7 customer support`;
        break;
        
      case 'company':
        sampleText = `\n\nCOMPANY INFORMATION:

We are a leading technology company founded in 2020. Our mission is to help businesses grow through innovative software solutions.

Our team consists of experienced professionals in:
- Software development
- Customer success
- Sales and marketing
- Product design

We serve over 1,000+ companies worldwide and are trusted by industry leaders.`;
        break;
    }
    
    setTrainingData(prev => prev + sampleText);
  };

  // When a new questionFlow is generated, update the editable textarea
  useEffect(() => {
    if (questionFlow) {
      setEditedFlow(JSON.stringify(questionFlow, null, 2));
    }
  }, [questionFlow]);

  // Sync backend data to frontend state when activeChatbot changes
  useEffect(() => {
    if (activeChatbot) {
      console.log('[Training] Syncing data from activeChatbot:', {
        id: activeChatbot.id,
        hasPlainData: !!activeChatbot.plainData,
        hasTrainingData: !!activeChatbot.trainingData,
        whatsapp: activeChatbot.whatsapp,
        phone: activeChatbot.phone,
        website: activeChatbot.website
      });
      
      // Load main training data from plainData
      setTrainingData(activeChatbot.plainData || '');
      
      // Load contact information
      setWhatsapp(activeChatbot.whatsapp || '');
      setPhone(activeChatbot.phone || '');
      setWebsite(activeChatbot.website || '');
      
      // Load question flow from trainingData if it exists
      if (activeChatbot.trainingData && activeChatbot.trainingData.trim() !== '') {
        try {
          // trainingData is stored as a JSON string, so we need to parse it
          const parsedTrainingData = typeof activeChatbot.trainingData === 'string' 
            ? JSON.parse(activeChatbot.trainingData) 
            : activeChatbot.trainingData;
          
          if (parsedTrainingData && typeof parsedTrainingData === 'object') {
            setQuestionFlow(parsedTrainingData);
            setEditedFlow(JSON.stringify(parsedTrainingData, null, 2));
            console.log('[Training] Loaded question flow from backend:', parsedTrainingData);
          } else {
            setQuestionFlow(null);
            setEditedFlow('');
            console.log('[Training] No valid question flow found in trainingData');
          }
        } catch (error) {
          console.error('[Training] Error parsing trainingData:', error);
          setQuestionFlow(null);
          setEditedFlow('');
        }
      } else {
        // Reset flow state if no training data
        setQuestionFlow(null);
        setEditedFlow('');
        console.log('[Training] No trainingData found in activeChatbot');
      }
      
      // Reset fetched content and states when chatbot changes
      setFetchedContent([]);
      setFetchingStates({});
      setFetchProgress({ current: 0, total: 0 });
      setUrls('');
    }
  }, [activeChatbot]);

  // Save the edited flow to the chatbot



  // Save training data to chatbot.plainData
 

  // Reset edits to the last AI output
  const handleResetFlow = () => {
    if (questionFlow) {
      setEditedFlow(JSON.stringify(questionFlow, null, 2));
    }
  };

  // Check if editedFlow is valid JSON
  let isValidJson = true;
  try {
    if (editedFlow) JSON.parse(editedFlow);
  } catch {
    isValidJson = false;
  }

  // Helper to compare flows

  // Ensure trainingData is a string for word/char count
 
  // Save contact info handler
  const handleSaveContactInfo = async () => {
    if (!activeChatbot || !hasContactChanges) return;
    
    try {
      await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: {
          phone,
          whatsapp,
          website,
        },
      });
      setHasContactChanges(false);
      toast({
        title: 'Contact Info Saved',
        description: 'Contact details have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save contact details. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Delete training data
  const handleDeleteTrainingData = async () => {
    if (!activeChatbot) return;
    
    try {
      await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: {
          plainData: '',
        },
      });
      setTrainingData('');
      setHasTrainingDataChanges(false);
      toast({
        title: 'Training Data Deleted',
        description: 'Training data has been cleared successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete training data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Delete question flow
  const handleDeleteQuestionFlow = async () => {
    if (!activeChatbot) return;
    
    try {
      await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: {
          trainingData: undefined,
        },
      });
      setQuestionFlow(null);
      setEditedFlow('');
      setHasFlowChanges(false);
      toast({
        title: 'Question Flow Deleted',
        description: 'Question flow has been cleared successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete question flow. Please try again.',
        variant: 'destructive',
      });
    }
  };


  if (typeof activeChatbot === 'undefined') {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white min-h-screen">
        <div className="text-center">
          <span className="text-2xl font-bold text-slate-900 mb-2">Loading...</span>
        </div>
      </div>
    );
  }
  if (!activeChatbot) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white min-h-screen">
        <div className="text-center">
          <Brain className="h-16 w-16 text-blue-200 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No Active Chatbot</h3>
          <p className="text-slate-500 mb-4">Please select a chatbot from the sidebar to manage its training data.</p>
          <Button asChild>
            <a href="/chatbots">Go to Chatbots</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      {/* Header */}
      <header className="hidden sm:block backdrop-blur-md bg-gradient-to-br from-blue-50 via-white to-white border-b border-blue-50 px-4 sm:px-6 py-2 sm:py-4 sticky top-0 z-20 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto gap-2 sm:gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Tune AI</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button 
              onClick={handleSave} 
              disabled={updateChatbot.isPending || (!hasTrainingDataChanges && !hasFlowChanges)}
              className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateChatbot.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {updateChatbot.isPending ? 'Saving...' : 'Save All'}
              {hasTrainingDataChanges && <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 text-xs">Data Changed</Badge>}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Training</h2>
          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              onClick={handleSave} 
              disabled={updateChatbot.isPending || (!hasTrainingDataChanges && !hasFlowChanges)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateChatbot.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {updateChatbot.isPending ? 'Saving...' : 'Save'}
              {hasTrainingDataChanges && <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700 text-xs">Changed</Badge>}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-6 max-w-7xl mx-auto bg-gradient-to-br min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Training Warnings - Moved to Top */}
            {(!trainingData || trainingData.trim() === '') && (
              <Card className="border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50/30 shadow-md animate-in fade-in duration-500 ease-in-out">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base text-amber-700">
                    <Info className="h-4 w-4 text-amber-600" /> Training Data Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3">
                    <p className="text-sm text-amber-700">
                      Your chatbot needs training data to provide meaningful responses. Add content to help it understand your business and answer questions effectively.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => addSampleData('faq')}
                        className="hover:bg-amber-100 hover:border-amber-300 text-amber-700"
                      >
                        + Add FAQ
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => addSampleData('product')}
                        className="hover:bg-amber-100 hover:border-amber-300 text-amber-700"
                      >
                        + Add Product Info
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => addSampleData('company')}
                        className="hover:bg-amber-100 hover:border-amber-300 text-amber-700"
                      >
                        + Add Company Info
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question Flow Warning - Moved to Top */}
            {(!questionFlow || Object.keys(questionFlow || {}).length === 0) && trainingData && trainingData.trim() !== '' && (
              <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/30 shadow-md animate-in fade-in duration-500 ease-in-out">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base text-blue-700">
                    <Brain className="h-4 w-4 text-blue-600" /> Question Flow Missing
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3">
                    <p className="text-sm text-blue-700">
                      You have training data but no question flow. Generate a question flow to create structured conversations and improve user experience.
                    </p>
                    <Button 
                      onClick={handleGenerateFlow}
                      disabled={isGeneratingFlow || !trainingData.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      size="sm"
                    >
                      {isGeneratingFlow ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                      {isGeneratingFlow ? 'Generating...' : 'Generate Question Flow'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Training Data Editor */}
            <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm animate-in fade-in duration-700 ease-in-out">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600 transition-transform duration-500 ease-in-out" /> 
                  <span className="transition-all duration-500 ease-in-out">Training Content</span>
                </CardTitle>
                <p className="text-sm text-slate-600 transition-all duration-500 ease-in-out">Add content to help your chatbot provide better responses</p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => addSampleData('faq')}
                      className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      + FAQ
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => addSampleData('product')}
                      className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      + Product Info
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => addSampleData('company')}
                      className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      + Company Info
                    </Button>
                    {trainingData && trainingData.trim() !== '' && (
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => setShowDeleteTrainingDataDialog(true)}
                        className="hover:bg-red-50 hover:border-red-200 transition-colors"
                      >
                        <Trash className="h-3 w-3 mr-1" />
                        Clear Data
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trainingData">Training Data</Label>
                    <Textarea
                      id="trainingData"
                      value={trainingData}
                      onChange={(e) => setTrainingData(e.target.value)}
                      onPaste={(e) => {
                        // Force re-evaluation of changes after paste
                        setTimeout(() => {
                          const pastedData = e.clipboardData.getData('text');
                          const newTrainingData = trainingData + pastedData;
                          const originalData = activeChatbot?.plainData || '';
                          const hasChanges = newTrainingData.trim() !== originalData.trim();
                          setHasTrainingDataChanges(hasChanges);
                          console.log('[Training] Paste detected:', {
                            pastedDataLength: pastedData.length,
                            newTrainingDataLength: newTrainingData.length,
                            hasChanges
                          });
                        }, 0);
                      }}
                      placeholder="Enter your training content here..."
                      rows={16}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{typeof trainingData === 'string' ? trainingData.split(/\s+/).filter(word => word.length > 0).length + ' words' : 'N/A'}</span>
                    <span>{typeof trainingData === 'string' ? trainingData.length + ' characters' : 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* URL Content Fetcher */}
            <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-md">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" /> Fetch Website Content
                </CardTitle>
                <p className="text-sm text-slate-600">Paste URLs to fetch and add their content</p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="urls">Website URLs</Label>
                    <Textarea
                      id="urls"
                      value={urls}
                      onChange={(e) => setUrls(e.target.value)}
                      placeholder="https://example.com/about\nhttps://example.com/faq"
                      rows={3}
                    />
                  </div>

                  {/* Fetch Progress */}
                  {fetchProgress.total > 0 && (
                    <div className="space-y-2 animate-in fade-in duration-300 ease-in-out">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Fetching Progress</span>
                        <span className="text-slate-600">{fetchProgress.current}/{fetchProgress.total} URLs</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                          style={{ width: `${(fetchProgress.current / fetchProgress.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* URL Status List */}
                  {Object.keys(fetchingStates).length > 0 && (
                    <div className="space-y-2 animate-in fade-in duration-300 ease-in-out">
                      <Label className="text-sm font-medium">URL Status</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {Object.entries(fetchingStates).map(([url, status]) => (
                          <div key={url} className="flex items-center gap-2 p-2 rounded-md border bg-slate-50">
                            <div className={`w-2 h-2 rounded-full ${
                              status === 'fetching' ? 'bg-blue-500 animate-pulse' :
                              status === 'success' ? 'bg-green-500' :
                              status === 'error' ? 'bg-red-500' : 'bg-slate-300'
                            }`}></div>
                            <span className="text-xs text-slate-600 flex-1 truncate">{url}</span>
                            <Badge variant="secondary" className={`text-xs ${
                              status === 'fetching' ? 'bg-blue-100 text-blue-700' :
                              status === 'success' ? 'bg-green-100 text-green-700' :
                              status === 'error' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {status === 'fetching' ? 'Fetching...' :
                               status === 'success' ? 'Success' :
                               status === 'error' ? 'Failed' : 'Idle'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleFetchUrls} 
                    disabled={fetchUrlContent.isPending || !urls.trim()} 
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fetchUrlContent.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    {fetchUrlContent.isPending ? 'Fetching...' : 'Fetch Content'}
                  </Button>

                
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-md animate-in fade-in duration-700 ease-in-out delay-100">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="transition-all duration-500 ease-in-out">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="animate-in fade-in duration-500 ease-in-out delay-200">
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input id="whatsapp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+919876543210" className="transition-all duration-300 ease-in-out hover:border-blue-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200" />
                </div>
                <div className="animate-in fade-in duration-500 ease-in-out delay-300">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+911234567890" className="transition-all duration-300 ease-in-out hover:border-blue-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200" />
                </div>
                <div className="animate-in fade-in duration-500 ease-in-out delay-400">
                  <Label htmlFor="website">Website URL</Label>
                  <Input id="website" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourdomain.com" className="transition-all duration-300 ease-in-out hover:border-blue-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200" />
                </div>
                <Button 
                  onClick={handleSaveContactInfo} 
                  disabled={updateChatbot.isPending || !hasContactChanges}
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed animate-in fade-in  delay-500"
                >
                  {updateChatbot.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2 transition-transform duration-300 ease-in-out" />}
                  {updateChatbot.isPending ? 'Saving...' : 'Save Contact Details'}
                </Button>
              </CardContent>
            </Card>

            {/* Generate Flow Button */}
            <div className="text-center">
              <Button
                onClick={handleGenerateFlow}
                disabled={isGeneratingFlow || !trainingData.trim()}
                className="w-full py-4 text-lg font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingFlow ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Brain className="mr-3 h-5 w-5" />}
                Generate Question Flow (AI)
              </Button>
            </div>

            {/* Question Flow Editor */}
            <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-md animate-in fade-in duration-700 ease-in-out delay-200">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600 transition-transform duration-500 ease-in-out" /> 
                  <span className="transition-all duration-500 ease-in-out">Question Flow</span>
                </CardTitle>
                <p className="text-sm text-slate-600 transition-all duration-500 ease-in-out">Edit the AI-generated question flow</p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                                  <div className="space-y-2 animate-in fade-in duration-500 ease-in-out delay-300">
                    <Label>Flow JSON</Label>
                    <Textarea
                      value={editedFlow}
                      onChange={e => setEditedFlow(e.target.value)}
                      rows={12}
                      className="font-mono text-xs transition-all duration-300 ease-in-out hover:border-blue-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200"
                      spellCheck={false}
                    />
                    {!isValidJson && (
                      <span className="text-red-600 text-sm animate-in fade-in duration-300 ease-in-out">Invalid JSON</span>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleResetFlow}
                        disabled={editedFlow === JSON.stringify(questionFlow, null, 2) || !questionFlow}
                        variant="outline"
                        size="sm"
                        className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 ease-in-out animate-in fade-in delay-400"
                      >
                        Reset to AI Output
                      </Button>
                      {questionFlow && Object.keys(questionFlow).length > 0 && (
                        <Button
                          onClick={() => setShowDeleteQuestionFlowDialog(true)}
                          variant="destructive"
                          size="sm"
                          className="hover:bg-red-50 hover:border-red-200 transition-all duration-300 ease-in-out animate-in fade-in delay-400"
                        >
                          <Trash className="h-3 w-3 mr-1" />
                          Delete Flow
                        </Button>
                      )}
                    </div>
                  </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Settings */}
          <div className="space-y-4 sm:space-y-6">
            {/* AI Provider Settings */}
            <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-md animate-in fade-in duration-700 ease-in-out">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4 text-blue-600 transition-transform duration-500 ease-in-out" /> 
                  <span className="transition-all duration-500 ease-in-out">AI Provider</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2 animate-in fade-in duration-500 ease-in-out delay-100">
                  <Label htmlFor="aiProvider">Provider</Label>
                  <Select value={aiProvider} onValueChange={setAiProvider}>
                    <SelectTrigger className="transition-all duration-300 ease-in-out">
                      <SelectValue placeholder="Select AI provider" />
                    </SelectTrigger>
                    <SelectContent className="animate-in fade-in duration-500 ease-in-out">
                      <SelectItem value="platform" className="transition-all duration-300 ease-in-out hover:bg-blue-50">Platform AI</SelectItem>
                      <SelectItem value="openai" className="transition-all duration-300 ease-in-out hover:bg-blue-50">OpenAI GPT</SelectItem>
                      <SelectItem value="google" className="transition-all duration-300 ease-in-out hover:bg-blue-50">Google Gemini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {aiProvider !== 'platform' && (
                  <div className="space-y-2 animate-in fade-in duration-500 ease-in-out delay-200">
                    <Label htmlFor="customApiKey">API Key</Label>
                    <Input
                      id="customApiKey"
                      type="password"
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      placeholder={`Enter ${aiProvider} API key`}
                      className="transition-all duration-300 ease-in-out hover:border-blue-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200"
                    />
                  </div>
                )}
                
                <Button
                  onClick={handleSaveAiSettings}
                  disabled={updateChatbot.isPending || !hasAiSettingsChanges}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed animate-in fade-in delay-300"
                  size="sm"
                >
                  {updateChatbot.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2 transition-transform duration-300 ease-in-out" />}
                  Save AI Settings
                </Button>
              </CardContent>
            </Card>

            {/* Popup Sound Settings */}
            <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-md animate-in fade-in duration-700 ease-in-out delay-200">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Volume2 className="h-4 w-4 text-blue-600 transition-transform duration-500 ease-in-out" /> 
                  <span className="transition-all duration-500 ease-in-out">Popup Sound</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between animate-in fade-in duration-500 ease-in-out delay-300">
                  <Label htmlFor="popupSoundEnabled" className="text-sm font-medium">Enable Sound</Label>
                  <Switch
                    id="popupSoundEnabled"
                    checked={popupSoundEnabled}
                    onCheckedChange={setPopupSoundEnabled}
                    className="data-[state=checked]:bg-blue-600 transition-all duration-300 ease-in-out"
                  />
                </div>
                
                {popupSoundEnabled && (
                  <>
                    <div className="space-y-2 animate-in fade-in duration-500 ease-in-out delay-400">
                      <Label htmlFor="popupSoundVolume" className="text-sm">Volume</Label>
                      <div className="flex items-center gap-3">
                        <input
                          id="popupSoundVolume"
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={popupSoundVolume}
                          onChange={(e) => setPopupSoundVolume(Number(e.target.value))}
                          className="flex-1 accent-blue-500 cursor-pointer transition-all duration-300 ease-in-out"
                        />
                        <span className="text-sm font-medium w-8">{popupSoundVolume}%</span>
                      </div>
                    </div>
                    
                    {/* Sound Selection Options */}
                    <div className="space-y-4 animate-in fade-in duration-500 ease-in-out delay-500">
                      <Label className="text-sm font-medium">Sound Selection</Label>
                      <div className="space-y-4">
                      
                      {/* Option 1: Pre-built Sounds */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <span className="text-sm font-medium">Choose from Pre-built Sounds</span>
                        </div>
                        <SoundSelector
                          selectedSound={selectedPopupSound}
                          onSoundSelect={setSelectedPopupSound}
                          title="Select from Available Sounds"
                          description="Choose from our collection of notification sounds"
                          volume={popupSoundVolume}
                        />
                      </div>
                      
                      {/* Option 2: Custom Sounds from Database */}
                      {customSounds.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                            <span className="text-sm font-medium">Previously Uploaded Sounds</span>
                          </div>
                          <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                            {customSounds.map((sound: CustomSound) => (
                              <div
                                key={sound.id}
                                className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                                  selectedPopupSound === sound.soundUrl
                                    ? 'bg-purple-100 border border-purple-300'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                                onClick={() => {
                                  setSelectedPopupSound(sound.soundUrl);
                                  // Update the chatbot's custom popup sound
                                  if (activeChatbot) {
                                    updateChatbot.mutate({
                                      id: activeChatbot.id,
                                      data: {
                                        customPopupSound: sound.soundUrl,
                                      },
                                    }, {
                                      onSuccess: () => {
                                        setHasSoundSettingsChanges(true);
                                        toast({
                                          title: 'Sound Selected',
                                          description: `${sound.name} has been set as the popup sound.`,
                                        });
                                      },
                                      onError: () => {
                                        toast({
                                          title: 'Error',
                                          description: 'Failed to update sound setting.',
                                          variant: 'destructive',
                                        });
                                      }
                                    });
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="text-xs font-medium text-gray-700 truncate">
                                    {sound.name}
                                  </span>
                                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs flex-shrink-0">
                                    <span className="hidden sm:inline">Database</span>
                                    <span className="sm:hidden">DB</span>
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      
                                      // If this sound is already playing, pause it
                                      if (playingSoundId === sound.id && audioRefs[sound.id]) {
                                        audioRefs[sound.id].pause();
                                        setPlayingSoundId(null);
                                        return;
                                      }
                                      
                                      // Stop any currently playing sound
                                      if (playingSoundId && audioRefs[playingSoundId]) {
                                        audioRefs[playingSoundId].pause();
                                      }
                                      
                                      try {
                                        const audio = new Audio(sound.soundUrl);
                                        audio.volume = popupSoundVolume / 100;
                                        
                                        // Set up event listeners
                                        audio.onended = () => {
                                          setPlayingSoundId(null);
                                        };
                                        
                                        audio.onerror = () => {
                                          setPlayingSoundId(null);
                                          toast({
                                            title: 'Playback Error',
                                            description: 'Could not play the sound. Please check the file format.',
                                            variant: 'destructive',
                                          });
                                        };
                                        
                                        // Store audio reference and play
                                        setAudioRefs(prev => ({ ...prev, [sound.id]: audio }));
                                        setPlayingSoundId(sound.id);
                                        
                                        audio.play().catch((error) => {
                                          console.error('Error playing sound:', error);
                                          setPlayingSoundId(null);
                                          toast({
                                            title: 'Playback Error',
                                            description: 'Could not play the sound. Please check the file format.',
                                            variant: 'destructive',
                                          });
                                        });
                                      } catch (error) {
                                        console.error('Error creating audio:', error);
                                        setPlayingSoundId(null);
                                        toast({
                                          title: 'Audio Error',
                                          description: 'Invalid sound file format.',
                                          variant: 'destructive',
                                        });
                                      }
                                    }}
                                    className="h-6 w-6 p-0 hover:bg-purple-200"
                                  >
                                    {playingSoundId === sound.id ? (
                                      <Pause className="h-3 w-3 text-purple-600" />
                                    ) : (
                                      <Play className="h-3 w-3 text-purple-600" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCustomSound();
                                    }}
                                    className="h-6 w-6 p-0 hover:bg-red-200 text-red-600"
                                  >
                                    <Trash className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Option 3: Custom Upload */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                          <span className="text-sm font-medium">Upload Custom Sound</span>
                        </div>
                        <p className="text-xs text-slate-500">Sound file must be less than 3MB. Supported formats: MP3, WAV, OGG, M4A</p>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <Input
                            id="customSound"
                            type="file"
                            accept="audio/*"
                            onChange={handleSoundFileChange}
                            className="text-xs transition-all duration-300 ease-in-out hover:border-blue-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 flex-1"
                          />
                          <Button
                            onClick={testSound}
                            disabled={!popupSoundEnabled}
                            size="sm"
                            variant="default"
                            className="hover:bg-blue-100 hover:border-blue-200 transition-colors shadow-sm border-blue-200 border bg-blue-50 flex-shrink-0"
                          >
                            {isPlayingSound ? <Pause className="h-3 w-3 text-blue-600" /> : <Play className="h-3 w-3 text-blue-600" />}
                          </Button>
                        </div>
                        {selectedPopupSound && selectedPopupSound !== '/openclose.mp3' && selectedPopupSound.startsWith('data:') && (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs py-2">
                              <span className="hidden sm:inline">Custom sound loaded</span>
                              <span className="sm:hidden">Custom loaded</span>
                            </Badge>
                            <Button
                              onClick={clearCustomSound}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 text-xs hover:bg-red-50 transition-colors rounded-md flex-shrink-0"
                            >
                              <Trash className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        )}
                      </div>
                      </div>
                    </div>
                  </>
                )}
                
                <Button
                  onClick={handleSaveSoundSettings}
                  disabled={updateChatbot.isPending || !hasSoundSettingsChanges}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="sm"
                >
                  {updateChatbot.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Sound Settings
                </Button>
              </CardContent>
            </Card>

            {/* Popup Delay Settings */}
            <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-md animate-in fade-in duration-700 ease-in-out delay-300">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Timer className="h-4 w-4 text-blue-600 transition-transform duration-500 ease-in-out" /> 
                  <span className="transition-all duration-500 ease-in-out">Popup Timing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2 animate-in fade-in duration-500 ease-in-out delay-100">
                  <Label htmlFor="chatBubblePopupDelay" className="text-sm">Chat Bubble Popup Delay</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[3, 5, 7, 9].map((seconds) => (
                      <Button
                        key={seconds}
                        variant={chatBubblePopupDelay === seconds * 1000 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChatBubblePopupDelay(seconds * 1000)}
                        className={`transition-all duration-300 ease-in-out ${
                          chatBubblePopupDelay === seconds * 1000 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "hover:bg-blue-50 hover:border-blue-200"
                        }`}
                      >
                        {seconds}s
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Delay before showing the chat bubble</p>
                </div>
                
                <div className="space-y-2 animate-in fade-in duration-500 ease-in-out delay-200">
                  <Label htmlFor="messagePopupDelay" className="text-sm">Message Reply Delay</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((seconds) => (
                      <Button
                        key={seconds}
                        variant={messagePopupDelay === seconds * 1000 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMessagePopupDelay(seconds * 1000)}
                        className={`transition-all duration-300 ease-in-out ${
                          messagePopupDelay === seconds * 1000 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "hover:bg-blue-50 hover:border-blue-200"
                        }`}
                      >
                        {seconds}s
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Delay before showing bot messages</p>
                </div>
                
                <Button
                  onClick={handleSavePopupDelaySettings}
                  disabled={updateChatbot.isPending || !hasPopupDelayChanges}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed animate-in fade-in delay-300"
                  size="sm"
                >
                  {updateChatbot.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2 transition-transform duration-300 ease-in-out" />}
                  Save Timing Settings
                </Button>
              </CardContent>
            </Card>

            {/* Lead Collection Fields Manager */}
            <div className="animate-in fade-in duration-500 ease-in-out delay-400">
              <LeadFieldsManager chatbotId={activeChatbot.id} />
            </div>

                                  {/* Training Stats */}
              <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-md">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Brain className="h-4 w-4 text-blue-600" /> Training Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Words:</span> {typeof trainingData === 'string' ? trainingData.split(/\s+/).filter(word => word.length > 0).length : 'N/A'}</div>
                      <div><span className="font-medium">Characters:</span> {typeof trainingData === 'string' ? trainingData.length : 'N/A'}</div>
                      <div><span className="font-medium">Sources:</span> {fetchedContent.length}</div>
                      <div><span className="font-medium">URLs Fetched:</span> {Object.values(fetchingStates).filter(status => status === 'success').length}</div>
                    </div>
                    
                    {/* URL States Summary */}
                    {Object.keys(fetchingStates).length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <div className="text-sm font-medium text-slate-700">URL Fetch Status</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.values(fetchingStates).filter(status => status === 'success').length > 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              {Object.values(fetchingStates).filter(status => status === 'success').length} Success
                            </Badge>
                          )}
                          {Object.values(fetchingStates).filter(status => status === 'error').length > 0 && (
                            <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                              {Object.values(fetchingStates).filter(status => status === 'error').length} Failed
                            </Badge>
                          )}
                          {Object.values(fetchingStates).filter(status => status === 'fetching').length > 0 && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                              {Object.values(fetchingStates).filter(status => status === 'fetching').length} Fetching
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>            

            {/* Tips */}
            <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-md">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-4 w-4 text-blue-600" /> Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                  <li>Include FAQs and product info</li>
                  <li>Keep answers clear and concise</li>
                  <li>Use real customer questions</li>
                  <li>Update regularly</li>
                  <li>Test responses after updating</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Training Data Confirmation Dialog */}
      {showDeleteTrainingDataDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-red-700 mb-4">Delete Training Data</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete all training data? This action cannot be undone and will remove all the content that helps your chatbot provide responses.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteTrainingDataDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteTrainingData();
                  setShowDeleteTrainingDataDialog(false);
                }}
              >
                Delete Training Data
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Question Flow Confirmation Dialog */}
      {showDeleteQuestionFlowDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-red-700 mb-4">Delete Question Flow</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the question flow? This action cannot be undone and will remove all the structured conversation flows for your chatbot.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteQuestionFlowDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteQuestionFlow();
                  setShowDeleteQuestionFlowDialog(false);
                }}
              >
                Delete Question Flow
              </Button>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}
