import { useState } from 'react';
import { Save, Upload, Brain, Globe, FileText, Trash2, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/app-context';
import { useUpdateChatbot } from '@/hooks/use-chatbots';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export default function Training() {
  const { activeChatbot } = useApp();
  const updateChatbot = useUpdateChatbot();
  const { toast } = useToast();

  const [trainingData, setTrainingData] = useState(activeChatbot?.trainingData || '');
  const [urls, setUrls] = useState('');
  const [fetchedContent, setFetchedContent] = useState<string[]>([]);

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
      // Process the training data before saving
      const processed = await processTrainingData.mutateAsync(trainingData);
      
      if (processed.processed) {
        await updateChatbot.mutateAsync({
          id: activeChatbot.id,
          data: { trainingData },
        });
        
        toast({
          title: 'Training data saved',
          description: `Successfully processed ${processed.wordCount} words of training data.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save training data. Please try again.',
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

  if (!activeChatbot) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-white min-h-screen">
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
      <header className="backdrop-blur-md bg-white/80 border-b border-slate-200 px-6 py-5 sticky top-0 z-20 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Training Data</h2>
          <p className="text-slate-600 mt-1 text-base font-normal">Provide custom training data for "{activeChatbot.name}" to enhance AI responses</p>
        </div>
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
                    <span>{trainingData.split(/\s+/).filter(word => word.length > 0).length} words</span>
                    <span>{trainingData.length} characters</span>
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
          </div>

          {/* Sidebar: Quick Actions, Stats, Info */}
          <div className="space-y-8">
            <Card className="shadow bg-white/90 border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <FileText className="h-5 w-5 text-blue-600" /> Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Button size="sm" variant="outline" className="rounded-full px-4 py-1 text-xs" onClick={() => addSampleData('faq')}>Add FAQ Sample</Button>
                  <Button size="sm" variant="outline" className="rounded-full px-4 py-1 text-xs" onClick={() => addSampleData('product')}>Add Product Info</Button>
                  <Button size="sm" variant="outline" className="rounded-full px-4 py-1 text-xs" onClick={() => addSampleData('company')}>Add Company Info</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow bg-white/90 border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Brain className="h-5 w-5 text-green-600" /> Training Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-700">
                  <div><span className="font-semibold">Words:</span> {trainingData.split(/\s+/).filter(word => word.length > 0).length}</div>
                  <div><span className="font-semibold">Characters:</span> {trainingData.length}</div>
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
