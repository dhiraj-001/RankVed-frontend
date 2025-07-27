import { useState, useEffect, useRef } from 'react';
import { Save, Palette, Eye, Image, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChatPreview } from '@/components/chat/chat-preview';
import { useApp } from '@/contexts/app-context';
import { useUpdateChatbot, useChatbot } from '@/hooks/use-chatbots';
import {  compressAndConvertToDataURI } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Menu } from '@headlessui/react';


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
      console.log('[Appearance] Syncing with fetchedChatbot:', {
        chatbotId: fetchedChatbot.id,
        visualBranding: {
          chatBubbleIcon: fetchedChatbot.chatBubbleIcon ? 'Present' : 'Not set',
          chatWidgetIcon: fetchedChatbot.chatWidgetIcon ? 'Present' : 'Not set',
          chatWindowAvatar: fetchedChatbot.chatWindowAvatar ? 'Present' : 'Not set',
          chatWidgetName: fetchedChatbot.chatWidgetName
        }
      });
      
      setAppearance({
        title: fetchedChatbot.title || '',
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

  // Just before rendering <ChatPreview />
  const previewChatbot: any = {
    id: activeChatbot?.id || 'demo',
    name:  appearance.chatWidgetName || 'Support Bot',
    primaryColor: appearance.primaryColor,
    secondaryColor: appearance.secondaryColor,
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
        console.log('[Appearance] Saving appearance settings:', {
          chatbotId: activeChatbot.id,
          visualBranding: {
            chatBubbleIcon: appearance.chatBubbleIcon,
            chatWidgetIcon: appearance.chatWidgetIcon,
            chatWindowAvatar: appearance.chatWindowAvatar,
            chatWidgetName: appearance.chatWidgetName
          },
          appearance: {
            primaryColor: appearance.primaryColor,
            secondaryColor: appearance.secondaryColor,
            borderRadius: appearance.borderRadius,
            shadowStyle: appearance.shadowStyle,
            chatWindowTheme: appearance.chatWindowTheme
          }
        });

        await updateChatbot.mutateAsync({
          id: activeChatbot.id,
          data: {
            // Visual Branding
            chatBubbleIcon: appearance.chatBubbleIcon,
            chatWidgetIcon: appearance.chatWidgetIcon,
            chatWindowAvatar: appearance.chatWindowAvatar,
            chatWidgetName: appearance.chatWidgetName,
            // Appearance Settings
            primaryColor: appearance.primaryColor,
            secondaryColor: appearance.secondaryColor,
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
          },
        });
        
        console.log('[Appearance] Successfully saved to backend');
        toast({
          title: 'Appearance saved',
          description: 'Your chatbot appearance has been updated successfully.',
        });
        refetch(); // Refetch latest data after save
      } catch (error) {
        console.error('[Appearance] Error saving to backend:', error);
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
    console.log('[Appearance] handleFileUpload called:', { field, fileName: file.name, fileSize: file.size });
    try {
      // Compress and convert image to data URI
      const dataUri = await compressAndConvertToDataURI(file, 128, 128, 0.7);
      console.log('[Appearance] Image processed successfully:', { field, dataUriLength: dataUri.length });
      setAppearance(prev => ({ ...prev, [field]: dataUri }));
      console.log('[Appearance] State updated for field:', field);
    } catch (error) {
      console.error('[Appearance] Error processing image:', error);
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
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      {/* Header */}
      <header className="hidden sm:block backdrop-blur-md bg-gradient-to-br from-blue-50 via-white to-white border-b border-blue-50 px-4 sm:px-6 py-2 sm:py-4 sticky top-0 z-20 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto gap-2 sm:gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Chatbot Appearance</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              variant="outline"
              className="px-3 py-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => {
                if (previewRef.current) {
                  previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setHighlightPreview(true);
                  setTimeout(() => setHighlightPreview(false), 1200);
                }
              }}
            >
              <Eye className="h-4 w-4 mr-2" /> Preview
            </Button>
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
          <h2 className="text-lg font-bold text-slate-900">Appearance</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => {
                if (previewRef.current) {
                  previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setHighlightPreview(true);
                  setTimeout(() => setHighlightPreview(false), 1200);
                }
              }}
            >
              <Eye className="h-4 w-4 mr-1" /> Preview
            </Button>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile Dropdown */}
            <div className="sm:hidden shadow-md">
            <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg shadow-sm transition-all duration-500 ease-in-out">
                <SelectValue placeholder="Select a tab" />
              </SelectTrigger>
                <SelectContent className="animate-in fade-in duration-700 ease-in-out">
                {tabOptions.map((tab) => (
                    <SelectItem key={tab.value} value={tab.value} disabled={tab.disabled} className="transition-all duration-300 hover:bg-blue-50">
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Tabs */}
            <TabsList className="hidden sm:flex w-full bg-white border border-gray-200 rounded-lg p-1 shadow-sm transition-all duration-500 ease-in-out">
            <TabsTrigger
              value="chatbot"
              disabled={!activeChatbot}
                className="flex-1 text-gray-600 hover:text-gray-800 focus:text-gray-800 font-medium py-3 px-4 rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-500 ease-in-out hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <div className="flex items-center space-x-2 transition-all duration-500 ease-in-out">
                  <Palette className="h-4 w-4 transition-transform duration-500 ease-in-out data-[state=active]:scale-110" />
                  <span className="transition-all duration-500 ease-in-out">Chatbot Appearance</span>
                </div>
            </TabsTrigger>
            <TabsTrigger
              value="global"
                className="flex-1 text-gray-600 hover:text-gray-800 focus:text-gray-800 font-medium py-3 px-4 rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-500 ease-in-out hover:bg-gray-50"
            >
                <div className="flex items-center space-x-2 transition-all duration-500 ease-in-out">
                  <Image className="h-4 w-4 transition-transform duration-500 ease-in-out data-[state=active]:scale-110" />
                  <span className="transition-all duration-500 ease-in-out">Visual Branding</span>
                </div>
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Settings Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Chatbot Appearance Tab */}
              <TabsContent value="chatbot" className="space-y-6 animate-in fade-in duration-700 ease-in-out">
                {activeChatbot ? (
                  <>
                    {/* Color Settings Group */}
                    <Card className="shadow-md rounded-lg border border-gray-200 bg-white p-6">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                          <Palette className="h-5 w-5 text-blue-600" />
                          <span>Colors</span>
                        </CardTitle>
                        <p className="text-gray-600 text-sm">Set your chatbot's primary and secondary colors</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="primaryColor" className="text-gray-700 font-medium">Primary Color</Label>
                            <div className="flex items-center gap-3">
                              <Input 
                                id="primaryColor" 
                                type="color" 
                                value={appearance.primaryColor} 
                                onChange={e => setAppearance(prev => ({ ...prev, primaryColor: e.target.value }))} 
                                className="w-12 h-10 p-1 border rounded-lg cursor-pointer border-gray-200" 
                              />
                              <Input 
                                value={appearance.primaryColor} 
                                onChange={e => setAppearance(prev => ({ ...prev, primaryColor: e.target.value }))} 
                                placeholder="#6366F1" 
                                className="flex-1 border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="secondaryColor" className="text-gray-700 font-medium">Secondary Color</Label>
                            <div className="flex items-center gap-3">
                              <Input 
                                id="secondaryColor" 
                                type="color" 
                                value={/^#([0-9A-F]{3}){1,2}$/i.test(appearance.secondaryColor) ? appearance.secondaryColor : '#A7C7E7'} 
                                onChange={e => setAppearance(prev => ({ ...prev, secondaryColor: e.target.value }))} 
                                className="w-12 h-10 p-1 border rounded-lg cursor-pointer border-gray-200" 
                              />
                              <Input 
                                value={appearance.secondaryColor} 
                                onChange={e => setAppearance(prev => ({ ...prev, secondaryColor: e.target.value }))} 
                                placeholder="#A7C7E7" 
                                className="flex-1 border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200" 
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Text Settings Group */}
                    <Card className="shadow-md rounded-lg border border-gray-200 bg-white p-6">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                          <Settings className="h-5 w-5 text-blue-600" />
                          <span>Text & Messages</span>
                        </CardTitle>
                        <p className="text-gray-600 text-sm">Customize text elements and placeholders</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                   
                   
                        <div className="space-y-2">
                          <Label htmlFor="inputPlaceholder" className="text-gray-700 font-medium">Input Placeholder</Label>
                          <Input 
                            id="inputPlaceholder" 
                            value={appearance.inputPlaceholder} 
                            onChange={e => setAppearance(prev => ({ ...prev, inputPlaceholder: e.target.value }))} 
                            placeholder="Type your message..." 
                            className="border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200"
                          />
                        </div>
                        {/* Border Radius */}
                        <div className="space-y-2">
                          <Label htmlFor="borderRadius" className="text-gray-700 font-medium">Border Radius</Label>
                          <div className="flex items-center gap-4">
                            <input
                              id="borderRadius"
                              type="range"
                              min={0}
                              max={32}
                              value={appearance.borderRadius}
                              onChange={e => setAppearance(prev => ({ ...prev, borderRadius: Number(e.target.value) }))}
                              className="w-80 accent-blue-500 cursor-pointer"
                            />
                            <Input
                              type="number"
                              min={0}
                              max={32}
                              value={appearance.borderRadius}
                              onChange={e => setAppearance(prev => ({ ...prev, borderRadius: Number(e.target.value) }))}
                              className="w-20 border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200 text-center"
                            />
                            <span className="text-xs text-gray-500">px</span>
                          </div>
                        </div>
                        {/* Theme */}
                        <div className="space-y-2">
                          <Label htmlFor="chatWindowTheme" className="text-gray-700 font-medium mr-4">Theme</Label>
                          <Menu as="div" className="relative inline-block text-left w-40">
                            <Menu.Button className="inline-flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out">
                              <span className="font-medium text-gray-700">{appearance.chatWindowTheme === 'light' ? 'Light' : appearance.chatWindowTheme === 'dark' ? 'Dark' : 'Auto'}</span>
                              <svg className="h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
                            </Menu.Button>
                            <Menu.Items className="absolute right-0 mt-2 w-full origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in duration-500 ease-in-out">
                              <Menu.Item>
                                {({ active }: { active: boolean }) => (
                                  <button
                                    className={`w-full text-left px-3 py-2 text-sm rounded transition-all duration-300 ease-in-out ${appearance.chatWindowTheme === 'light' ? 'bg-blue-100 text-blue-700' : active ? 'bg-gray-100' : ''}`}
                                    onClick={() => setAppearance(prev => ({ ...prev, chatWindowTheme: 'light' as any }))}
                                  >
                                    Light
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }: { active: boolean }) => (
                                  <button
                                    className={`w-full text-left px-3 py-2 text-sm rounded transition-all duration-300 ease-in-out ${appearance.chatWindowTheme === 'dark' ? 'bg-blue-100 text-blue-700' : active ? 'bg-gray-100' : ''}`}
                                    onClick={() => setAppearance(prev => ({ ...prev, chatWindowTheme: 'dark' as any }))}
                                  >
                                    Dark
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }: { active: boolean }) => (
                                  <button
                                    className={`w-full text-left px-3 py-2 text-sm rounded transition-all duration-300 ease-in-out ${appearance.chatWindowTheme === 'auto' ? 'bg-blue-100 text-blue-700' : active ? 'bg-gray-100' : ''}`}
                                    onClick={() => setAppearance(prev => ({ ...prev, chatWindowTheme: 'auto' as any }))}
                                  >
                                    Auto
                                  </button>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Menu>
                        </div>
                        {/* Shadow Style */}
                        <div className="space-y-2">
                          <Label htmlFor="shadowStyle" className="text-gray-700 font-medium mr-4">Shadow Style</Label>
                          <Menu as="div" className="relative inline-block text-left w-40">
                            <Menu.Button className="inline-flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out">
                              <span className="font-medium text-gray-700">{appearance.shadowStyle === 'none' ? 'No Shadow' : appearance.shadowStyle === 'soft' ? 'Soft' : appearance.shadowStyle === 'medium' ? 'Medium' : 'Strong'}</span>
                              <svg className="h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
                            </Menu.Button>
                            <Menu.Items className="absolute right-0 mt-2 w-full origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in duration-500 ease-in-out">
                              <Menu.Item>
                                {({ active }: { active: boolean }) => (
                                  <button
                                    className={`w-full text-left px-3 py-2 text-sm rounded transition-all duration-300 ease-in-out ${appearance.shadowStyle === 'none' ? 'bg-blue-100 text-blue-700' : active ? 'bg-gray-100' : ''}`}
                                    onClick={() => setAppearance(prev => ({ ...prev, shadowStyle: 'none' as any }))}
                                  >
                                    No Shadow
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }: { active: boolean }) => (
                                  <button
                                    className={`w-full text-left px-3 py-2 text-sm rounded transition-all duration-300 ease-in-out ${appearance.shadowStyle === 'soft' ? 'bg-blue-100 text-blue-700' : active ? 'bg-gray-100' : ''}`}
                                    onClick={() => setAppearance(prev => ({ ...prev, shadowStyle: 'soft' as any }))}
                                  >
                                    Soft
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }: { active: boolean }) => (
                                  <button
                                    className={`w-full text-left px-3 py-2 text-sm rounded transition-all duration-300 ease-in-out ${appearance.shadowStyle === 'medium' ? 'bg-blue-100 text-blue-700' : active ? 'bg-gray-100' : ''}`}
                                    onClick={() => setAppearance(prev => ({ ...prev, shadowStyle: 'medium' as any }))}
                                  >
                                    Medium
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }: { active: boolean }) => (
                                  <button
                                    className={`w-full text-left px-3 py-2 text-sm rounded transition-all duration-300 ease-in-out ${appearance.shadowStyle === 'strong' ? 'bg-blue-100 text-blue-700' : active ? 'bg-gray-100' : ''}`}
                                    onClick={() => setAppearance(prev => ({ ...prev, shadowStyle: 'strong' as any }))}
                                  >
                                    Strong
                                  </button>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Menu>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="shadow-md rounded-lg border border-gray-200 bg-white p-12 text-center">
                    <Palette className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Chatbot</h3>
                    <p className="text-gray-500">Select a chatbot from the sidebar to customize its appearance.</p>
                  </Card>
                )}
              </TabsContent>

              {/* Visual Branding Tab */}
              <TabsContent value="global" className="space-y-6 animate-in fade-in duration-700 ease-in-out">
                <Card className="shadow-md rounded-lg border border-gray-200 bg-white p-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                      <Image className="h-5 w-5 text-blue-600" />
                      <span>Visual Branding</span>
                    </CardTitle>
                    <p className="text-gray-600 text-sm">Customize your chatbot's icons and avatar</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Chat Bubble Icon</Label>
                      <div className="flex items-center gap-4">
                        {appearance.chatBubbleIcon && (
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-200">
                            <img src={appearance.chatBubbleIcon} alt="Chat Bubble Icon" className="w-8 h-8 rounded-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={e => { 
                              const file = e.target.files?.[0]; 
                              if (file) {
                                console.log('[Appearance] Uploading chat bubble icon:', file.name);
                                handleFileUpload('chatBubbleIcon', file);
                              }
                            }} 
                            className="border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200" 
                          />
                          <p className="text-xs text-gray-500 mt-1">32x32px, PNG/JPG</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Chat Widget Icon</Label>
                      <div className="flex items-center gap-4">
                        {appearance.chatWidgetIcon && (
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-200">
                            <img src={appearance.chatWidgetIcon} alt="Chat Widget Icon" className="w-8 h-8 rounded-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={e => { 
                              const file = e.target.files?.[0]; 
                              if (file) {
                                console.log('[Appearance] Uploading chat widget icon:', file.name);
                                handleFileUpload('chatWidgetIcon', file);
                              }
                            }} 
                            className="border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200" 
                          />
                          <p className="text-xs text-gray-500 mt-1">32x32px, PNG/JPG</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chatWidgetName" className="text-gray-700 font-medium">Chat Widget Name</Label>
                      <Input 
                        id="chatWidgetName"
                        value={appearance.chatWidgetName} 
                        onChange={e => setAppearance(prev => ({ ...prev, chatWidgetName: e.target.value }))} 
                        placeholder="Support Chat" 
                        className="border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Chat Window Avatar</Label>
                      <div className="flex items-center gap-4">
                        {appearance.chatWindowAvatar && (
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-200">
                            <img src={appearance.chatWindowAvatar} alt="Chat Window Avatar" className="w-10 h-10 rounded-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={e => { 
                              const file = e.target.files?.[0]; 
                              if (file) {
                                console.log('[Appearance] Uploading chat window avatar:', file.name);
                                handleFileUpload('chatWindowAvatar', file);
                              }
                            }} 
                            className="border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200 rounded-lg transition-all duration-200 hover:border-blue-200" 
                          />
                          <p className="text-xs text-gray-500 mt-1">64x64px, PNG/JPG</p>
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
                <Card className="shadow-md rounded-lg border border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-gray-900 font-semibold text-lg">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <span>Live Preview</span>
                    </CardTitle>
                    <p className="text-gray-600 text-sm">See your changes in real-time</p>
                  </CardHeader>
                  <CardContent>
                    <ChatPreview chatbot={previewChatbot} />
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
