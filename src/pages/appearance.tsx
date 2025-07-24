import { useState, useEffect, useRef } from 'react';
import { Save, Palette, Eye, Image, Settings } from 'lucide-react';
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
    secondaryColor: string;
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
    chatWindowTheme: 'light' | 'dark' | 'auto';
    borderRadius: number;
    shadowStyle: 'none' | 'soft' | 'medium' | 'strong';
  }>({
    title: '',
    welcomeMessage: '',
    primaryColor: '#6366F1',
    secondaryColor: '#A7C7E7',
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
        secondaryColor: fetchedChatbot.secondaryColor || '#A7C7E7', // now fetched from backend
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
    primaryColor: appearance.primaryColor,
    secondaryColor: appearance.secondaryColor,
  };
  // Just before rendering <ChatPreview />
  const previewChatbot: any = {
    id: activeChatbot?.id || 'demo',
    name:  appearance.chatWidgetName || 'Support Bot',
    primaryColor: appearance.primaryColor,
    secondaryColor: appearance.secondaryColor,
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
            secondaryColor: appearance.secondaryColor, // now sent to backend
            showWelcomePopup: appearance.showWelcomePopup,
            suggestionButtons: JSON.stringify(appearance.suggestionButtons),
            suggestionTiming: appearance.suggestionTiming,
            suggestionPersistence: appearance.suggestionPersistence,
            suggestionTimeout: appearance.suggestionTimeout,
            inputPlaceholder: appearance.inputPlaceholder,
            leadButtonText: appearance.leadButtonText,
            chatWindowTheme: appearance.chatWindowTheme,
            borderRadius: appearance.borderRadius,
            shadowStyle: appearance.shadowStyle,
            // Do not send icon/avatar fields here, they are handled in Visual Branding tab
            chatWidgetName: appearance.chatWidgetName,
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
    <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      {/* Header */}
      <header className="backdrop-blur-md bg-gradient-to-br from-blue-50 via-white to-blue-100/80 border-b border-blue-50 px-4 sm:px-6 py-5 sticky top-0 z-20 shadow-lg">
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
              className="border-blue-100 text-blue-700 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-all duration-200"
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
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
              <SelectTrigger className="w-full bg-white border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg shadow-sm">
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
          <TabsList className="hidden sm:flex w-full bg-white/80 backdrop-blur-sm border border-blue-50 rounded-xl p-1 shadow-sm">
            <TabsTrigger
              value="chatbot"
              disabled={!activeChatbot}
              className="flex-1 text-blue-600 hover:text-blue-700 focus:text-blue-700 font-medium py-3 px-4 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all duration-200"
            >
              Chatbot Appearance
            </TabsTrigger>
            <TabsTrigger
              value="global"
              className="flex-1 text-blue-600 hover:text-blue-700 focus:text-blue-700 font-medium py-3 px-4 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all duration-200"
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
                    {/* Color Settings Group */}
                    <Card className="shadow-md rounded-2xl border border-blue-50 bg-white/80 p-6">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center space-x-2 text-blue-900 font-semibold text-lg">
                          <Palette className="h-5 w-5 text-blue-400" />
                          <span>Colors</span>
                        </CardTitle>
                        <p className="text-blue-400 text-sm">Set your chatbot's primary and secondary colors</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="primaryColor" className="text-blue-700 font-medium">Primary Color</Label>
                            <div className="flex items-center gap-3">
                              <Input 
                                id="primaryColor" 
                                type="color" 
                                value={appearance.primaryColor} 
                                onChange={e => setAppearance(prev => ({ ...prev, primaryColor: e.target.value }))} 
                                className="w-12 h-10 p-1 border rounded-lg cursor-pointer border-blue-100" 
                              />
                              <Input 
                                value={appearance.primaryColor} 
                                onChange={e => setAppearance(prev => ({ ...prev, primaryColor: e.target.value }))} 
                                placeholder="#6366F1" 
                                className="flex-1 border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="secondaryColor" className="text-blue-700 font-medium">Secondary Color</Label>
                            <div className="flex items-center gap-3">
                              <Input 
                                id="secondaryColor" 
                                type="color" 
                                value={appearance.secondaryColor} 
                                onChange={e => setAppearance(prev => ({ ...prev, secondaryColor: e.target.value }))} 
                                className="w-12 h-10 p-1 border rounded-lg cursor-pointer border-blue-100" 
                              />
                              <Input 
                                value={appearance.secondaryColor} 
                                onChange={e => setAppearance(prev => ({ ...prev, secondaryColor: e.target.value }))} 
                                placeholder="#A7C7E7" 
                                className="flex-1 border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200" 
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Text Settings Group */}
                    <Card className="shadow-md rounded-2xl border border-blue-50 bg-white/80 p-6">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center space-x-2 text-blue-900 font-semibold text-lg">
                          <Settings className="h-5 w-5 text-blue-400" />
                          <span>Text & Messages</span>
                        </CardTitle>
                        <p className="text-blue-400 text-sm">Customize text elements and placeholders</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-blue-700 font-medium">Chat Window Title</Label>
                          <Input 
                            id="title" 
                            value={appearance.title} 
                            onChange={e => setAppearance(prev => ({ ...prev, title: e.target.value }))} 
                            placeholder="Chat with us" 
                            className="border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="welcomeMessage" className="text-blue-700 font-medium">Welcome Message</Label>
                          <Textarea 
                            id="welcomeMessage" 
                            value={appearance.welcomeMessage} 
                            onChange={e => setAppearance(prev => ({ ...prev, welcomeMessage: e.target.value }))} 
                            placeholder="Hello! How can I help you today?" 
                            rows={2} 
                            className="border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200 resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inputPlaceholder" className="text-blue-700 font-medium">Input Placeholder</Label>
                          <Input 
                            id="inputPlaceholder" 
                            value={appearance.inputPlaceholder} 
                            onChange={e => setAppearance(prev => ({ ...prev, inputPlaceholder: e.target.value }))} 
                            placeholder="Type your message..." 
                            className="border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="leadButtonText" className="text-blue-700 font-medium">Lead Button Text</Label>
                          <Input 
                            id="leadButtonText" 
                            value={appearance.leadButtonText} 
                            onChange={e => setAppearance(prev => ({ ...prev, leadButtonText: e.target.value }))} 
                            placeholder="Get Started" 
                            className="border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="shadow-md rounded-2xl border border-blue-50 bg-white/80 p-12 text-center">
                    <Palette className="h-12 w-12 text-blue-200 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-blue-900 mb-2">No Active Chatbot</h3>
                    <p className="text-blue-400">Select a chatbot from the sidebar to customize its appearance.</p>
                  </Card>
                )}
              </TabsContent>

              {/* Visual Branding Tab */}
              <TabsContent value="global" className="space-y-6">
                <Card className="shadow-md rounded-2xl border border-blue-50 bg-white/80 p-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-blue-900 font-semibold text-lg">
                      <Image className="h-5 w-5 text-blue-400" />
                      <span>Visual Branding</span>
                    </CardTitle>
                    <p className="text-blue-400 text-sm">Customize your chatbot's icons and avatar</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-blue-700 font-medium">Chat Bubble Icon</Label>
                      <div className="flex items-center gap-4">
                        {activeChatbot?.chatBubbleIcon && (
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-100">
                            <img src={activeChatbot.chatBubbleIcon} alt="Chat Bubble Icon" className="w-8 h-8 rounded-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={e => { const file = e.target.files?.[0]; if (file) handleFileUpload('chatBubbleIcon', file); }} 
                            className="border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200" 
                          />
                          <p className="text-xs text-blue-400 mt-1">32x32px, PNG/JPG</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-blue-700 font-medium">Chat Widget Icon</Label>
                      <div className="flex items-center gap-4">
                        {appearance.chatWidgetIcon && (
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-100">
                            <img src={appearance.chatWidgetIcon} alt="Chat Widget Icon" className="w-8 h-8 rounded-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={e => { const file = e.target.files?.[0]; if (file) handleFileUpload('chatWidgetIcon', file); }} 
                            className="border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200" 
                          />
                          <p className="text-xs text-blue-400 mt-1">32x32px, PNG/JPG</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chatWidgetName" className="text-blue-700 font-medium">Chat Widget Name</Label>
                      <Input 
                        id="chatWidgetName"
                        value={appearance.chatWidgetName} 
                        onChange={e => setAppearance(prev => ({ ...prev, chatWidgetName: e.target.value }))} 
                        placeholder="Support Chat" 
                        className="border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-blue-700 font-medium">Chat Window Avatar</Label>
                      <div className="flex items-center gap-4">
                        {appearance.chatWindowAvatar && (
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-100">
                            <img src={appearance.chatWindowAvatar} alt="Chat Window Avatar" className="w-10 h-10 rounded-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={e => { const file = e.target.files?.[0]; if (file) handleFileUpload('chatWindowAvatar', file); }} 
                            className="border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200" 
                          />
                          <p className="text-xs text-blue-400 mt-1">64x64px, PNG/JPG</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>

            {/* Right Column: Live Preview */}
            <div className="space-y-6 lg:sticky lg:top-24 h-fit">
              <div ref={previewRef} className={`transition-all duration-500 ${highlightPreview ? 'ring-4 ring-blue-400 ring-opacity-60' : ''}`}>
                <Card className="shadow-md rounded-2xl border border-blue-50 bg-white/80">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-900 font-semibold text-lg">
                      <Eye className="h-5 w-5 text-blue-400" />
                      <span>Live Preview</span>
                    </CardTitle>
                    <p className="text-blue-400 text-sm">See your changes in real-time</p>
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
