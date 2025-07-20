import { useState } from 'react';
import { Save, Key, MessageSquare, Webhook, Users, BarChart3 } from 'lucide-react';
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

  const [settings, setSettings] = useState({
    // Basic Configuration
    name: activeChatbot?.name || '',
    aiSystemPrompt: activeChatbot?.aiSystemPrompt || '',
    

    
    // Branding
    chatWindowAvatar: activeChatbot?.chatWindowAvatar || '',
    chatBubbleIcon: activeChatbot?.chatBubbleIcon || '',
    
    // Messaging
    welcomeMessage: activeChatbot?.welcomeMessage || '',
    initialMessageDelay: activeChatbot?.initialMessageDelay || 1000,
    
    // Notifications
    enableNotificationSound: activeChatbot?.enableNotificationSound ?? true,
    customNotificationSound: activeChatbot?.customNotificationSound || '',
    
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
    leadCollectionAfterMessages: activeChatbot?.leadCollectionAfterMessages || 3,
    leadCollectionMessage: activeChatbot?.leadCollectionMessage || 'To help you better, may I have your name and contact information?',
    
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
      setSettings({
        name: activeChatbot.name || '',
        aiSystemPrompt: activeChatbot.aiSystemPrompt || '',
        chatWindowAvatar: activeChatbot.chatWindowAvatar || '',
        chatBubbleIcon: activeChatbot.chatBubbleIcon || '',
        welcomeMessage: activeChatbot.welcomeMessage || '',
        initialMessageDelay: activeChatbot.initialMessageDelay || 1000,
        enableNotificationSound: activeChatbot.enableNotificationSound ?? true,
        customNotificationSound: activeChatbot.customNotificationSound || '',
        leadsWebhookUrl: activeChatbot.leadsWebhookUrl || '',
        businessType: activeChatbot.businessType || 'general',
        poweredByText: activeChatbot.poweredByText || '',
        poweredByLink: activeChatbot.poweredByLink || '',
        bubblePosition: activeChatbot.bubblePosition || 'bottom-right',
        horizontalOffset: activeChatbot.horizontalOffset || 20,
        verticalOffset: activeChatbot.verticalOffset || 20,
        leadCollectionEnabled: activeChatbot.leadCollectionEnabled ?? true,
        leadCollectionAfterMessages: activeChatbot.leadCollectionAfterMessages || 3,
        leadCollectionMessage: activeChatbot.leadCollectionMessage || 'To help you better, may I have your name and contact information?',
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

    try {
      await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: {
          ...settings,
          // If your backend expects snake_case, map it here:
          // enable_notification_sound: settings.enableNotificationSound,
          enableNotificationSound: settings.enableNotificationSound,
        },
      });
      
      toast({
        title: 'Settings saved',
        description: 'Your chatbot settings have been updated successfully.',
      });
    } catch (error) {
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
    { value: 'leads', label: 'Lead Collection' },
    { value: 'integrations', label: 'Integrations' },
    { value: 'ai-provider', label: 'AI Provider' },
    { value: 'limits', label: 'Limits' },
  ];

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      {/* Header */}
      <header className="backdrop-blur-md bg-gradient-to-br from-blue-50 to-white/80 border-b border-slate-200 px-4 sm:px-6 py-5 sticky top-0 z-20 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Chatbot Settings</h2>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">Configure "{activeChatbot.name}" settings and behavior</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateChatbot.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
          >
            <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {updateChatbot.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile Dropdown */}
          <div className="sm:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full bg-white border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm">
                <SelectValue placeholder="Select a tab" />
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
          <TabsList className="hidden sm:flex w-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-1 shadow-sm">
            <TabsTrigger
              value="basic"
              className="flex-1 text-slate-600 hover:text-blue-600 focus:text-blue-600 font-medium py-3 px-4 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
            >
              Basic
            </TabsTrigger>
            <TabsTrigger
              value="messaging"
              className="flex-1 text-slate-600 hover:text-blue-600 focus:text-blue-600 font-medium py-3 px-4 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
            >
              Messaging
            </TabsTrigger>
            <TabsTrigger
              value="leads"
              className="flex-1 text-slate-600 hover:text-blue-600 focus:text-blue-600 font-medium py-3 px-4 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
            >
              Lead Collection
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className="flex-1 text-slate-600 hover:text-blue-600 focus:text-blue-600 font-medium py-3 px-4 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
            >
              Integrations
            </TabsTrigger>
            <TabsTrigger
              value="ai-provider"
              className="flex-1 text-slate-600 hover:text-blue-600 focus:text-blue-600 font-medium py-3 px-4 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
            >
              AI Provider
            </TabsTrigger>
            <TabsTrigger
              value="limits"
              className="flex-1 text-slate-600 hover:text-blue-600 focus:text-blue-600 font-medium py-3 px-4 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
            >
              Limits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-blue-50/60 via-white/80 to-blue-100/60 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-400 rounded-l-2xl" />
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span>Basic Configuration</span>
                </CardTitle>
                <p className="text-slate-600 text-sm">Set up your chatbot's core identity and behavior</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-medium">
                    Bot Name
                  </Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Customer Support Bot"
                    className="border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-all duration-200 hover:border-blue-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt" className="text-slate-700 font-medium">
                    AI System Prompt
                  </Label>
                  <Textarea
                    id="systemPrompt"
                    value={settings.aiSystemPrompt}
                    onChange={(e) => setSettings(prev => ({ ...prev, aiSystemPrompt: e.target.value }))}
                    placeholder="You are a helpful customer service assistant..."
                    rows={4}
                    className="border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-all duration-200 hover:border-blue-400 resize-none"
                  />
                  <p className="text-xs text-slate-500">Define how your AI assistant should behave and respond to users</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messaging" className="space-y-6">
            <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-purple-50/60 via-white/80 to-purple-100/60 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-purple-400 rounded-l-2xl" />
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <span>Messaging & Notifications</span>
                </CardTitle>
                <p className="text-slate-600 text-sm">Configure how your chatbot communicates with users</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage" className="text-slate-700 font-medium">
                    Welcome Message
                  </Label>
                  <Input
                    id="welcomeMessage"
                    value={settings.welcomeMessage}
                    onChange={(e) => setSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                    placeholder="Hello! How can I help you today?"
                    className="border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-all duration-200 hover:border-blue-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="messageDelay" className="text-slate-700 font-medium">
                    Initial Message Delay (ms)
                  </Label>
                  <Input
                    id="messageDelay"
                    type="number"
                    value={settings.initialMessageDelay}
                    onChange={(e) => setSettings(prev => ({ ...prev, initialMessageDelay: parseInt(e.target.value) }))}
                    className="border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-all duration-200 hover:border-blue-400"
                  />
                  <p className="text-xs text-slate-500">Delay before showing the welcome message (in milliseconds)</p>
                </div>
                <div className="flex items-center justify-between w-full py-4 px-4 bg-white/60 rounded-lg border border-slate-200">
                  <div>
                    <label htmlFor="enableSound" className="block text-sm font-medium text-slate-700">
                      Enable Sound
                    </label>
                    <p className="text-xs text-slate-500">Play a sound when users open the chatbot</p>
                  </div>
                  <Switch
                    id="enableSound"
                    checked={settings.enableNotificationSound}
                    onCheckedChange={checked => setSettings(prev => ({ ...prev, enableNotificationSound: checked }))}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-green-50/60 via-white/80 to-green-100/60 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-green-400 rounded-l-2xl" />
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Lead Collection Settings</span>
                </CardTitle>
                <p className="text-slate-600 text-sm">Configure how and when to collect visitor contact information</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between w-full py-4 px-4 bg-white/60 rounded-lg border border-slate-200">
                  <div>
                    <label htmlFor="leadCollectionEnabled" className="block text-sm font-medium text-slate-700">
                      Enable Lead Collection
                    </label>
                    <p className="text-xs text-slate-500">Collect visitor contact info after a set number of messages</p>
                  </div>
                  <Switch
                    id="leadCollectionEnabled"
                    checked={settings.leadCollectionEnabled}
                    onCheckedChange={checked => setSettings(prev => ({ ...prev, leadCollectionEnabled: checked }))}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                  />
                </div>

                {settings.leadCollectionEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="leadCollectionAfterMessages" className="text-slate-700 font-medium">
                        Collect leads after (number of messages)
                      </Label>
                      <Input
                        id="leadCollectionAfterMessages"
                        type="number"
                        min="1"
                        max="20"
                        value={settings.leadCollectionAfterMessages}
                        onChange={(e) => setSettings(prev => ({ ...prev, leadCollectionAfterMessages: parseInt(e.target.value) || 3 }))}
                        className="border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-lg transition-all duration-200 hover:border-green-400"
                      />
                      <p className="text-xs text-slate-500">
                        The chatbot will ask for contact information after this many messages
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="leadCollectionMessage" className="text-slate-700 font-medium">
                        Lead collection message
                      </Label>
                      <Textarea
                        id="leadCollectionMessage"
                        value={settings.leadCollectionMessage}
                        onChange={(e) => setSettings(prev => ({ ...prev, leadCollectionMessage: e.target.value }))}
                        placeholder="To help you better, may I have your name and contact information?"
                        rows={3}
                        className="border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-lg transition-all duration-200 hover:border-green-400 resize-none"
                      />
                      <p className="text-xs text-slate-500">
                        This message will be shown when requesting visitor contact information
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-orange-50/60 via-white/80 to-orange-100/60 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-400 rounded-l-2xl" />
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                  <Webhook className="h-5 w-5 text-orange-600" />
                  <span>Integrations</span>
                </CardTitle>
                <p className="text-slate-600 text-sm">Connect your chatbot with external services and customize branding</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl" className="text-slate-700 font-medium">
                    Leads Webhook URL
                  </Label>
                  <Input
                    id="webhookUrl"
                    value={settings.leadsWebhookUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, leadsWebhookUrl: e.target.value }))}
                    placeholder="https://your-site.com/webhook/leads"
                    className="border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-lg transition-all duration-200 hover:border-orange-400"
                  />
                  <p className="text-xs text-slate-500">Receive lead data via webhook when visitors submit contact information</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType" className="text-slate-700 font-medium">
                    Business Type
                  </Label>
                  <Select
                    value={settings.businessType}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, businessType: value }))}
                  >
                    <SelectTrigger className="border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-lg transition-all duration-200 hover:border-orange-400" />
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="service">Service Business</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">Helps customize the chatbot's behavior for your industry</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poweredBy" className="text-slate-700 font-medium">
                    Powered By Text
                  </Label>
                  <Input
                    id="poweredBy"
                    value={settings.poweredByText}
                    onChange={(e) => setSettings(prev => ({ ...prev, poweredByText: e.target.value }))}
                    placeholder="Powered by ChatBot Pro"
                    className="border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-lg transition-all duration-200 hover:border-orange-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poweredByLink" className="text-slate-700 font-medium">
                    Powered By Link
                  </Label>
                  <Input
                    id="poweredByLink"
                    value={settings.poweredByLink}
                    onChange={(e) => setSettings(prev => ({ ...prev, poweredByLink: e.target.value }))}
                    placeholder="https://chatbotpro.com"
                    className="border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-lg transition-all duration-200 hover:border-orange-400"
                  />
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

          <TabsContent value="ai-provider" className="space-y-6">
            <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-indigo-50/60 via-white/80 to-indigo-100/60 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-400 rounded-l-2xl" />
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
                    <SelectTrigger className="border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg transition-all duration-200 hover:border-indigo-400" />
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
                    <Input
                      id="customApiKey"
                      type="password"
                      value={settings.customApiKey}
                      onChange={(e) => setSettings(prev => ({ ...prev, customApiKey: e.target.value }))}
                      placeholder="sk-..."
                      className="border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg transition-all duration-200 hover:border-indigo-400"
                    />
                    <p className="text-xs text-slate-500">Your API key for the selected AI provider</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="limits" className="space-y-6">
            <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-red-50/60 via-white/80 to-red-100/60 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-400 rounded-l-2xl" />
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
