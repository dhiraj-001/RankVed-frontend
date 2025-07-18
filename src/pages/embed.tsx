import { useState } from 'react';
import { Copy, Code, Eye, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/app-context';
import { generateEmbedCode } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bot } from 'lucide-react';

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

  if (!activeChatbot) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-white min-h-screen">
        <div className="text-center">
          <Bot className="h-16 w-16 text-blue-200 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No Active Chatbot</h3>
          <p className="text-slate-500 mb-4">Please select a chatbot from the sidebar to get its embed code.</p>
          <Button asChild>
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
      {/* Sticky Glassmorphism Header */}
      <header className="backdrop-blur-md bg-white/80 border-b border-slate-200 px-6 py-5 sticky top-0 z-20 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Embed Code</h2>
          <p className="text-slate-600 mt-1 text-base font-normal">Embed "{activeChatbot.name}" on your website</p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" asChild className="rounded-full px-4 py-2">
                <a href={`/chat/${activeChatbot.id}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-5 w-5 mr-2" /> Preview
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Preview Chatbot</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" asChild className="rounded-full px-4 py-2">
                <a href={`/chat/${activeChatbot.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-5 w-5 mr-2" /> New Tab
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open in New Tab</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Chatbot Info Card */}
        <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-white border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-bold text-lg">Chatbot Information</span>
              </div>
              <Badge variant={activeChatbot.isActive ? "default" : "secondary"} className={activeChatbot.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}>
                {activeChatbot.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-medium text-slate-600">Chatbot Name</p>
                <p className="text-base text-slate-900 font-semibold">{activeChatbot.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600">Chatbot ID</p>
                <p className="text-base font-mono text-slate-900">{activeChatbot.id}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600">Primary Color</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded border" style={{ backgroundColor: activeChatbot.primaryColor || '#6366F1' }} />
                  <p className="text-base font-mono text-slate-900">{activeChatbot.primaryColor}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Warnings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <AlertDescription>
              <strong>Local Testing:</strong> The embed code will not work on localhost. Test on a deployed website or use the preview link above.
            </AlertDescription>
          </Alert>
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription>
              <strong>HTTPS Required:</strong> For security reasons, the chat widget only works on HTTPS websites in production.
            </AlertDescription>
          </Alert>
        </div>

        {/* Embed Code Options */}
        <Card className="shadow-lg rounded-2xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Code className="h-6 w-6 text-blue-600" /> Embed Options
            </CardTitle>
            <p className="text-sm text-slate-600">Choose the integration method that works best for your website</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="script" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 rounded-xl bg-slate-50">
                <TabsTrigger value="script" className="transition-all">HTML Script</TabsTrigger>
                <TabsTrigger value="recommended-iframe" className="transition-all">Recommended Iframe</TabsTrigger>
                <TabsTrigger value="react" className="transition-all">React Component</TabsTrigger>

              </TabsList>

              {/* Script Tab */}
              <TabsContent value="script" className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">HTML Script Tag (Recommended)</h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(embedCode, 'script')}
                          aria-label="Copy script code"
                          className="transition-all"
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
                    rows={15}
                    className="font-mono text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-slate-600 mt-2">
                    Add this code before the closing &lt;/body&gt; tag on your website. This method provides the best performance and user experience.
                  </p>
                </div>
              </TabsContent>

              {/* React Tab */}
              <TabsContent value="react" className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">React Component</h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(reactComponent, 'react')}
                          aria-label="Copy React code"
                          className="transition-all"
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
                    rows={15}
                    className="font-mono text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-slate-600 mt-2">
                    Use this React component to embed the chatbot in your React app. Make sure to include the script and CSS as shown.
                  </p>
                </div>
              </TabsContent>

              {/* Recommended Iframe Tab */}
              <TabsContent value="recommended-iframe" className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Recommended HTML Iframe (Production)</h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(recommendedIframeEmbed, 'recommended-iframe')}
                          aria-label="Copy recommended iframe code"
                          className="transition-all"
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
                    rows={10}
                    className="font-mono text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-slate-600 mt-2">
                    This is the recommended way to embed your chatbot in production. It loads a minimal, robust HTML page for the widget.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Installation Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Installation Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Step 1: Copy the Code</h4>
                <p className="text-sm text-slate-600">
                  Copy the embed code from one of the tabs above.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Step 2: Add to Your Website</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• For HTML websites: Paste before the closing &lt;/body&gt; tag</li>
                  <li>• For WordPress: Add to your theme's footer.php or use a code injection plugin</li>
                  <li>• For Shopify: Add to your theme's theme.liquid file</li>
                  <li>• For React: Import and render the component</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Step 3: Test</h4>
                <p className="text-sm text-slate-600">
                  Visit your website and look for the chat bubble in the bottom-right corner.
                  Click it to test the chatbot functionality.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customization Options */}
        <Card>
          <CardHeader>
            <CardTitle>Customization Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Current Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-slate-600">Position</p>
                    <p className="text-slate-900">{activeChatbot.bubblePosition || 'bottom-right'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-600">Offsets</p>
                    <p className="text-slate-900">
                      H: {activeChatbot.horizontalOffset || 20}px, V: {activeChatbot.verticalOffset || 20}px
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-600">Welcome Message</p>
                    <p className="text-slate-900">{activeChatbot.welcomeMessage || 'Hello! How can I help you today?'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-600">Powered By</p>
                    <p className="text-slate-900">{activeChatbot.poweredByText || 'None'}</p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  To customize these settings, go to the <strong>Settings</strong> or <strong>Appearance</strong> pages.
                  Changes will automatically apply to your embedded chatbot.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Render the chat widget at the end of the page */}
     
    </TooltipProvider>
  );
}
