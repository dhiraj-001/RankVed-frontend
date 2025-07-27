import { useState, useEffect } from 'react';
import { Save, Upload, Brain, Globe, Trash2, Loader2, Volume2, Play, Pause, Settings, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/app-context';
import { useUpdateChatbot } from '@/hooks/use-chatbots';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// @ts-ignore
import { isEqual } from 'lodash-es';

export default function Training() {
  const { activeChatbot } = useApp();
  const updateChatbot = useUpdateChatbot();
  const { toast } = useToast();

  const [trainingData, setTrainingData] = useState(() => {
    const initial = activeChatbot?.trainingData || '';
    return initial;
  });
  const [urls, setUrls] = useState('');
  const [fetchedContent, setFetchedContent] = useState<string[]>([]);
  const [questionFlow, setQuestionFlow] = useState<any>(null);
  const [isGeneratingFlow, setIsGeneratingFlow] = useState(false);
  const [editedFlow, setEditedFlow] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [leadCollectionEnabled, setLeadCollectionEnabled] = useState(
    typeof activeChatbot?.leadCollectionEnabled === 'boolean' ? activeChatbot.leadCollectionEnabled : true
  );
  const [toggleLoading, setToggleLoading] = useState(false);

  // AI Provider Settings
  const [aiProvider, setAiProvider] = useState(activeChatbot?.aiProvider || 'platform');
  const [customApiKey, setCustomApiKey] = useState(activeChatbot?.customApiKey || '');

  // Popup Sound Settings
  const [popupSoundEnabled, setPopupSoundEnabled] = useState(activeChatbot?.popupSoundEnabled ?? true);
  const [popupSoundVolume, setPopupSoundVolume] = useState(activeChatbot?.popupSoundVolume ?? 50);
  const [customPopupSound, setCustomPopupSound] = useState(activeChatbot?.customPopupSound || '');
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  // Track changes for button states
  const [hasTrainingDataChanges, setHasTrainingDataChanges] = useState(false);
  const [hasContactChanges, setHasContactChanges] = useState(false);
  const [hasAiSettingsChanges, setHasAiSettingsChanges] = useState(false);
  const [hasSoundSettingsChanges, setHasSoundSettingsChanges] = useState(false);
  const [hasFlowChanges, setHasFlowChanges] = useState(false);

  // Log initial state
  useEffect(() => {
    console.log('[LeadCollection] Initial leadCollectionEnabled:', activeChatbot?.leadCollectionEnabled);
  }, []);

  // Sync leadCollectionEnabled with activeChatbot changes (like settings page)
  useEffect(() => {
    if (typeof activeChatbot?.leadCollectionEnabled === 'boolean') {
      setLeadCollectionEnabled(activeChatbot.leadCollectionEnabled);
      console.log('[LeadCollection] Updated from activeChatbot:', activeChatbot.leadCollectionEnabled);
    }
  }, [activeChatbot?.id]);

  // Sync AI provider and sound settings with activeChatbot changes
  useEffect(() => {
    if (activeChatbot) {
      setAiProvider(activeChatbot.aiProvider || 'platform');
      setCustomApiKey(activeChatbot.customApiKey || '');
      setPopupSoundEnabled(activeChatbot.popupSoundEnabled ?? true);
      setPopupSoundVolume(activeChatbot.popupSoundVolume ?? 50);
      setCustomPopupSound(activeChatbot.customPopupSound || '');
    }
  }, [activeChatbot]);

  // Track training data changes
  useEffect(() => {
    const originalData = activeChatbot?.plainData || '';
    setHasTrainingDataChanges(trainingData !== originalData);
  }, [trainingData, activeChatbot?.plainData]);

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
    const originalCustomSound = activeChatbot?.customPopupSound || '';
    setHasSoundSettingsChanges(
      popupSoundEnabled !== originalSoundEnabled ||
      popupSoundVolume !== originalSoundVolume ||
      customPopupSound !== originalCustomSound
    );
  }, [popupSoundEnabled, popupSoundVolume, customPopupSound, activeChatbot?.popupSoundEnabled, activeChatbot?.popupSoundVolume, activeChatbot?.customPopupSound]);

  // Track flow changes
  useEffect(() => {
    if (questionFlow && editedFlow) {
      try {
        const parsedEditedFlow = JSON.parse(editedFlow);
        setHasFlowChanges(!isEqual(parsedEditedFlow, questionFlow));
      } catch {
        setHasFlowChanges(true);
      }
    } else {
      setHasFlowChanges(false);
    }
  }, [editedFlow, questionFlow]);

  // Mutation for processing training data
  const processTrainingData = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/training/process', { content });
      return response.json();
    },
  });

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
      const soundUrl = customPopupSound || '/sounds/popup.mp3';
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
      if (!file.type.startsWith('audio/')) {
        toast({
          title: 'Invalid File',
          description: 'Please select an audio file (MP3, WAV, etc.)',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Sound file must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }

      // Convert to Data URI
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setCustomPopupSound(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear file input when custom sound is removed
  const clearCustomSound = () => {
    setCustomPopupSound('');
    // Clear the file input
    const fileInput = document.getElementById('customSound') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
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
          customPopupSound,
        },
      });
      setHasSoundSettingsChanges(false);
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

  const handleSave = async () => {
    if (!activeChatbot) {
      toast({
        title: 'Error',
        description: 'No active chatbot selected.',
        variant: 'destructive',
      });
      return;
    }

    let processed = { processed: false, wordCount: 0 };
    try {
      processed = await processTrainingData.mutateAsync(trainingData);
    } catch (error) {
      // Training data processing failed, saving anyway
    }

    try {
      // Save both plainData and trainingData (question flow)
      const parsedFlow = editedFlow ? JSON.parse(editedFlow) : null;
      // --- LOGGING: Log the data being saved ---
      console.log('[Training] Saving chatbot data:', {
        id: activeChatbot.id,
        plainData: trainingData,
        trainingData: parsedFlow,
      });
      const result = await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: {
          plainData: trainingData,
          trainingData: parsedFlow,
        },
      });
      // --- LOGGING: Log the result of the save operation ---
      console.log('[Training] Save result:', result);
      setHasTrainingDataChanges(false);
      setHasFlowChanges(false);
      toast({
        title: 'Saved',
        description: processed.processed
          ? `Successfully processed ${processed.wordCount} words of training data and saved question flow.`
          : 'Data saved (processing failed, but data is stored).',
      });
    } catch (error) {
      // --- LOGGING: Log the error encountered during saving ---
      console.error('[Training] Error saving chatbot data:', error);
      toast({
        title: 'Error',
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

    const newContent: string[] = [];
    
    for (const url of urlList) {
      try {
        const result = await fetchUrlContent.mutateAsync(url.trim());
        newContent.push(`\n\n--- Content from ${url} ---\n${result.content}`);
        
        toast({
          title: 'Content fetched',
          description: `Successfully fetched content from ${url}`,
        });
      } catch (error) {
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

  const removeFetchedContent = (index: number) => {
    const contentToRemove = fetchedContent[index];
    setFetchedContent(prev => prev.filter((_, i) => i !== index));
    setTrainingData(prev => prev.replace(contentToRemove, ''));
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
      // Load main training data from plainData
      setTrainingData(activeChatbot.plainData || '');
      
      // Load question flow from trainingData if it exists
      if (activeChatbot.trainingData && typeof activeChatbot.trainingData === 'object') {
        setQuestionFlow(activeChatbot.trainingData);
        setEditedFlow(JSON.stringify(activeChatbot.trainingData, null, 2));
      }
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

  // Save lead collection toggle handler
  const handleToggleLeadCollection = async (enabled: boolean) => {
    if (!activeChatbot) {
      toast({
        title: 'Error',
        description: 'No active chatbot selected.',
        variant: 'destructive',
      });
      return;
    }
    setToggleLoading(true);
    console.log('[LeadCollection] Toggling leadCollectionEnabled to:', enabled);
    try {
      await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: { leadCollectionEnabled: enabled },
      });
      setLeadCollectionEnabled(enabled); // Trust local state immediately
      console.log('[LeadCollection] Successfully updated leadCollectionEnabled to:', enabled);
      toast({
        title: 'Setting Saved',
        description: enabled
          ? 'Lead collection is enabled. Direct contact info will not be shown.'
          : 'Direct contact info is enabled. Lead collection is disabled.',
      });
    } catch (error) {
      console.error('[LeadCollection] Failed to update leadCollectionEnabled:', error);
      toast({
        title: 'Error',
        description: 'Failed to update setting. Please try again.',
        variant: 'destructive',
      });
    }
    setToggleLoading(false);
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
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Tune Ai</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button 
              onClick={handleSave} 
              disabled={updateChatbot.isPending || processTrainingData.isPending || (!hasTrainingDataChanges && !hasFlowChanges)}
              className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateChatbot.isPending || processTrainingData.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {updateChatbot.isPending || processTrainingData.isPending ? 'Saving...' : 'Save All'}
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
              disabled={updateChatbot.isPending || processTrainingData.isPending || (!hasTrainingDataChanges && !hasFlowChanges)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateChatbot.isPending || processTrainingData.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {updateChatbot.isPending || processTrainingData.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Training Data Editor */}
            <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm animate-in fade-in duration-700 ease-in-out">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600 transition-transform duration-500 ease-in-out" /> 
                  <span className="transition-all duration-500 ease-in-out">Training Content</span>
                </CardTitle>
                <p className="text-sm text-slate-600 transition-all duration-500 ease-in-out">Add content to help your chatbot provide better responses</p>
              </CardHeader>
              <CardContent>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trainingData">Training Data</Label>
                    <Textarea
                      id="trainingData"
                      value={trainingData}
                      onChange={(e) => setTrainingData(e.target.value)}
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" /> Fetch Website Content
                </CardTitle>
                <p className="text-sm text-slate-600">Paste URLs to fetch and add their content</p>
              </CardHeader>
              <CardContent>
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
                  <Button 
                    onClick={handleFetchUrls} 
                    disabled={fetchUrlContent.isPending || !urls.trim()} 
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fetchUrlContent.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    {fetchUrlContent.isPending ? 'Fetching...' : 'Fetch Content'}
                  </Button>
                  {fetchedContent.length > 0 && (
                    <div className="space-y-3">
                      <Label className="font-semibold">Fetched Content</Label>
                      {fetchedContent.map((content, idx) => (
                        <Card key={idx} className="bg-slate-50 border border-slate-200 p-3 relative">
                          <Badge className="absolute top-2 right-2 bg-blue-100 text-blue-700">Source {idx + 1}</Badge>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => removeFetchedContent(idx)}
                            className="absolute top-2 left-2 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                          <div className="max-h-32 overflow-y-auto text-xs whitespace-pre-wrap break-all mt-6">
                            {content}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-md animate-in fade-in duration-700 ease-in-out delay-100">
              <CardHeader>
                <CardTitle className="transition-all duration-500 ease-in-out">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600 transition-transform duration-500 ease-in-out" /> 
                  <span className="transition-all duration-500 ease-in-out">Question Flow</span>
                </CardTitle>
                <p className="text-sm text-slate-600 transition-all duration-500 ease-in-out">Edit the AI-generated question flow</p>
              </CardHeader>
              <CardContent>
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
                  <Button
                    onClick={handleResetFlow}
                    disabled={editedFlow === JSON.stringify(questionFlow, null, 2) || !questionFlow}
                    variant="outline"
                    size="sm"
                    className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 ease-in-out animate-in fade-in delay-400"
                  >
                    Reset to AI Output
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Settings */}
          <div className="space-y-6">
            {/* AI Provider Settings */}
            <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-md animate-in fade-in duration-700 ease-in-out">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4 text-blue-600 transition-transform duration-500 ease-in-out" /> 
                  <span className="transition-all duration-500 ease-in-out">AI Provider</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Volume2 className="h-4 w-4 text-blue-600 transition-transform duration-500 ease-in-out" /> 
                  <span className="transition-all duration-500 ease-in-out">Popup Sound</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    
                    <div className="space-y-2 animate-in fade-in duration-500 ease-in-out delay-500">
                      <Label htmlFor="customSound" className="text-sm">Custom Sound</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="customSound"
                          type="file"
                          accept="audio/*"
                          onChange={handleSoundFileChange}
                          className="text-xs transition-all duration-300 ease-in-out hover:border-blue-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200"
                        />
                        <Button
                          onClick={testSound}
                          disabled={!popupSoundEnabled}
                          size="sm"
                          variant="default"
                          className="hover:bg-blue-100 hover:border-blue-200 transition-colors shadow-sm border-blue-200 border bg-blue-50"
                        >
                          {isPlayingSound ? <Pause className="h-3 w-3 text-blue-600" /> : <Play className="h-3 w-3 text-blue-600" />}
                        </Button>
                      </div>
                      {customPopupSound && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs py-2">
                            Custom sound loaded
                          </Badge>
                          <Button
                            onClick={clearCustomSound}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 text-xs hover:bg-red-50 transition-colors rounded-md"
                          >
                            <Trash className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      )}
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

            {/* Lead Collection Toggle */}
            <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-3">
                  <span className="font-medium text-sm">Lead Collection</span>
                  <Switch
                    checked={leadCollectionEnabled}
                    onCheckedChange={checked => {
                      if (!toggleLoading) handleToggleLeadCollection(checked);
                    }}
                    disabled={toggleLoading}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <span className="text-xs text-slate-500 text-center">
                    {leadCollectionEnabled
                      ? 'Collect user contact info via form'
                      : 'Show direct contact details'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Training Stats */}
            <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-4 w-4 text-blue-600" /> Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Words:</span> {typeof trainingData === 'string' ? trainingData.split(/\s+/).filter(word => word.length > 0).length : 'N/A'}</div>
                  <div><span className="font-medium">Characters:</span> {typeof trainingData === 'string' ? trainingData.length : 'N/A'}</div>
                  <div><span className="font-medium">Sources:</span> {fetchedContent.length}</div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-4 w-4 text-blue-600" /> Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
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
    </TooltipProvider>
  );
}
