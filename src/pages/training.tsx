import { useState, useEffect } from 'react';
import { Save, Upload, Brain, Globe, Trash2, Loader2 } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
    if (!activeChatbot) {
      toast({
        title: 'Error',
        description: 'No active chatbot selected.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: {
          phone,
          whatsapp,
          website,
        },
      });
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
      {/* Sticky Glassmorphism Header */}
      <header className="backdrop-blur-md bg-gradient-to-br from-blue-50 to-white/80 border-b border-slate-200 px-6 py-5 sticky top-0 z-20 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tune AI</h2>
          <p className="text-slate-600 mt-1 text-base font-normal">Provide custom training data for "{activeChatbot.name}" & generate a flow</p>
        </div>
        <div className="flex gap-2 items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleSave} disabled={updateChatbot.isPending || processTrainingData.isPending} className="rounded-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all">
                {updateChatbot.isPending || processTrainingData.isPending ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {updateChatbot.isPending || processTrainingData.isPending ? 'Processing...' : 'Save'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save Training Data</TooltipContent>
          </Tooltip>
          <Tooltip>
            
            <TooltipContent>Generate AI-powered question flow from your training data</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Training Data Editor & Fetcher */}
          <div className="lg:col-span-2 space-y-8">
            {/* Training Data Editor */}
            <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-white border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <Brain className="h-6 w-6 text-blue-600" /> Training Content
                </CardTitle>
                <p className="text-sm text-slate-600">Add text content that will help your chatbot provide better, more accurate responses</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Button size="sm" variant="outline" className="rounded-full px-4 py-1 text-xs" onClick={() => addSampleData('faq')}>+ FAQ Sample</Button>
                    <Button size="sm" variant="outline" className="rounded-full px-4 py-1 text-xs" onClick={() => addSampleData('product')}>+ Product Info</Button>
                    <Button size="sm" variant="outline" className="rounded-full px-4 py-1 text-xs" onClick={() => addSampleData('company')}>+ Company Info</Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trainingData">Training Data</Label>
                    <Textarea
                      id="trainingData"
                      value={trainingData}
                      onChange={(e) => setTrainingData(e.target.value)}
                      placeholder="Enter your training content here... Include FAQs, product information, company policies, and any other relevant information that will help your chatbot provide better responses."
                      rows={18}
                      className="font-mono text-sm rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span>{typeof trainingData === 'string' ? trainingData.split(/\s+/).filter(word => word.length > 0).length + ' words' : 'N/A'}</span>
                    <span>{typeof trainingData === 'string' ? trainingData.length + ' characters' : 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* URL Content Fetcher */}
            <Card className="shadow-lg bg-gradient-to-br from-green-50 to-white border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <Globe className="h-6 w-6 text-green-600" /> Fetch Website Content
                </CardTitle>
                <p className="text-sm text-slate-600">Paste URLs (one per line) to fetch and add their content to your training data</p>
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
                      rows={4}
                      className="rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    />
                  </div>
                  <Button onClick={handleFetchUrls} disabled={fetchUrlContent.isPending || !urls.trim()} className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 shadow-md">
                    {fetchUrlContent.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    {fetchUrlContent.isPending ? 'Fetching...' : 'Fetch Content'}
                  </Button>
                  {fetchedContent.length > 0 && (
                    <div className="space-y-4 mt-4">
                      <Label className="font-semibold text-slate-700">Fetched Content</Label>
                      {fetchedContent.map((content, idx) => (
                        <Card key={idx} className="bg-white border border-slate-200 rounded-xl p-3 relative">
                          <Badge className="absolute top-2 right-2 bg-green-100 text-green-700">Source {idx + 1}</Badge>
                          <Button size="icon" variant="ghost" className="absolute top-2 left-2" onClick={() => removeFetchedContent(idx)} aria-label="Remove fetched content">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                          <div className="max-h-40 overflow-y-auto text-xs whitespace-pre-wrap break-all mt-2">
                            {content}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Info Inputs for AI Generation */}
            <Card className="mb-4 bg-slate-50 border border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-700">Contact Information for AI Flow</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input id="whatsapp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="e.g. +919876543210" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +911234567890" />
                </div>
                <div>
                  <Label htmlFor="website">Website URL</Label>
                  <Input id="website" value={website} onChange={e => setWebsite(e.target.value)} placeholder="e.g. https://yourdomain.com" />
                </div>
                <Button
                  onClick={handleSaveContactInfo}
                  disabled={updateChatbot.isPending}
                  className="mt-2 w-fit bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 shadow-md"
                >
                  {updateChatbot.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {updateChatbot.isPending ? 'Saving...' : 'Save Contact Details'}
                </Button>
              </CardContent>
            </Card>

            {/* Message to save contact info before generating flow */}
            <div className="mb-2 text-slate-600 text-sm text-center">
              <span className="font-semibold text-blue-700">Please save your contact details above before generating the AI question flow.</span>
            </div>

            {/* Generate Question Flow Button - now below contact info */}
            {/* Description above the button */}
            <div className="mb-2 text-slate-600 text-sm text-center">
              Generate a question flow for your chatbot using the information above. You can edit the result after generation.<br />
              <span className="text-xs text-slate-500">Note: Training data generation may take some time depending on the amount of data provided.</span>
            </div>
            <div className="mb-8">
              <Button
                onClick={handleGenerateFlow}
                disabled={isGeneratingFlow}
                className="w-full py-5 text-lg font-bold shadow-md bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all duration-150"
                style={{ letterSpacing: '0.02em' }}
              >
                {isGeneratingFlow ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Brain className="mr-3 h-5 w-5" />}
                Generate Question Flow (AI)
              </Button>
            </div>

            {/* Dedicated Question Flow Section */}
            <Card className="shadow bg-slate-50 border border-slate-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-700">
                  <Brain className="h-6 w-6 text-slate-400" /> Question Flow (Saved & Editable)
                </CardTitle>
                <p className="text-base text-slate-600 mt-2">
                  The question flow defines how your chatbot guides users through conversations. You can view the saved flow, edit it, and save changes.
                </p>
              </CardHeader>
              <CardContent>
                {/* Saved Flow */}
                
                {/* Editable Flow */}
                <div>
                  <div className="font-semibold text-slate-700 mb-1">Editable Flow</div>
                  <Textarea
                    value={editedFlow}
                    onChange={e => setEditedFlow(e.target.value)}
                    rows={16}
                    className="font-mono text-xs rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all mb-2 bg-white text-slate-700"
                    spellCheck={false}
                  />
                  {!isValidJson && (
                    <span className="font-semibold ml-2" style={{ color: '#b91c1c' }}>Invalid JSON</span>
                  )}
                  <Button
                    onClick={handleResetFlow}
                    disabled={editedFlow === JSON.stringify(questionFlow, null, 2)}
                    variant="outline"
                    className="rounded-full px-6 py-2 mt-2"
                  >
                    Reset to AI Output
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Lead Collection Toggle, Stats, Info */}
          <div className="space-y-8">
            <Card className="shadow bg-white/90 border-0 rounded-2xl flex flex-col items-center justify-center py-6">
              <div className="flex flex-col items-center gap-2">
                <span className="font-bold text-slate-700 text-base mb-1">Enable Lead Collection</span>
                <Switch
                  checked={leadCollectionEnabled}
                  onCheckedChange={checked => {
                    if (!toggleLoading) handleToggleLeadCollection(checked);
                  }}
                  disabled={toggleLoading}
                  className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300"
                  id="enableLeadCollection"
                />
                <span className="text-xs text-slate-500 text-center max-w-xs">
                  {leadCollectionEnabled
                    ? 'Lead collection is enabled. The chatbot will collect user contact info via a form and will not show direct contact details.'
                    : 'Direct contact info is enabled. The chatbot may show phone, WhatsApp, or website directly.'}
                </span>
              </div>
            </Card>
            <Card className="shadow bg-white/90 border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Brain className="h-5 w-5 text-green-600" /> Training Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-700">
                  <div><span className="font-semibold">Words:</span> {typeof trainingData === 'string' ? trainingData.split(/\s+/).filter(word => word.length > 0).length : 'N/A'}</div>
                  <div><span className="font-semibold">Characters:</span> {typeof trainingData === 'string' ? trainingData.length : 'N/A'}</div>
                  <div><span className="font-semibold">Fetched Sources:</span> {fetchedContent.length}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow bg-white/90 border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Info className="h-5 w-5 text-blue-500" /> Tips for Best Training Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                  <li>Include FAQs, product info, and company policies.</li>
                  <li>Keep answers clear and concise.</li>
                  <li>Use real customer questions and answers.</li>
                  <li>Update regularly as your business evolves.</li>
                  <li>Test responses in the chatbot after updating.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
