import { useState, useEffect, useRef } from 'react';
import { Save, Palette, Eye, Image, Settings, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChatPreview } from '@/components/chat/chat-preview';
import { useApp } from '@/contexts/app-context';
import { useUpdateChatbot, useChatbot } from '@/hooks/use-chatbots';
import {  compressAndConvertToDataURI } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


export default function Appearance() {
  const { activeChatbot, user } = useApp();
  const updateChatbot = useUpdateChatbot();
  const { toast } = useToast();
  const { data: fetchedChatbot, refetch } = useChatbot(activeChatbot?.id || "");
  const [activeTab, setActiveTab] = useState('chatbot');

  // Debug: Log activeChatbot and fetchedChatbot
  // console.log('activeChatbot:', activeChatbot);
  // console.log('fetchedChatbot:', fetchedChatbot);
  // console.log('useChatbot query key:', ['/api/chatbots', activeChatbot?.id || ""]);

  // Debug: Log the actual API response
  // useEffect(() => {
  //   if (activeChatbot?.id) {
  //     console.log('Fetching chatbot with ID:', activeChatbot.id);
  //     fetch(`http://localhost:5000/api/chatbots/${activeChatbot.id}`)
  //       .then(res => res.json())
  //       .then(data => {
  //         console.log('Raw API response:', data);
  //       })
  //       .catch(err => {
  //         console.error('API fetch error:', err);
  //       });
  //   }
  // }, [activeChatbot?.id]);

  const [appearance, setAppearance] = useState<{
    title: string;
    welcomeMessage: string;
    primaryColor: string;
    showWelcomePopup: boolean;
    suggestionButtons: string[];
    suggestionTiming: 'initial' | 'after_welcome' | 'after_first_message' | 'manual';
    suggestionPersistence: 'until_clicked' | 'always_visible' | 'hide_after_timeout';
    suggestionTimeout: number;
    inputPlaceholder: string;
    leadButtonText: string;
    chatBubbleIcon: string;
    chatWidgetIcon: string;
    chatWidgetName: string;
    chatWindowAvatar: string;
    chatWindowStyle: 'modern' | 'classic' | 'minimal' | 'floating';
    chatWindowTheme: 'light' | 'dark' | 'auto';
    borderRadius: number;
    shadowStyle: 'none' | 'soft' | 'medium' | 'strong';
  }>({
    title: '',
    welcomeMessage: '',
    primaryColor: '#6366F1',
    showWelcomePopup: true,
    suggestionButtons: [],
    suggestionTiming: 'initial',
    suggestionPersistence: 'until_clicked',
    suggestionTimeout: 30000,
    inputPlaceholder: '',
    leadButtonText: '',
    chatBubbleIcon: '',
    chatWidgetIcon: '',
    chatWidgetName: 'Support Chat',
    chatWindowAvatar: '',
    chatWindowStyle: 'modern',
    chatWindowTheme: 'light',
    borderRadius: 16,
    shadowStyle: 'soft',
  });

  // Sync appearance state with fetchedChatbot
  useEffect(() => {
    if (fetchedChatbot) {
      
      setAppearance({
        title: fetchedChatbot.title || '',
        welcomeMessage: fetchedChatbot.welcomeMessage || '',
        primaryColor: fetchedChatbot.primaryColor || '#6366F1',
        showWelcomePopup: fetchedChatbot.showWelcomePopup ?? true,
        suggestionButtons: fetchedChatbot.suggestionButtons ? JSON.parse(fetchedChatbot.suggestionButtons) : [],
        suggestionTiming: (fetchedChatbot.suggestionTiming as 'initial' | 'after_welcome' | 'after_first_message' | 'manual') || 'initial',
        suggestionPersistence: (fetchedChatbot.suggestionPersistence as 'until_clicked' | 'always_visible' | 'hide_after_timeout') || 'until_clicked',
        suggestionTimeout: fetchedChatbot.suggestionTimeout || 30000,
        inputPlaceholder: fetchedChatbot.inputPlaceholder || '',
        leadButtonText: fetchedChatbot.leadButtonText || '',
        chatBubbleIcon: fetchedChatbot.chatBubbleIcon || '',
        chatWidgetIcon: fetchedChatbot.chatWidgetIcon || '',
        chatWidgetName: fetchedChatbot.chatWidgetName || 'Support Chat',
        chatWindowAvatar: fetchedChatbot.chatWindowAvatar || '',
        chatWindowStyle: (fetchedChatbot.chatWindowStyle as 'modern' | 'classic' | 'minimal' | 'floating') || 'modern',
        chatWindowTheme: (fetchedChatbot.chatWindowTheme as 'light' | 'dark' | 'auto') || 'light',
        borderRadius: fetchedChatbot.borderRadius || 16,
        shadowStyle: (fetchedChatbot.shadowStyle as 'none' | 'soft' | 'medium' | 'strong') || 'soft',
      });
    }
  }, [fetchedChatbot]);

  // Debug: Log appearance state changes
  // useEffect(() => {
  //   console.log('Current appearance state:', appearance);
  // }, [appearance]);

  // Build preview props for ChatPreview
  const previewProps = {
    welcomeMessage: appearance.welcomeMessage,
    inputPlaceholder: appearance.inputPlaceholder,
    borderRadius: appearance.borderRadius,
    shadowStyle: appearance.shadowStyle,
    chatBubbleIcon: appearance.chatBubbleIcon,
    chatWidgetIcon: appearance.chatWidgetIcon,
    chatWindowAvatar: appearance.chatWindowAvatar,
    chatWidgetName: appearance.chatWidgetName,
    poweredByText: user?.agencyName ? `Powered by ${user.agencyName}` : 'Powered by Chatbot',
    poweredByLink: activeChatbot?.poweredByLink || 'https://your-website.com',
  };
  // Just before rendering <ChatPreview />
  const previewChatbot: any = {
    id: activeChatbot?.id || 'demo',
    name:  appearance.chatWidgetName || 'Support Bot',
    primaryColor: appearance.primaryColor,
    welcomeMessage: appearance.welcomeMessage,
    inputPlaceholder: appearance.inputPlaceholder,
    borderRadius: appearance.borderRadius,
    shadowStyle: appearance.shadowStyle,
    chatWindowAvatar: appearance.chatWindowAvatar,
    chatBubbleIcon: appearance.chatBubbleIcon,
    chatWidgetIcon: appearance.chatWidgetIcon,
    chatWidgetName: appearance.chatWidgetName,
    poweredByText: user?.agencyName ? `Powered by ${user.agencyName}` : 'Powered by Chatbot',
    poweredByLink: activeChatbot?.poweredByLink || 'https://your-website.com',
    chatWindowStyle: appearance.chatWindowStyle,
    chatWindowTheme: appearance.chatWindowTheme,
  };

  // Generate live embed code
//   const embedCode = `<script>
//   window.chatbotConfig = ${JSON.stringify({
//     chatbotId: previewChatbot.id,
//     primaryColor: previewChatbot.primaryColor,
//     borderRadius: previewChatbot.borderRadius,
//     chatWindowAvatar: previewChatbot.chatWindowAvatar,
//     chatBubbleIcon: previewChatbot.chatBubbleIcon,
//     chatWidgetIcon: previewChatbot.chatWidgetIcon,
//     chatWidgetName: previewChatbot.chatWidgetName,
//     poweredByText: previewChatbot.poweredByText,
//     poweredByLink: previewChatbot.poweredByLink,
//     welcomeMessage: previewChatbot.welcomeMessage,
//     inputPlaceholder: previewChatbot.inputPlaceholder,
//     shadowStyle: previewChatbot.shadowStyle,
//     chatWindowStyle: previewChatbot.chatWindowStyle,
//     chatWindowTheme: previewChatbot.chatWindowTheme,
//     // ...add more as needed
//   }, null, 2)};
// </script>
// <script src='https://your-cdn/chatbot.js'></script>`;

  // const [newSuggestion, setNewSuggestion] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  const [highlightPreview, setHighlightPreview] = useState(false);

  const handleSave = async () => {
    if (activeChatbot) {
      try {
        await updateChatbot.mutateAsync({
          id: activeChatbot.id,
          data: {
            welcomeMessage: appearance.welcomeMessage,
            primaryColor: appearance.primaryColor,
            showWelcomePopup: appearance.showWelcomePopup,
            suggestionButtons: JSON.stringify(appearance.suggestionButtons),
            suggestionTiming: appearance.suggestionTiming,
            suggestionPersistence: appearance.suggestionPersistence,
            suggestionTimeout: appearance.suggestionTimeout,
            inputPlaceholder: appearance.inputPlaceholder,
            leadButtonText: appearance.leadButtonText,
            chatWindowStyle: appearance.chatWindowStyle,
            chatWindowTheme: appearance.chatWindowTheme,
            borderRadius: appearance.borderRadius,
            shadowStyle: appearance.shadowStyle,
            chatBubbleIcon: appearance.chatBubbleIcon,
            chatWidgetIcon: appearance.chatWidgetIcon,
            chatWidgetName: appearance.chatWidgetName,
            chatWindowAvatar: appearance.chatWindowAvatar,
          },
        });
        toast({
          title: 'Appearance saved',
          description: 'Your chatbot appearance has been updated successfully.',
        });
        refetch(); // Refetch latest data after save
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to save appearance. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Global settings',
        description: 'Global appearance settings would be saved here.',
      });
    }
  };

  const handleFileUpload = async (field: string, file: File) => {
    console.log('handleFileUpload called', field, file);
    try {
      // Compress and convert image to data URI
      const dataUri = await compressAndConvertToDataURI(file, 128, 128, 0.7);
      setAppearance(prev => ({ ...prev, [field]: dataUri }));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // const addSuggestionButton = () => {
  //   console.log('addSuggestionButton called', newSuggestion);
  //   if (newSuggestion.trim()) {
  //     setAppearance(prev => ({
  //       ...prev,
  //       suggestionButtons: [...prev.suggestionButtons, newSuggestion.trim()]
  //     }));
  //     setNewSuggestion('');
  //   }
  // };

  // const removeSuggestionButton = (index: number) => {
  //   console.log('removeSuggestionButton called', index);
  //   setAppearance(prev => ({
  //     ...prev,
  //     suggestionButtons: prev.suggestionButtons.filter((_: string, i: number) => i !== index)
  //   }));
  // };

  const tabOptions = [
    { value: 'chatbot', label: 'Chatbot Appearance', disabled: !activeChatbot },
    { value: 'global', label: 'Visual Branding' },
  ];

  return (
    <div className="flex-1 bg-gradient-to-br from-purple-50 to-white min-h-screen">
      {/* Header */}
      <header className="backdrop-blur-md bg-gradient-to-br from-purple-50 to-white/80 border-b border-slate-200 px-4 sm:px-6 py-5 sticky top-0 z-20 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Chatbot Appearance</h2>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              {activeChatbot
                ? `Customize the appearance of "${activeChatbot.name}"`
                : 'Select a chatbot to begin customizing its look and feel.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all duration-200"
              onClick={() => {
                if (previewRef.current) {
                  previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setHighlightPreview(true);
                  setTimeout(() => setHighlightPreview(false), 1200);
                }
              }}
            >
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateChatbot.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 sm:px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {updateChatbot.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile Dropdown */}
          <div className="sm:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full bg-white border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-lg shadow-sm">
                <SelectValue placeholder="Select a tab" />
              </SelectTrigger>
              <SelectContent>
                {tabOptions.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value} disabled={tab.disabled}>
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Tabs */}
          <TabsList className="hidden sm:flex w-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-1 shadow-sm">
            <TabsTrigger
              value="chatbot"
              disabled={!activeChatbot}
              className="flex-1 text-slate-600 hover:text-purple-600 focus:text-purple-600 font-medium py-3 px-4 rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=active]:shadow-sm transition-all duration-200"
            >
              Chatbot Appearance
            </TabsTrigger>
            <TabsTrigger
              value="global"
              className="flex-1 text-slate-600 hover:text-purple-600 focus:text-purple-600 font-medium py-3 px-4 rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=active]:shadow-sm transition-all duration-200"
            >
              Visual Branding
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Settings Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Chatbot Appearance Tab */}
              <TabsContent value="chatbot" className="space-y-6">
                {activeChatbot ? (
                  <>
                    {/* Basic Settings */}
                    <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-blue-50/60 via-white/80 to-blue-100/60 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-400 rounded-l-2xl" />
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                          <Palette className="h-5 w-5 text-blue-600" />
                          <span>Basic Settings</span>
                        </CardTitle>
                        <p className="text-slate-600 text-sm">Configure your chatbot's core appearance and behavior</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="title" className="text-slate-700 font-medium">Chat Window Title</Label>
                            <Input 
                              id="title" 
                              value={appearance.title} 
                              onChange={e => { console.log('title changed', e.target.value); setAppearance(prev => ({ ...prev, title: e.target.value })) }} 
                              placeholder="Chat with us" 
                              className="border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-all duration-200 hover:border-blue-400"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="primaryColor" className="text-slate-700 font-medium">Primary Color</Label>
                            <div className="flex items-center gap-3">
                              <Input 
                                id="primaryColor" 
                                type="color" 
                                value={appearance.primaryColor} 
                                onChange={e => setAppearance(prev => ({ ...prev, primaryColor: e.target.value }))} 
                                className="w-12 h-10 p-1 border rounded-lg cursor-pointer" 
                              />
                              <Input 
                                value={appearance.primaryColor} 
                                onChange={e => setAppearance(prev => ({ ...prev, primaryColor: e.target.value }))} 
                                placeholder="#6366F1" 
                                className="flex-1 border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-all duration-200 hover:border-blue-400" 
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="welcomeMessage" className="text-slate-700 font-medium">Welcome Message</Label>
                          <Textarea 
                            id="welcomeMessage" 
                            value={appearance.welcomeMessage} 
                            onChange={e => setAppearance(prev => ({ ...prev, welcomeMessage: e.target.value }))} 
                            placeholder="Hello! How can I help you today?" 
                            rows={2} 
                            className="border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-all duration-200 hover:border-blue-400 resize-none"
                          />
                        </div>
                        
                      </CardContent>
                    </Card>

                    {/* Modern Styling */}
                    <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-purple-50/60 via-white/80 to-purple-100/60 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-purple-400 rounded-l-2xl" />
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          <span>Modern Styling</span>
                        </CardTitle>
                        <p className="text-slate-600 text-sm">Customize the chat window's look and feel</p>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="chatWindowStyle" className="text-slate-700 font-medium">Window Style</Label>
                            <Select
                              value={appearance.chatWindowStyle}
                              onValueChange={(value) => setAppearance(prev => ({ ...prev, chatWindowStyle: value as 'modern' | 'classic' | 'minimal' | 'floating' }))}
                            >
                              <SelectTrigger className="border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-lg transition-all duration-200 hover:border-purple-400">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="modern">Modern</SelectItem>
                                <SelectItem value="classic">Classic</SelectItem>
                                <SelectItem value="minimal">Minimal</SelectItem>
                                <SelectItem value="floating">Floating</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="chatWindowTheme" className="text-slate-700 font-medium">Theme</Label>
                            <Select
                              value={appearance.chatWindowTheme}
                              onValueChange={(value) => setAppearance(prev => ({ ...prev, chatWindowTheme: value as 'light' | 'dark' | 'auto' }))}
                            >
                              <SelectTrigger className="border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-lg transition-all duration-200 hover:border-purple-400">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="auto">Auto</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="borderRadius" className="text-slate-700 font-medium">Border Radius ({appearance.borderRadius}px)</Label>
                            <input 
                              id="borderRadius" 
                              type="range" 
                              min="0" 
                              max="32" 
                              value={appearance.borderRadius} 
                              onChange={e => setAppearance(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))} 
                              className="w-full accent-purple-600" 
                            />
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>Sharp (0px)</span>
                              <span>Very Rounded (32px)</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="shadowStyle" className="text-slate-700 font-medium">Shadow Style</Label>
                            <Select
                              value={appearance.shadowStyle}
                              onValueChange={(value) => setAppearance(prev => ({ ...prev, shadowStyle: value as 'none' | 'soft' | 'medium' | 'strong' }))}
                            >
                              <SelectTrigger className="border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-lg transition-all duration-200 hover:border-purple-400">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="soft">Soft</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="strong">Strong</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center items-center">
                          <Label className="mb-2 text-slate-700 font-medium">Style Preview</Label>
                          <div 
                            className="w-full max-w-64 h-32 border rounded-lg flex flex-col justify-center items-center bg-white shadow-sm transition-all duration-300" 
                            style={{ 
                              borderRadius: `${appearance.borderRadius}px`, 
                              boxShadow: appearance.shadowStyle === 'soft' ? '0 1px 4px rgba(0,0,0,0.06)' : appearance.shadowStyle === 'medium' ? '0 2px 8px rgba(0,0,0,0.10)' : appearance.shadowStyle === 'strong' ? '0 4px 16px rgba(0,0,0,0.16)' : 'none', 
                              background: appearance.chatWindowTheme === 'dark' ? '#1e293b' : '#fff' 
                            }}
                          >
                            <span className={`text-base font-medium ${appearance.chatWindowTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Chat Preview</span>
                            <span className={`text-xs mt-1 ${appearance.chatWindowTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{appearance.chatWindowStyle} style</span>
                            <span className="mt-2 px-2 py-1 rounded text-xs text-white" style={{ backgroundColor: appearance.primaryColor }}>Sample message</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Text Customization */}
                    <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-green-50/60 via-white/80 to-green-100/60 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-green-400 rounded-l-2xl" />
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                          <Settings className="h-5 w-5 text-green-600" />
                          <span>Text Customization</span>
                        </CardTitle>
                        <p className="text-slate-600 text-sm">Customize text elements and placeholders</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="inputPlaceholder" className="text-slate-700 font-medium">Input Placeholder</Label>
                          <Input 
                            id="inputPlaceholder" 
                            value={appearance.inputPlaceholder} 
                            onChange={e => setAppearance(prev => ({ ...prev, inputPlaceholder: e.target.value }))} 
                            placeholder="Type your message..." 
                            className="border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-lg transition-all duration-200 hover:border-green-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="leadButtonText" className="text-slate-700 font-medium">Lead Button Text</Label>
                          <Input 
                            id="leadButtonText" 
                            value={appearance.leadButtonText} 
                            onChange={e => setAppearance(prev => ({ ...prev, leadButtonText: e.target.value }))} 
                            placeholder="Get Started" 
                            className="border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-lg transition-all duration-200 hover:border-green-400"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-slate-50/60 via-white/80 to-slate-100/60 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-slate-400 rounded-l-2xl" />
                    <CardContent className="py-12 text-center">
                      <Palette className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Chatbot</h3>
                      <p className="text-slate-500">Select a chatbot from the sidebar to customize its appearance.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Visual Branding Tab */}
              <TabsContent value="global" className="space-y-6">
                <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-orange-50/60 via-white/80 to-orange-100/60 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-400 rounded-l-2xl" />
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                      <Image className="h-5 w-5 text-orange-600" />
                      <span>Visual Branding</span>
                    </CardTitle>
                    <p className="text-slate-600 text-sm">Customize your chatbot's icons and avatar</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Chat Bubble Icon</Label>
                      <div className="flex items-center gap-4">
                        {activeChatbot?.chatBubbleIcon && (
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                            <img src={activeChatbot.chatBubbleIcon} alt="Chat Bubble Icon" className="w-8 h-8 rounded-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={e => { const file = e.target.files?.[0]; if (file) handleFileUpload('chatBubbleIcon', file); }} 
                            className="border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-lg transition-all duration-200 hover:border-orange-400" 
                          />
                          <p className="text-xs text-slate-500 mt-1">32x32px, PNG/JPG</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Chat Widget Icon</Label>
                      <div className="flex items-center gap-4">
                        {appearance.chatWidgetIcon && (
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                            <img src={appearance.chatWidgetIcon} alt="Chat Widget Icon" className="w-8 h-8 rounded-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={e => { const file = e.target.files?.[0]; if (file) handleFileUpload('chatWidgetIcon', file); }} 
                            className="border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-lg transition-all duration-200 hover:border-orange-400" 
                          />
                          <p className="text-xs text-slate-500 mt-1">32x32px, PNG/JPG</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chatWidgetName" className="text-slate-700 font-medium">Chat Widget Name</Label>
                      <Input 
                        id="chatWidgetName"
                        value={appearance.chatWidgetName} 
                        onChange={e => setAppearance(prev => ({ ...prev, chatWidgetName: e.target.value }))} 
                        placeholder="Support Chat" 
                        className="border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-lg transition-all duration-200 hover:border-orange-400" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Chat Window Avatar</Label>
                      <div className="flex items-center gap-4">
                        {appearance.chatWindowAvatar && (
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                            <img src={appearance.chatWindowAvatar} alt="Chat Window Avatar" className="w-10 h-10 rounded-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={e => { const file = e.target.files?.[0]; if (file) handleFileUpload('chatWindowAvatar', file); }} 
                            className="border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-lg transition-all duration-200 hover:border-orange-400" 
                          />
                          <p className="text-xs text-slate-500 mt-1">64x64px, PNG/JPG</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>

            {/* Right Column: Live Preview */}
            <div className="space-y-6 lg:sticky lg:top-24 h-fit">
              <div ref={previewRef} className={`transition-all duration-500 ${highlightPreview ? 'ring-4 ring-purple-400 ring-opacity-60' : ''}`}>
                <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-slate-50/60 via-white/80 to-slate-100/60 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-slate-400 rounded-l-2xl" />
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                      <Eye className="h-5 w-5 text-slate-600" />
                      <span>Live Preview</span>
                    </CardTitle>
                    <p className="text-slate-600 text-sm">See your changes in real-time</p>
                  </CardHeader>
                  <CardContent>
                    <ChatPreview chatbot={previewChatbot} {...previewProps} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
