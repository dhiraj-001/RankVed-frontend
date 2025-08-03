import { useState } from 'react';
import { Copy, Code, Eye, ExternalLink, AlertTriangle, CheckCircle, Bot,Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/app-context';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Add these types and window extensions at the top of the file

declare global {
  interface Window {
    CHATBOT_CONFIG?: any;
    initRankVedChat?: () => void;
  }
}


export default function Embed() {
  const { activeChatbot } = useApp();
  const { toast } = useToast();
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('script');

  const tabOptions = [
   
    { value: 'script', label: 'Full Config' },
    { value: 'iframe', label: 'Iframe' },
    { value: 'react', label: 'React Component' }
  ];

  if (!activeChatbot) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white min-h-screen">
        <div className="text-center px-4">
          <Bot className="h-16 w-16 text-blue-200 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No Active Chatbot</h3>
          <p className="text-slate-500 mb-4">Please select a chatbot from the sidebar to get its embed code.</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
            <a href="/chatbots">Go to Chatbots</a>
          </Button>
        </div>
      </div>
    );
  }

  // Use backend URL from env for API endpoints
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Generate simple embed code
  const embedCode = `<script>
window.RankVedChatbotConfig = {
    chatbotId: '${activeChatbot.id}',
    apiUrl: '${backendUrl}'
};
</script>
<script src="${window.location.origin}/chatbot-loader.js"></script>`;


  // React component for the new optimized system
  const reactComponent = `import { useEffect } from 'react';

const ChatWidget = ({ chatbotId, config = {} }) => {
  useEffect(() => {
    // Use same URL pattern as embed page
    const backendUrl = '${backendUrl}';
    const frontendUrl = '${window.location.origin}';
    
    // Set configuration
    window.RankVedChatbotConfig = {
      chatbotId,
      apiUrl: config.apiUrl || backendUrl,
      frontendUrl: config.frontendUrl || frontendUrl,
      ...config
    };
    
    // Load chatbot script
    const script = document.createElement('script');
    script.src = \`\${window.RankVedChatbotConfig.frontendUrl}/chatbot-loader.js\`;
    document.head.appendChild(script);
    
    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="chatbot-loader.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [chatbotId, config]);

  return null;
};

export default ChatWidget;

// <ChatWidget chatbotId={${activeChatbot.id}} config={{}} />
`;

  // Iframe embed code with dynamic positioning from database
  const bubblePosition = activeChatbot.bubblePosition || 'bottom-right';
  const horizontalOffset = activeChatbot.horizontalOffset || 20;
  const verticalOffset = activeChatbot.verticalOffset || 20;
  
  // Calculate position based on bubblePosition setting
  let positionStyle = '';
  switch (bubblePosition) {
    case 'bottom-left':
      positionStyle = `bottom: ${verticalOffset}px; left: ${horizontalOffset}px;`;
      break;
    case 'top-right':
      positionStyle = `top: ${verticalOffset}px; right: ${horizontalOffset}px;`;
      break;
    case 'top-left':
      positionStyle = `top: ${verticalOffset}px; left: ${horizontalOffset}px;`;
      break;
    case 'bottom-right':
    default:
      positionStyle = `bottom: ${verticalOffset}px; right: ${horizontalOffset}px;`;
      break;
  }

  const iframeEmbedCode = `<iframe
  src="${backendUrl}/api/iframe/${activeChatbot.id}"
  style="position: fixed; ${positionStyle} width: 100%; height: 100%; border: none; border-radius: 16px;  z-index: 9999;"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  title="RankVed Chatbot">
</iframe>`;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
      toast({
        title: 'Copied to clipboard',
        description: 'The embed code has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy to clipboard. Please select and copy manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-white min-h-screen">
        {/* Header */}
        <header className="hidden sm:block backdrop-blur-md bg-gradient-to-br from-blue-50 via-white to-white border-b border-blue-50 px-4 sm:px-6 py-2 sm:py-4 sticky top-0 z-20 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto gap-2 sm:gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Embed Code</h2>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" asChild className="px-3 py-1.5 border-blue-200 text-blue-700 hover:bg-blue-50">
                    <a href={`${backendUrl}/api/iframe/${activeChatbot.id}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Preview</span>
                      <span className="sm:hidden">Preview</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preview Chatbot</TooltipContent>
              </Tooltip>
              
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Embed Code</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <a href={`${backendUrl}/api/iframe/${activeChatbot.id}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <a href={`${backendUrl}/api/iframe/${activeChatbot.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  New Tab
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
          {/* Chatbot Info Card */}
          <Card className="shadow-md rounded-lg border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="font-bold text-lg text-gray-900">Chatbot Information</span>
                </div>
                <Badge variant={activeChatbot.isActive ? "default" : "secondary"} className={`${activeChatbot.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'} border`}>
                  {activeChatbot.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs font-medium text-blue-600 mb-1">Chatbot Name</p>
                  <p className="text-base text-gray-900 font-semibold break-words">{activeChatbot.name}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs font-medium text-blue-600 mb-1">Chatbot ID</p>
                  <p className="text-sm font-mono text-gray-900 break-all">{activeChatbot.id}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs font-medium text-blue-600 mb-1">Primary Color</p>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded border-2 border-blue-200" style={{ backgroundColor: activeChatbot.primaryColor || '#6366F1' }} />
                    <p className="text-sm font-mono text-gray-900">{activeChatbot.primaryColor || '#6366F1'}</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs font-medium text-blue-600 mb-1">Status</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {activeChatbot.isActive ? 'Ready to Embed' : 'Not Active'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Warnings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Alert className="bg-gray-50 border-gray-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-gray-600" />
              <AlertDescription className="text-sm">
                <strong>Local Testing:</strong> The embed code will not work on localhost. Test on a deployed website or use the preview link above.
              </AlertDescription>
            </Alert>
            <Alert className="bg-gray-50 border-gray-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-gray-600" />
              <AlertDescription className="text-sm">
                <strong>HTTPS Required:</strong> For security reasons, the chat widget only works on HTTPS websites in production.
              </AlertDescription>
            </Alert>
          </div>
          
          {/* Simplified Embed Notice */}
          <Alert className="bg-blue-50 border-blue-200 rounded-lg">
            <Zap className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm">
              <strong>Simplified Setup:</strong> The chatbot now automatically detects your backend URL. You only need to provide the chatbot ID - no need to specify the API URL manually!
            </AlertDescription>
          </Alert>

          {/* Embed Code Options */}
          <Card className="shadow-md rounded-lg border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                <Code className="h-5 w-5 text-blue-600" />
                <span>Embed Options</span>
              </CardTitle>
              <p className="text-gray-600 text-sm">Choose the integration method that works best for your website</p>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                {/* Mobile Dropdown */}
                <div className="sm:hidden shadow-md">
                  <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="w-full bg-white border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg shadow-sm transition-all duration-500 ease-in-out">
                      <SelectValue placeholder="Select embed option" />
                    </SelectTrigger>
                    <SelectContent className="animate-in fade-in duration-700 ease-in-out">
                      {tabOptions.map((tab) => (
                        <SelectItem key={tab.value} value={tab.value} className="transition-all duration-300 hover:bg-blue-50">
                          {tab.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Desktop Tabs */}
                <TabsList className="hidden sm:flex w-full bg-white border border-gray-200 rounded-lg p-1 shadow-sm transition-all duration-500 ease-in-out">
                  
                  <TabsTrigger 
                    value="script" 
                    className="flex-1 text-gray-600 hover:text-gray-800 focus:text-gray-800 font-medium py-3 px-4 rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-500 ease-in-out hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-2 transition-all duration-500 ease-in-out">
                      <Code className="h-4 w-4 transition-transform duration-500 ease-in-out data-[state=active]:scale-110" />
                      <span className="transition-all duration-500 ease-in-out">Full Config</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="iframe" 
                    className="flex-1 text-gray-600 hover:text-gray-800 focus:text-gray-800 font-medium py-3 px-4 rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-500 ease-in-out hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-2 transition-all duration-500 ease-in-out">
                      <Eye className="h-4 w-4 transition-transform duration-500 ease-in-out data-[state=active]:scale-110" />
                      <span className="transition-all duration-500 ease-in-out">Iframe</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="react" 
                    className="flex-1 text-gray-600 hover:text-gray-800 focus:text-gray-800 font-medium py-3 px-4 rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-500 ease-in-out hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-2 transition-all duration-500 ease-in-out">
                      <Zap className="h-4 w-4 transition-transform duration-500 ease-in-out data-[state=active]:scale-110" />
                      <span className="transition-all duration-500 ease-in-out">React</span>
                    </div>
                  </TabsTrigger>
                </TabsList>

              
            
                {/* Script Tab */}
                <TabsContent value="script" className="space-y-4 animate-in fade-in duration-700 ease-in-out">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h3 className="font-medium text-slate-900">Full Configuration Embed</h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(embedCode, 'script')}
                            aria-label="Copy script code"
                            className="transition-all border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            {copiedType === 'script' ? (
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600 animate-bounce" />
                            ) : (
                              <Copy className="h-4 w-4 mr-2" />
                            )}
                            {copiedType === 'script' ? 'Copied!' : 'Copy Code'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy Script Code</TooltipContent>
                      </Tooltip>
                    </div>
                    <Textarea
                      value={embedCode}
                      readOnly
                      rows={12}
                      className="font-mono text-xs sm:text-sm bg-slate-50 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                    <p className="text-xs sm:text-sm text-slate-600 mt-2">
                      Full configuration with all customization options. Add this code before the closing &lt;/body&gt; tag on your website.
                    </p>
                  </div>
                </TabsContent>

                {/* React Tab */}
                <TabsContent value="react" className="space-y-4 animate-in fade-in duration-700 ease-in-out">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h3 className="font-medium text-slate-900">React Component</h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(reactComponent, 'react')}
                            aria-label="Copy React code"
                            className="transition-all border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            {copiedType === 'react' ? (
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600 animate-bounce" />
                            ) : (
                              <Copy className="h-4 w-4 mr-2" />
                            )}
                            {copiedType === 'react' ? 'Copied!' : 'Copy Code'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy React Code</TooltipContent>
                      </Tooltip>
                    </div>
                    <Textarea
                      value={reactComponent}
                      readOnly
                      rows={12}
                      className="font-mono text-xs sm:text-sm bg-slate-50 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    />
                    <p className="text-xs sm:text-sm text-slate-600 mt-2">
                      Use this React component to embed the chatbot in your React app. Make sure to include the script and CSS as shown.
                    </p>
                  </div>
                </TabsContent>

                {/* Iframe Tab */}
                <TabsContent value="iframe" className="space-y-4 animate-in fade-in duration-700 ease-in-out">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h3 className="font-medium text-slate-900">Iframe Embed</h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(iframeEmbedCode, 'iframe')}
                            aria-label="Copy iframe code"
                            className="transition-all border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            {copiedType === 'iframe' ? (
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600 animate-bounce" />
                            ) : (
                              <Copy className="h-4 w-4 mr-2" />
                            )}
                            {copiedType === 'iframe' ? 'Copied!' : 'Copy Code'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy Iframe Code</TooltipContent>
                      </Tooltip>
                    </div>
                    <Textarea
                      value={iframeEmbedCode}
                      readOnly
                      rows={8}
                      className="font-mono text-xs sm:text-sm bg-slate-50 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    />
                    <p className="text-xs sm:text-sm text-slate-600 mt-2">
                      Embed the chatbot as an iframe. This method provides complete isolation but may have some limitations with styling.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Installation Instructions */}
          <Card className="shadow-md rounded-lg border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                <Zap className="h-5 w-5 text-blue-600" />
                <span>Installation Instructions</span>
              </CardTitle>
              <p className="text-gray-600 text-sm">Follow these steps to embed your chatbot</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Copy the Code</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Copy the embed code from one of the tabs above that best suits your website platform.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Add to Your Website</h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• HTML: Before &lt;/body&gt; tag</li>
                    <li>• WordPress: Footer.php or plugin</li>
                    <li>• Shopify: Theme.liquid file</li>
                    <li>• React: Import component</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Test</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Visit your website and look for the chat bubble in the bottom-right corner. Click it to test the chatbot functionality.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customization Options */}
          {/* <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-orange-50/60 via-white/80 to-orange-100/60 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-400 rounded-l-2xl" />
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                <Settings className="h-5 w-5 text-orange-600" />
                <span>Customization Options</span>
              </CardTitle>
              <p className="text-slate-600 text-sm">Current settings for your embedded chatbot</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/60 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="h-4 w-4 text-orange-600" />
                      <p className="font-medium text-slate-900 text-sm">Position</p>
                    </div>
                    <p className="text-slate-600 text-sm">{activeChatbot.bubblePosition || 'bottom-right'}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="h-4 w-4 text-orange-600" />
                      <p className="font-medium text-slate-900 text-sm">Offsets</p>
                    </div>
                    <p className="text-slate-600 text-sm">
                      H: {activeChatbot.horizontalOffset || 20}px, V: {activeChatbot.verticalOffset || 20}px
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-orange-600" />
                      <p className="font-medium text-slate-900 text-sm">Welcome Message</p>
                    </div>
                    <p className="text-slate-600 text-sm break-words">{activeChatbot.welcomeMessage || 'Hello! How can I help you today?'}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-orange-600" />
                      <p className="font-medium text-slate-900 text-sm">Powered By</p>
                    </div>
                    <p className="text-slate-600 text-sm">{activeChatbot.poweredByText || 'None'}</p>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200 rounded-lg">
                  <AlertDescription className="text-sm">
                    To customize these settings, go to the <strong>Settings</strong> or <strong>Appearance</strong> pages.
                    Changes will automatically apply to your embedded chatbot.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </TooltipProvider>
  );
}
