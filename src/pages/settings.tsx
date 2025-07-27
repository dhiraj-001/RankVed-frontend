import { useState } from 'react';
import { Save, Key, MessageSquare, Webhook, Eye, EyeOff, Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/app-context';
import { useUpdateChatbot } from '@/hooks/use-chatbots';
// import {  compressAndConvertToDataURI } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Switch } from '@/components/ui/switch';

export default function Settings() {
  const { activeChatbot } = useApp();
  const updateChatbot = useUpdateChatbot();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [showApiKey, setShowApiKey] = useState(false);

  const [settings, setSettings] = useState({
    // Basic Configuration
    name: activeChatbot?.name || '',
    aiSystemPrompt: activeChatbot?.aiSystemPrompt || '',
    

    
    // Branding
    chatWindowAvatar: activeChatbot?.chatWindowAvatar || '',
    chatBubbleIcon: activeChatbot?.chatBubbleIcon || '',
    
    // Messaging
    welcomeMessage: activeChatbot?.welcomeMessage || '',
    showWelcomePopup: activeChatbot?.showWelcomePopup ?? true,
    
    // Notifications
    popupSoundEnabled: activeChatbot?.popupSoundEnabled ?? true,
    customPopupSound: activeChatbot?.customPopupSound || '',
    
    // Integrations
    leadsWebhookUrl: activeChatbot?.leadsWebhookUrl || '',
    
    // Flow & Branding
    businessType: activeChatbot?.businessType || 'general',
    poweredByText: activeChatbot?.poweredByText || '',
    poweredByLink: activeChatbot?.poweredByLink || '',
    
    // Placement
    bubblePosition: activeChatbot?.bubblePosition || 'bottom-right',
    horizontalOffset: activeChatbot?.horizontalOffset || 20,
    verticalOffset: activeChatbot?.verticalOffset || 20,
    
    // Lead Collection
    leadCollectionEnabled: activeChatbot?.leadCollectionEnabled ?? true,
    
    // AI Provider
    aiProvider: activeChatbot?.aiProvider || 'platform',
    customApiKey: activeChatbot?.customApiKey || '',
    
    // Usage Limits
    dailyChatLimit: activeChatbot?.dailyChatLimit || 100,
    monthlyChatLimit: activeChatbot?.monthlyChatLimit || 1000,
  });

  // Sync settings state with activeChatbot changes
  useEffect(() => {
    if (activeChatbot) {
      console.log('[Settings] Syncing with activeChatbot:', {
        showWelcomePopup: activeChatbot.showWelcomePopup,
        welcomeMessage: activeChatbot.welcomeMessage,
        popupSoundEnabled: activeChatbot.popupSoundEnabled,
        chatbotId: activeChatbot.id
      });
      
      setSettings({
        name: activeChatbot.name || '',
        aiSystemPrompt: activeChatbot.aiSystemPrompt || '',
        chatWindowAvatar: activeChatbot.chatWindowAvatar || '',
        chatBubbleIcon: activeChatbot.chatBubbleIcon || '',
        welcomeMessage: activeChatbot.welcomeMessage || '',
        showWelcomePopup: activeChatbot.showWelcomePopup ?? true,
        popupSoundEnabled: activeChatbot.popupSoundEnabled ?? true,
        customPopupSound: activeChatbot.customPopupSound || '',
        leadsWebhookUrl: activeChatbot.leadsWebhookUrl || '',
        businessType: activeChatbot.businessType || 'general',
        poweredByText: activeChatbot.poweredByText || '',
        poweredByLink: activeChatbot.poweredByLink || '',
        bubblePosition: activeChatbot.bubblePosition || 'bottom-right',
        horizontalOffset: activeChatbot.horizontalOffset || 20,
        verticalOffset: activeChatbot.verticalOffset || 20,
        leadCollectionEnabled: activeChatbot.leadCollectionEnabled ?? true,
        aiProvider: activeChatbot.aiProvider || 'platform',
        customApiKey: activeChatbot.customApiKey || '',
        dailyChatLimit: activeChatbot.dailyChatLimit || 100,
        monthlyChatLimit: activeChatbot.monthlyChatLimit || 1000,
      });
    }
  }, [activeChatbot]);

  const handleSave = async () => {
    if (!activeChatbot) {
      toast({
        title: 'Error',
        description: 'No active chatbot selected.',
        variant: 'destructive',
      });
      return;
    }

    console.log('[Settings] Saving settings to backend:', {
      chatbotId: activeChatbot.id,
      showWelcomePopup: settings.showWelcomePopup,
      welcomeMessage: settings.welcomeMessage,
      popupSoundEnabled: settings.popupSoundEnabled,
      allSettings: settings
    });

    try {
      const result = await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: {
          ...settings,
        },
      });
      
      console.log('[Settings] Backend response:', {
        showWelcomePopup: result.showWelcomePopup,
        welcomeMessage: result.welcomeMessage,
        success: true
      });
      
      toast({
        title: 'Settings saved',
        description: 'Your chatbot settings have been updated successfully.',
      });
    } catch (error) {
      console.error('[Settings] Error saving to backend:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // const handleFileUpload = async (field: string, file: File) => {
  //   try {
  //     // Compress and convert image (same as appearance page)
  //     const dataUri = await compressAndConvertToDataURI(file, 128, 128, 0.7);
  //     // Check size after compression (base64 length * 3/4 for bytes)
  //     const byteSize = Math.floor(base64Length * 3 / 4);
  //     if (byteSize > 1024 * 1024) { // 1MB limit
  //       toast({
  //         title: 'Error',
  //         description: 'Image is too large after compression. Please upload an image under 1MB.',
  //         variant: 'destructive',
  //       });
  //       return;
  //     }
  //     setSettings(prev => ({ ...prev, [field]: dataUri }));
  //   } catch (error) {
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to upload or compress file. Please try again.',
  //       variant: 'destructive',
  //     });
  //   }
  // };

  if (!activeChatbot) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Chatbot</h3>
          <p className="text-gray-600">Please select a chatbot from the sidebar to configure its settings.</p>
        </div>
      </div>
    );
  }

  const tabOptions = [
    { value: 'basic', label: 'Basic' },
    { value: 'messaging', label: 'Messaging' },
    // { value: 'leads', label: 'Lead Collection' },
    { value: 'integrations', label: 'Integrations' },
    // { value: 'ai-provider', label: 'AI Provider' },
    // { value: 'limits', label: 'Limits' },
  ];

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      {/* Header */}
      <header className="hidden sm:block backdrop-blur-md bg-gradient-to-br from-blue-50 via-white to-white border-b border-blue-50 px-4 sm:px-6 py-2 sm:py-4 sticky top-0 z-20 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto gap-2 sm:gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Chatbot Settings</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={updateChatbot.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1.5"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateChatbot.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Settings</h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateChatbot.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5"
            >
              <Save className="h-4 w-4 mr-1" />
              {updateChatbot.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile Dropdown */}
          <div className="sm:hidden shadow-md">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full bg-white border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg shadow-sm transition-all duration-500 ease-in-out">
                <SelectValue placeholder="Select a tab">{tabOptions.find(tab => tab.value === activeTab)?.label || 'Select a tab'}</SelectValue>
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
          <TabsList className="hidden sm:flex w-full bg-gradient-to-r from-blue-50 to-gray-50 border border-gray-200 rounded-lg p-1 shadow-md transition-all duration-500 ease-in-out">
            <TabsTrigger
              value="basic"
              className="flex-1 text-gray-600 hover:text-gray-800 focus:text-gray-800 font-medium py-3 px-4 rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-500 ease-in-out hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2 transition-all duration-500 ease-in-out">
                <SettingsIcon className="h-4 w-4 transition-transform duration-500 ease-in-out data-[state=active]:scale-110" />
                <span className="transition-all duration-500 ease-in-out">Basic</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="messaging"
              className="flex-1 text-gray-600 hover:text-gray-800 focus:text-gray-800 font-medium py-3 px-4 rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-500 ease-in-out hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2 transition-all duration-500 ease-in-out">
                <MessageSquare className="h-4 w-4 transition-transform duration-500 ease-in-out data-[state=active]:scale-110" />
                <span className="transition-all duration-500 ease-in-out">Messaging</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className="flex-1 text-gray-600 hover:text-gray-800 focus:text-gray-800 font-medium py-3 px-4 rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-500 ease-in-out hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2 transition-all duration-500 ease-in-out">
                <Webhook className="h-4 w-4 transition-transform duration-500 ease-in-out data-[state=active]:scale-110" />
                <span className="transition-all duration-500 ease-in-out">Integrations</span>
              </div>
            </TabsTrigger>
            
          </TabsList>

          <TabsContent value="basic" className="space-y-6 animate-in fade-in duration-700 ease-in-out">
            <Card className="shadow-md rounded-lg border border-gray-200 bg-white p-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span>Basic Configuration</span>
                </CardTitle>
                <p className="text-gray-600 text-sm">Set up your chatbot's core identity and behavior</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                                      <Label htmlFor="name" className="text-gray-700 font-medium">
                      Bot Name
                    </Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Customer Support Bot"
                    className="border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt" className="text-gray-700 font-medium">
                    AI System Prompt
                  </Label>
                  <Textarea
                    id="systemPrompt"
                    value={settings.aiSystemPrompt}
                    onChange={(e) => setSettings(prev => ({ ...prev, aiSystemPrompt: e.target.value }))}
                    placeholder="You are a helpful customer service assistant..."
                    rows={4}
                    className="border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200 resize-none"
                  />
                                      <p className="text-xs text-gray-500">Define how your AI assistant should behave and respond to users</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messaging" className="space-y-6 animate-in fade-in duration-700 ease-in-out">
            <Card className="shadow-md rounded-lg border border-gray-200 bg-white p-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <span>Messaging & Notifications</span>
                </CardTitle>
                <p className="text-gray-600 text-sm">Configure how your chatbot communicates with users</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between w-full py-4 px-4 bg-white/60 rounded-lg border border-blue-300">
                  <div>
                    <label htmlFor="showWelcomePopup" className="block text-sm font-medium text-gray-700">
                      Show Welcome Message
                    </label>
                    <p className="text-xs text-gray-500">Display a welcome message when users first open the chat</p>
                  </div>
                  <Switch
                    id="showWelcomePopup"
                    checked={settings.showWelcomePopup}
                    onCheckedChange={checked => {
                      console.log('[Settings] Welcome message toggle changed:', {
                        from: settings.showWelcomePopup,
                        to: checked,
                        chatbotId: activeChatbot?.id
                      });
                      setSettings(prev => ({ ...prev, showWelcomePopup: checked }));
                    }}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-amber-600 text-sm font-bold">!</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-amber-800 mb-1">Custom Welcome Message Warning</h4>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          <strong>Recommended:</strong> Leave the welcome message empty for optimal AI performance. 
                          When empty, the AI will generate contextual, personalized welcome messages based on user behavior, 
                          page content, and conversation context. Custom messages may limit the AI's ability to provide 
                          dynamic, relevant responses.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="welcomeMessage" className="text-gray-700 font-medium">
                      Custom Welcome Message
                    </Label>
                    <Textarea
                      id="welcomeMessage"
                      value={settings.welcomeMessage}
                      onChange={(e) => {
                        console.log('[Settings] Welcome message changed:', {
                          from: settings.welcomeMessage,
                          to: e.target.value,
                          length: e.target.value.length,
                          chatbotId: activeChatbot?.id
                        });
                        setSettings(prev => ({ ...prev, welcomeMessage: e.target.value }));
                      }}
                      placeholder="Hello! How can I help you today?"
                      rows={3}
                                              className="border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200 resize-none"
                    />
                    <div className="flex items-center justify-between">
                                              <p className="text-xs text-gray-500">
                          {settings.welcomeMessage.length > 0 
                            ? `Message length: ${settings.welcomeMessage.length} characters`
                            : 'Leave empty for AI-generated contextual messages'
                          }
                        </p>
                      {settings.welcomeMessage.length > 0 && (
                        <p className="text-xs text-amber-600 font-medium">
                          ⚠️ Custom message set
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full py-4 px-4 bg-white/60 rounded-lg border border-blue-300">
                  <div>
                    <label htmlFor="enableSound" className="block text-sm font-medium text-gray-700">
                      Enable Sound
                    </label>
                    <p className="text-xs text-gray-500">Play a sound when the chatbot appears</p>
                  </div>
                  <Switch
                    id="enableSound"
                    checked={settings.popupSoundEnabled}
                    onCheckedChange={checked => {
                      console.log('[Settings] Enable sound toggle changed:', {
                        from: settings.popupSoundEnabled,
                        to: checked,
                        chatbotId: activeChatbot?.id
                      });
                      setSettings(prev => ({ ...prev, popupSoundEnabled: checked }));
                    }}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          <TabsContent value="integrations" className="space-y-6 animate-in fade-in duration-700 ease-in-out">
            <Card className="shadow-md rounded-lg border border-gray-200 bg-white p-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                  <Webhook className="h-5 w-5 text-orange-600" />
                  <span>Integrations</span>
                </CardTitle>
                <p className="text-gray-600 text-sm">Connect your chatbot with external services and customize branding</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl" className="text-gray-700 font-medium">
                    Leads Webhook URL
                  </Label>
                  <Input
                    id="webhookUrl"
                    value={settings.leadsWebhookUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, leadsWebhookUrl: e.target.value }))}
                    placeholder="https://your-site.com/webhook/leads"
                    className="border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-200 rounded-lg transition-all duration-200 hover:border-orange-200"
                  />
                                      <p className="text-xs text-gray-500">Receive lead data via webhook when visitors submit contact information</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType" className="text-gray-700 font-medium">
                    Business Type
                  </Label>
                  <Select
                    value={settings.businessType}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, businessType: value }))}
                  >
                    <SelectTrigger className="border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-200 rounded-lg transition-all duration-200 hover:border-orange-200 min-w-[160px]">
                      <SelectValue placeholder="Select business type">
                        {(() => {
                          switch (settings.businessType) {
                            case 'general': return 'General';
                            case 'ecommerce': return 'E-commerce';
                            case 'saas': return 'SaaS';
                            case 'service': return 'Service Business';
                            case 'healthcare': return 'Healthcare';
                            case 'education': return 'Education';
                            default: return 'Select business type';
                          }
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="service">Service Business</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Helps customize the chatbot's behavior for your industry</p>
                </div>
                
                
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="placement" className="space-y-6">
            <Card className="shadow-sm border border-gray-200 rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                  <Globe className="h-5 w-5" />
                  <span>Chat Bubble Placement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="position" className="text-gray-700 font-medium">
                    Position
                  </Label>
                  <Select
                    value={settings.bubblePosition}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, bubblePosition: value }))}
                  >
                    <SelectTrigger className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label htmlFor="horizontalOffset" className="text-gray-700 font-medium">
                      Horizontal Offset (px)
                    </Label>
                    <Input
                      id="horizontalOffset"
                      type="number"
                      value={settings.horizontalOffset}
                      onChange={(e) => setSettings(prev => ({ ...prev, horizontalOffset: parseInt(e.target.value) }))}
                      className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="verticalOffset" className="text-gray-700 font-medium">
                      Vertical Offset (px)
                    </Label>
                    <Input
                      id="verticalOffset"
                      type="number"
                      value={settings.verticalOffset}
                      onChange={(e) => setSettings(prev => ({ ...prev, verticalOffset: parseInt(e.target.value) }))}
                      className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}

          <TabsContent value="ai-provider" className="space-y-6 animate-in fade-in duration-700 ease-in-out">
            <Card className="shadow-md rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500 rounded-l-2xl" />
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                  <Key className="h-5 w-5 text-indigo-600" />
                  <span>AI Provider</span>
                </CardTitle>
                <p className="text-slate-600 text-sm">Configure your AI provider and API settings</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="aiProvider" className="text-slate-700 font-medium">
                    AI Provider
                  </Label>
                  <Select
                    value={settings.aiProvider}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, aiProvider: value }))}
                  >
                    <SelectTrigger className="border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg transition-all duration-200 hover:border-indigo-400 min-w-[160px]">
                      <SelectValue placeholder="Select AI provider">
                        {(() => {
                          switch (settings.aiProvider) {
                            case 'platform': return 'Platform Default';
                            case 'openai': return 'OpenAI';
                            case 'google': return 'Google';
                            default: return 'Select AI provider';
                          }
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="platform">Platform Default</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">Choose which AI service to use for generating responses</p>
                </div>
                {settings.aiProvider !== 'platform' && (
                  <div className="space-y-2">
                    <Label htmlFor="customApiKey" className="text-slate-700 font-medium">
                      Custom API Key
                    </Label>
                    <div className="relative flex items-center">
                      <Input
                        id="customApiKey"
                        type={showApiKey ? 'text' : 'password'}
                        value={settings.customApiKey}
                        onChange={(e) => setSettings(prev => ({ ...prev, customApiKey: e.target.value }))}
                        placeholder="sk-..."
                        className="border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg transition-all duration-200 hover:border-indigo-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(v => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 focus:outline-none"
                        tabIndex={-1}
                        aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                      >
                        {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">Your API key for the selected AI provider</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* chat limit */}
          {/* <TabsContent value="limits" className="space-y-6">
            <Card className="shadow-md rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500 rounded-l-2xl" />
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                  <BarChart3 className="h-5 w-5 text-red-600" />
                  <span>Usage Limits</span>
                </CardTitle>
                <p className="text-slate-600 text-sm">Set conversation limits to control costs and usage</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="dailyChatLimit" className="text-slate-700 font-medium">
                    Daily Chat Limit
                  </Label>
                  <Input
                    id="dailyChatLimit"
                    type="number"
                    min="1"
                    value={settings.dailyChatLimit}
                    onChange={(e) => setSettings(prev => ({ ...prev, dailyChatLimit: parseInt(e.target.value) || 100 }))}
                    className="border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 rounded-lg transition-all duration-200 hover:border-red-400"
                  />
                  <p className="text-xs text-slate-500">Maximum number of conversations per day</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyChatLimit" className="text-slate-700 font-medium">
                    Monthly Chat Limit
                  </Label>
                  <Input
                    id="monthlyChatLimit"
                    type="number"
                    min="1"
                    value={settings.monthlyChatLimit}
                    onChange={(e) => setSettings(prev => ({ ...prev, monthlyChatLimit: parseInt(e.target.value) || 1000 }))}
                    className="border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 rounded-lg transition-all duration-200 hover:border-red-400"
                  />
                  <p className="text-xs text-slate-500">Maximum number of conversations per month</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  );
}
