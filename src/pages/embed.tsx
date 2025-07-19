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
import { generateEmbedCode } from '@/lib/utils';
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
    { value: 'script', label: 'HTML Script' },
    { value: 'recommended-iframe', label: 'Recommended Iframe' },
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

  const embedCode = generateEmbedCode(activeChatbot.id);

  // Use backend URL from env for iframe src and script API
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const frontendUrl = window.location.origin;

  // Updated iframe embed code using VITE_API_URL

  // Improved React component for multi-widget support and cleanup, without duplicate checks
  // This is a string for user copy-paste, not for direct execution in this file
  const reactComponent = `import React, { useRef, useEffect } from 'react';

const ChatWidget = ({ chatbotId, style }) => {
  const containerIdRef = useRef('chatbot-widget-container-' + Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    window.CHATBOT_CONFIG = {
      chatbotId,
      apiUrl: '${backendUrl}'
    };

    // Load script and style only once globally
    if (!window.__rankvedChatEmbedScriptLoaded) {
      const script = document.createElement('script');
      script.src = '${frontendUrl}/chat-embed.js';
      script.async = true;
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '${frontendUrl}/chat-embed.css';
      document.head.appendChild(link);

      window.__rankvedChatEmbedScriptLoaded = true;
    }

    // Do not remove script or style on unmount to avoid duplicates

    return () => {
      // Only clean up CHATBOT_CONFIG on unmount
      delete window.CHATBOT_CONFIG;
    };
  }, [chatbotId]);

  return <div id={containerIdRef.current} style={style} />;
};

export default ChatWidget;

// Usage:
// <ChatWidget chatbotId='${activeChatbot.id}' style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }} />
`;

  // New recommended iframe embed code using /api/iframe/:chatbotId
  const recommendedIframeEmbed = `<iframe\n  src=\"${backendUrl}/api/iframe/${activeChatbot.id}\"\n  width=\"500\"\n  height=\"600\"\n  frameborder=\"0\"\n  allow=\"microphone; clipboard-write\"\n  loading=\"lazy\"\n  title=\"Chatbot\"\n  style=\"position: fixed; bottom: 20px; right: 20px; z-index: 1000; border-radius: 12px; background: #fff;\">\n</iframe>`;

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
        {/* Sticky Glassmorphism Header */}
        <header className="backdrop-blur-md bg-gradient-to-br from-blue-50 to-white/80 border-b border-slate-200 px-4 sm:px-6 py-5 sticky top-0 z-20 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto gap-4">
            <div className="flex items-center gap-3">
              <Code className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Embed Code</h2>
                <p className="text-slate-600 mt-1 text-sm sm:text-base">
                  Embed <span className="font-semibold">{activeChatbot.name}</span> on your website
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" asChild className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200">
                    <a href={`/chat/${activeChatbot.id}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Preview</span>
                      <span className="sm:hidden">Preview</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preview Chatbot</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" asChild className="border-green-200 text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200">
                    <a href={`/chat/${activeChatbot.id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">New Tab</span>
                      <span className="sm:hidden">New Tab</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open in New Tab</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
          {/* Chatbot Info Card */}
          <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-blue-50/60 via-white/80 to-blue-100/60 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-400 rounded-l-2xl" />
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="font-bold text-lg text-slate-900">Chatbot Information</span>
                </div>
                <Badge variant={activeChatbot.isActive ? "default" : "secondary"} className={`${activeChatbot.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'} border`}>
                  {activeChatbot.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs font-medium text-slate-600 mb-1">Chatbot Name</p>
                  <p className="text-base text-slate-900 font-semibold break-words">{activeChatbot.name}</p>
                </div>
                <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs font-medium text-slate-600 mb-1">Chatbot ID</p>
                  <p className="text-sm font-mono text-slate-900 break-all">{activeChatbot.id}</p>
                </div>
                <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs font-medium text-slate-600 mb-1">Primary Color</p>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded border-2 border-slate-200" style={{ backgroundColor: activeChatbot.primaryColor || '#6366F1' }} />
                    <p className="text-sm font-mono text-slate-900">{activeChatbot.primaryColor || '#6366F1'}</p>
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs font-medium text-slate-600 mb-1">Status</p>
                  <p className="text-sm text-slate-900 font-medium">
                    {activeChatbot.isActive ? 'Ready to Embed' : 'Not Active'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Warnings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Alert className="bg-yellow-50 border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm">
                <strong>Local Testing:</strong> The embed code will not work on localhost. Test on a deployed website or use the preview link above.
              </AlertDescription>
            </Alert>
            <Alert className="bg-green-50 border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm">
                <strong>HTTPS Required:</strong> For security reasons, the chat widget only works on HTTPS websites in production.
              </AlertDescription>
            </Alert>
          </div>

          {/* Embed Code Options */}
          <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-white/80 via-white/90 to-white/80 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-purple-400 rounded-l-2xl" />
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                <Code className="h-5 w-5 text-purple-600" />
                <span>Embed Options</span>
              </CardTitle>
              <p className="text-slate-600 text-sm">Choose the integration method that works best for your website</p>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                {/* Mobile Dropdown */}
                <div className="sm:hidden">
                  <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="w-full bg-white border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-lg shadow-sm">
                      <SelectValue placeholder="Select embed option" />
                    </SelectTrigger>
                    <SelectContent>
                      {tabOptions.map((tab) => (
                        <SelectItem key={tab.value} value={tab.value}>
                          {tab.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Desktop Tabs */}
                <TabsList className="hidden sm:grid w-full grid-cols-3 rounded-xl bg-slate-50 p-1">
                  <TabsTrigger value="script" className="transition-all text-sm">HTML Script</TabsTrigger>
                  <TabsTrigger value="recommended-iframe" className="transition-all text-sm">Recommended Iframe</TabsTrigger>
                  <TabsTrigger value="react" className="transition-all text-sm">React Component</TabsTrigger>
                </TabsList>

                {/* Script Tab */}
                <TabsContent value="script" className="space-y-4">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h3 className="font-medium text-slate-900">HTML Script Tag (Recommended)</h3>
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
                      Add this code before the closing &lt;/body&gt; tag on your website. This method provides the best performance and user experience.
                    </p>
                  </div>
                </TabsContent>

                {/* React Tab */}
                <TabsContent value="react" className="space-y-4">
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
                            className="transition-all border-purple-200 text-purple-700 hover:bg-purple-50"
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

                {/* Recommended Iframe Tab */}
                <TabsContent value="recommended-iframe" className="space-y-4">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h3 className="font-medium text-slate-900">Recommended HTML Iframe (Production)</h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(recommendedIframeEmbed, 'recommended-iframe')}
                            aria-label="Copy recommended iframe code"
                            className="transition-all border-green-200 text-green-700 hover:bg-green-50"
                          >
                            {copiedType === 'recommended-iframe' ? (
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600 animate-bounce" />
                            ) : (
                              <Copy className="h-4 w-4 mr-2" />
                            )}
                            {copiedType === 'recommended-iframe' ? 'Copied!' : 'Copy Code'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy Recommended Iframe Code</TooltipContent>
                      </Tooltip>
                    </div>
                    <Textarea
                      value={recommendedIframeEmbed}
                      readOnly
                      rows={8}
                      className="font-mono text-xs sm:text-sm bg-slate-50 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    />
                    <p className="text-xs sm:text-sm text-slate-600 mt-2">
                      This is the recommended way to embed your chatbot in production. It loads a minimal, robust HTML page for the widget.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Installation Instructions */}
          <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-green-50/60 via-white/80 to-green-100/60 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-green-400 rounded-l-2xl" />
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                <Zap className="h-5 w-5 text-green-600" />
                <span>Installation Instructions</span>
              </CardTitle>
              <p className="text-slate-600 text-sm">Follow these steps to embed your chatbot</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/60 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">1</span>
                    </div>
                    <h4 className="font-medium text-slate-900">Copy the Code</h4>
                  </div>
                  <p className="text-sm text-slate-600">
                    Copy the embed code from one of the tabs above that best suits your website platform.
                  </p>
                </div>

                <div className="bg-white/60 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">2</span>
                    </div>
                    <h4 className="font-medium text-slate-900">Add to Your Website</h4>
                  </div>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• HTML: Before &lt;/body&gt; tag</li>
                    <li>• WordPress: Footer.php or plugin</li>
                    <li>• Shopify: Theme.liquid file</li>
                    <li>• React: Import component</li>
                  </ul>
                </div>

                <div className="bg-white/60 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">3</span>
                    </div>
                    <h4 className="font-medium text-slate-900">Test</h4>
                  </div>
                  <p className="text-sm text-slate-600">
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
