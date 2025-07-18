import { useState } from 'react';
import { Save, Key, MessageSquare, Webhook } from 'lucide-react';
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
  //     const base64Length = dataUri.split(',')[1]?.length || 0;
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



  return (
    <div className="flex-1 bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Chatbot Settings</h2>
            <p className="text-gray-500 mt-1 text-sm">Configure "{activeChatbot.name}" settings and behavior</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateChatbot.isPending}
            className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white font-semibold px-5 py-2 rounded-md shadow-sm"
          >
            <Save className="h-5 w-5 mr-2" />
            {updateChatbot.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 border-b border-gray-200">
          <TabsTrigger
            value="basic"
            className="text-gray-700 hover:text-blue-600 focus:text-blue-600 font-medium py-3 px-4"
          >
            Basic
          </TabsTrigger>
          <TabsTrigger
            value="messaging"
            className="text-gray-700 hover:text-blue-600 focus:text-blue-600 font-medium py-3 px-4"
          >
            Messaging
          </TabsTrigger>
          <TabsTrigger
            value="leads"
            className="text-gray-700 hover:text-blue-600 focus:text-blue-600 font-medium py-3 px-4"
          >
            Lead Collection
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="text-gray-700 hover:text-blue-600 focus:text-blue-600 font-medium py-3 px-4"
          >
            Integrations
          </TabsTrigger>
          {/* <TabsTrigger
            value="placement"
            className="text-gray-700 hover:text-blue-600 focus:text-blue-600 font-medium py-3 px-4"
          >
            Placement
          </TabsTrigger> */}
          <TabsTrigger
            value="ai-provider"
            className="text-gray-700 hover:text-blue-600 focus:text-blue-600 font-medium py-3 px-4"
          >
            AI Provider
          </TabsTrigger>
          <TabsTrigger
            value="limits"
            className="text-gray-700 hover:text-blue-600 focus:text-blue-600 font-medium py-3 px-4"
          >
            Limits
          </TabsTrigger>
        </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card className="shadow-sm border border-gray-200 rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                  <MessageSquare className="h-5 w-5" />
                  <span>Basic Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Bot Name
                  </Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Customer Support Bot"
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="systemPrompt" className="text-gray-700 font-medium">
                    AI System Prompt
                  </Label>
                  <Textarea
                    id="systemPrompt"
                    value={settings.aiSystemPrompt}
                    onChange={(e) => setSettings(prev => ({ ...prev, aiSystemPrompt: e.target.value }))}
                    placeholder="You are a helpful customer service assistant..."
                    rows={4}
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          <TabsContent value="messaging" className="space-y-6">
            <Card className="shadow-sm border border-gray-200 rounded-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 font-semibold text-lg">Messaging &amp; Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="welcomeMessage" className="text-gray-700 font-medium">
                    Welcome Message
                  </Label>
                  <Input
                    id="welcomeMessage"
                    value={settings.welcomeMessage}
                    onChange={(e) => setSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                    placeholder="Hello! How can I help you today?"
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="messageDelay" className="text-gray-700 font-medium">
                    Initial Message Delay (ms)
                  </Label>
                  <Input
                    id="messageDelay"
                    type="number"
                    value={settings.initialMessageDelay}
                    onChange={(e) => setSettings(prev => ({ ...prev, initialMessageDelay: parseInt(e.target.value) }))}
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  />
                </div>
                <div className="flex items-center justify-between w-full py-3">
                  <div>
                    <label htmlFor="enableSound" className="block text-sm font-medium text-slate-700">
                      Enable Sound
                    </label>
                    <p className="text-xs text-slate-500">Play a sound when you open Chatbot.</p>
                  </div>
                  <Switch
                    id="enableSound"
                    checked={settings.enableNotificationSound}
                    onCheckedChange={checked => setSettings(prev => ({ ...prev, enableNotificationSound: checked }))}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                {/* <div className="space-y-1">
                  <Label>Chat Window Avatar</Label>
                  <div className="flex items-center space-x-4">
                    {settings.chatWindowAvatar && (
                      <img
                        src={settings.chatWindowAvatar}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover border border-gray-300"
                      />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('chatWindowAvatar', file);
                      }}
                      className="border-gray-300 rounded-md"
                    />
                  </div>
                </div> */}
                {/* <div className="space-y-1">
                  <Label>Chat Bubble Icon</Label>
                  <div className="flex items-center space-x-4">
                    {settings.chatBubbleIcon && (
                      <img
                        src={settings.chatBubbleIcon}
                        alt="Bubble Icon"
                        className="w-8 h-8 rounded object-cover border border-gray-300"
                      />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('chatBubbleIcon', file);
                      }}
                      className="border-gray-300 rounded-md"
                    />
                  </div>
                </div> */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card className="shadow-sm border border-gray-200 rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                  <MessageSquare className="h-5 w-5" />
                  <span>Lead Collection Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between w-full py-3">
                  <div>
                    <label htmlFor="leadCollectionEnabled" className="block text-sm font-medium text-slate-700">
                      Enable Lead Collection
                    </label>
                    <p className="text-xs text-slate-500">Collect visitor contact info after a set number of messages.</p>
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
                    <div className="space-y-1">
                      <Label htmlFor="leadCollectionAfterMessages" className="text-gray-700 font-medium">
                        Collect leads after (number of messages)
                      </Label>
                      <Input
                        id="leadCollectionAfterMessages"
                        type="number"
                        min="1"
                        max="20"
                        value={settings.leadCollectionAfterMessages}
                        onChange={(e) => setSettings(prev => ({ ...prev, leadCollectionAfterMessages: parseInt(e.target.value) || 3 }))}
                        className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                      />
                      <p className="text-sm text-gray-500">
                        The chatbot will ask for contact information after this many messages
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="leadCollectionMessage" className="text-gray-700 font-medium">
                        Lead collection message
                      </Label>
                      <Textarea
                        id="leadCollectionMessage"
                        value={settings.leadCollectionMessage}
                        onChange={(e) => setSettings(prev => ({ ...prev, leadCollectionMessage: e.target.value }))}
                        placeholder="To help you better, may I have your name and contact information?"
                        rows={3}
                        className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                      />
                      <p className="text-sm text-gray-500">
                        This message will be shown when requesting visitor contact information
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card className="shadow-sm border border-gray-200 rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                  <Webhook className="h-5 w-5" />
                  <span>Integrations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="webhookUrl" className="text-gray-700 font-medium">
                    Leads Webhook URL
                  </Label>
                  <Input
                    id="webhookUrl"
                    value={settings.leadsWebhookUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, leadsWebhookUrl: e.target.value }))}
                    placeholder="https://your-site.com/webhook/leads"
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="businessType" className="text-gray-700 font-medium">
                    Business Type
                  </Label>
                  <Select
                    value={settings.businessType}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, businessType: value }))}
                  >
                    <SelectTrigger className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="service">Service Business</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="poweredBy" className="text-gray-700 font-medium">
                    Powered By Text
                  </Label>
                  <Input
                    id="poweredBy"
                    value={settings.poweredByText}
                    onChange={(e) => setSettings(prev => ({ ...prev, poweredByText: e.target.value }))}
                    placeholder="Powered by ChatBot Pro"
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="poweredByLink" className="text-gray-700 font-medium">
                    Powered By Link
                  </Label>
                  <Input
                    id="poweredByLink"
                    value={settings.poweredByLink}
                    onChange={(e) => setSettings(prev => ({ ...prev, poweredByLink: e.target.value }))}
                    placeholder="https://chatbotpro.com"
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
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
            <Card className="shadow-sm border border-gray-200 rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                  <Key className="h-5 w-5" />
                  <span>AI Provider</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="aiProvider" className="text-gray-700 font-medium">
                    AI Provider
                  </Label>
                  <Select
                    value={settings.aiProvider}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, aiProvider: value }))}
                  >
                    <SelectTrigger className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Select AI Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="platform">Platform Default (Gemini)</SelectItem>
                      <SelectItem value="google">Custom Google AI Key</SelectItem>
                      <SelectItem value="openai">Custom OpenAI Key</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(settings.aiProvider === 'google' || settings.aiProvider === 'openai') && (
                  <div className="space-y-1">
                    <Label htmlFor="apiKey" className="text-gray-700 font-medium">
                      Custom API Key
                    </Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={settings.customApiKey}
                      onChange={(e) => setSettings(prev => ({ ...prev, customApiKey: e.target.value }))}
                      placeholder="Enter your API key"
                      className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="limits" className="space-y-6">
            <Card className="shadow-sm border border-gray-200 rounded-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 font-semibold text-lg">Usage Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="dailyLimit" className="text-gray-700 font-medium">
                    Daily Chat Limit
                  </Label>
                  <Input
                    id="dailyLimit"
                    type="number"
                    value={settings.dailyChatLimit}
                    onChange={(e) => setSettings(prev => ({ ...prev, dailyChatLimit: parseInt(e.target.value) }))}
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="monthlyLimit" className="text-gray-700 font-medium">
                    Monthly Chat Limit
                  </Label>
                  <Input
                    id="monthlyLimit"
                    type="number"
                    value={settings.monthlyChatLimit}
                    onChange={(e) => setSettings(prev => ({ ...prev, monthlyChatLimit: parseInt(e.target.value) }))}
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
