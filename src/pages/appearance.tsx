import { useState, useEffect, useRef } from 'react';
import { Save, Palette, Eye, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
    chatWindowAvatar: appearance.chatWindowAvatar,
    chatBubbleIcon: appearance.chatBubbleIcon,
    chatWidgetIcon: appearance.chatWidgetIcon,
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
  const embedCode = `<script>
  window.chatbotConfig = ${JSON.stringify({
    chatbotId: previewChatbot.id,
    primaryColor: previewChatbot.primaryColor,
    borderRadius: previewChatbot.borderRadius,
    chatWindowAvatar: previewChatbot.chatWindowAvatar,
    chatBubbleIcon: previewChatbot.chatBubbleIcon,
    chatWidgetIcon: previewChatbot.chatWidgetIcon,
    chatWidgetName: previewChatbot.chatWidgetName,
    poweredByText: previewChatbot.poweredByText,
    poweredByLink: previewChatbot.poweredByLink,
    welcomeMessage: previewChatbot.welcomeMessage,
    inputPlaceholder: previewChatbot.inputPlaceholder,
    shadowStyle: previewChatbot.shadowStyle,
    chatWindowStyle: previewChatbot.chatWindowStyle,
    chatWindowTheme: previewChatbot.chatWindowTheme,
    // ...add more as needed
  }, null, 2)};
</script>
<script src='https://your-cdn/chatbot.js'></script>`;

  const [newSuggestion, setNewSuggestion] = useState('');
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

  const addSuggestionButton = () => {
    console.log('addSuggestionButton called', newSuggestion);
    if (newSuggestion.trim()) {
      setAppearance(prev => ({
        ...prev,
        suggestionButtons: [...prev.suggestionButtons, newSuggestion.trim()]
      }));
      setNewSuggestion('');
    }
  };

  const removeSuggestionButton = (index: number) => {
    console.log('removeSuggestionButton called', index);
    setAppearance(prev => ({
      ...prev,
      suggestionButtons: prev.suggestionButtons.filter((_: string, i: number) => i !== index)
    }));
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-6 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between max-w-7xl mx-auto gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Chatbot Appearance</h2>
            <p className="text-slate-500 mt-1 text-base font-normal">
              {activeChatbot
                ? `Customize the appearance of "${activeChatbot.name}"`
                : 'Select a chatbot to begin customizing its look and feel.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={() => {
                if (previewRef.current) {
                  previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setHighlightPreview(true);
                  setTimeout(() => setHighlightPreview(false), 1200);
                }
              }}
            >
              <Eye className="h-5 w-5 mr-2" /> Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateChatbot.isPending}
              className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white font-semibold px-6 py-2 rounded-lg shadow-sm"
            >
              <Save className="h-5 w-5 mr-2" />
              {updateChatbot.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue={activeChatbot ? 'chatbot' : 'global'} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="chatbot" disabled={!activeChatbot}>Chatbot Appearance</TabsTrigger>
              <TabsTrigger value="global">Visual Branding</TabsTrigger>
            </TabsList>

            {/* Chatbot Appearance Tab */}
            <TabsContent value="chatbot" className="space-y-8">
              {activeChatbot ? (
                <>
                  {/* Basic Settings */}
                  <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                        <Palette className="h-5 w-5" /> Basic Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="title">Chat Window Title</Label>
                          <Input id="title" value={appearance.title} onChange={e => { console.log('title changed', e.target.value); setAppearance(prev => ({ ...prev, title: e.target.value })) }} placeholder="Chat with us" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="primaryColor">Primary Color</Label>
                          <div className="flex items-center gap-3">
                            <Input id="primaryColor" type="color" value={appearance.primaryColor} onChange={e => setAppearance(prev => ({ ...prev, primaryColor: e.target.value }))} className="w-12 h-10 p-1 border rounded" />
                            <Input value={appearance.primaryColor} onChange={e => setAppearance(prev => ({ ...prev, primaryColor: e.target.value }))} placeholder="#6366F1" className="flex-1" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="welcomeMessage">Welcome Message</Label>
                        <Textarea id="welcomeMessage" value={appearance.welcomeMessage} onChange={e => setAppearance(prev => ({ ...prev, welcomeMessage: e.target.value }))} placeholder="Hello! How can I help you today?" rows={2} />
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Switch id="showWelcomePopup" checked={appearance.showWelcomePopup} onCheckedChange={checked => setAppearance(prev => ({ ...prev, showWelcomePopup: checked }))} />
                        <Label htmlFor="showWelcomePopup">Show welcome message popup</Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Modern Styling */}
                  <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                        <Eye className="h-5 w-5" /> Modern Styling
                      </CardTitle>
                      <p className="text-sm text-slate-500">Customize the chat window's look and feel</p>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="chatWindowStyle">Window Style</Label>
                          <select id="chatWindowStyle" value={appearance.chatWindowStyle} onChange={e => setAppearance(prev => ({ ...prev, chatWindowStyle: e.target.value as 'modern' | 'classic' | 'minimal' | 'floating' }))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="modern">Modern</option>
                            <option value="classic">Classic</option>
                            <option value="minimal">Minimal</option>
                            <option value="floating">Floating</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chatWindowTheme">Theme</Label>
                          <select id="chatWindowTheme" value={appearance.chatWindowTheme} onChange={e => setAppearance(prev => ({ ...prev, chatWindowTheme: e.target.value as 'light' | 'dark' | 'auto' }))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="borderRadius">Border Radius ({appearance.borderRadius}px)</Label>
                          <input id="borderRadius" type="range" min="0" max="32" value={appearance.borderRadius} onChange={e => setAppearance(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))} className="w-full" />
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Sharp (0px)</span>
                            <span>Very Rounded (32px)</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shadowStyle">Shadow Style</Label>
                          <select id="shadowStyle" value={appearance.shadowStyle} onChange={e => setAppearance(prev => ({ ...prev, shadowStyle: e.target.value as 'none' | 'soft' | 'medium' | 'strong' }))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="none">None</option>
                            <option value="soft">Soft</option>
                            <option value="medium">Medium</option>
                            <option value="strong">Strong</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center items-center">
                        <Label className="mb-2">Style Preview</Label>
                        <div className="w-64 h-32 border rounded-lg flex flex-col justify-center items-center bg-white shadow-sm" style={{ borderRadius: `${appearance.borderRadius}px`, boxShadow: appearance.shadowStyle === 'soft' ? '0 1px 4px rgba(0,0,0,0.06)' : appearance.shadowStyle === 'medium' ? '0 2px 8px rgba(0,0,0,0.10)' : appearance.shadowStyle === 'strong' ? '0 4px 16px rgba(0,0,0,0.16)' : 'none', background: appearance.chatWindowTheme === 'dark' ? '#1e293b' : '#fff' }}>
                          <span className={`text-base font-medium ${appearance.chatWindowTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Chat Preview</span>
                          <span className={`text-xs mt-1 ${appearance.chatWindowTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{appearance.chatWindowStyle} style</span>
                          <span className="mt-2 px-2 py-1 rounded text-xs text-white" style={{ backgroundColor: appearance.primaryColor }}>Sample message</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Replies */}
                  <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Quick Reply Buttons</CardTitle>
                      <p className="text-sm text-slate-500">Add quick replies for faster user engagement</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input value={newSuggestion} onChange={e => setNewSuggestion(e.target.value)} placeholder="Add a quick reply..." onKeyPress={e => e.key === 'Enter' && addSuggestionButton()} />
                        <Button onClick={addSuggestionButton} disabled={!newSuggestion.trim()}>Add</Button>
                      </div>
                      <div className="space-y-2">
                        {appearance.suggestionButtons.map((suggestion: string, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm">{suggestion}</span>
                            <Button variant="ghost" size="sm" onClick={() => removeSuggestionButton(index)} className="text-red-600 hover:text-red-700">Remove</Button>
                          </div>
                        ))}
                        {appearance.suggestionButtons.length === 0 && (
                          <p className="text-sm text-slate-400 text-center py-4">No quick replies yet</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label htmlFor="suggestionTiming">Show Quick Replies</Label>
                          <Select
                            value={appearance.suggestionTiming}
                            onValueChange={value => setAppearance(prev => ({ ...prev, suggestionTiming: value as 'initial' | 'after_welcome' | 'after_first_message' | 'manual' }))}
                          >
                            <SelectTrigger><SelectValue placeholder="Select timing" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="initial">Immediately</SelectItem>
                              <SelectItem value="after_welcome">After welcome message</SelectItem>
                              <SelectItem value="after_first_message">After user's first message</SelectItem>
                              <SelectItem value="manual">Manual only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="suggestionPersistence">Button Behavior</Label>
                          <Select
                            value={appearance.suggestionPersistence}
                            onValueChange={value => setAppearance(prev => ({ ...prev, suggestionPersistence: value as 'until_clicked' | 'always_visible' | 'hide_after_timeout' }))}
                          >
                            <SelectTrigger><SelectValue placeholder="Select behavior" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="until_clicked">Hide after click</SelectItem>
                              <SelectItem value="always_visible">Always visible</SelectItem>
                              <SelectItem value="hide_after_timeout">Hide after timeout</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {appearance.suggestionPersistence === 'hide_after_timeout' && (
                          <div className="space-y-2 col-span-2">
                            <Label htmlFor="suggestionTimeout">Hide After (seconds)</Label>
                            <Input id="suggestionTimeout" type="number" value={appearance.suggestionTimeout ? appearance.suggestionTimeout / 1000 : 30} onChange={e => setAppearance(prev => ({ ...prev, suggestionTimeout: parseInt(e.target.value) * 1000 }))} min="5" max="300" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Text Customization */}
                  <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Text Customization</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="inputPlaceholder">Input Placeholder</Label>
                        <Input id="inputPlaceholder" value={appearance.inputPlaceholder} onChange={e => setAppearance(prev => ({ ...prev, inputPlaceholder: e.target.value }))} placeholder="Type your message..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="leadButtonText">Lead Button Text</Label>
                        <Input id="leadButtonText" value={appearance.leadButtonText} onChange={e => setAppearance(prev => ({ ...prev, leadButtonText: e.target.value }))} placeholder="Get Started" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="shadow-sm border-slate-200">
                  <CardContent className="py-12 text-center">
                    <Palette className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Chatbot</h3>
                    <p className="text-slate-500">Select a chatbot from the sidebar to customize its appearance.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Visual Branding Tab */}
            <TabsContent value="global" className="space-y-8">
              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Visual Branding</CardTitle>
                  <p className="text-sm text-slate-500">Customize your chatbot's icons and avatar</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Chat Bubble Icon</Label>
                    <div className="flex items-center gap-4">
                      {activeChatbot?.chatBubbleIcon && (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <img src={activeChatbot.chatBubbleIcon} alt="Chat Bubble Icon" className="w-8 h-8 rounded-full object-cover" />
                        </div>
                      )}
                      <div>
                        <Input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) handleFileUpload('chatBubbleIcon', file); }} className="w-full" />
                        <p className="text-xs text-slate-500 mt-1">32x32px, PNG/JPG</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Chat Widget Icon</Label>
                    <div className="flex items-center gap-4">
                      {appearance.chatWidgetIcon && (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <img src={appearance.chatWidgetIcon} alt="Chat Widget Icon" className="w-8 h-8 rounded-full object-cover" />
                        </div>
                      )}
                      <div>
                        <Input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) handleFileUpload('chatWidgetIcon', file); }} className="w-full" />
                        <p className="text-xs text-slate-500 mt-1">32x32px, PNG/JPG</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Chat Widget Name</Label>
                    <Input value={appearance.chatWidgetName} onChange={e => setAppearance(prev => ({ ...prev, chatWidgetName: e.target.value }))} placeholder="Support Chat" className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label>Chat Window Avatar</Label>
                    <div className="flex items-center gap-4">
                      {appearance.chatWindowAvatar && (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <img src={appearance.chatWindowAvatar} alt="Chat Window Avatar" className="w-10 h-10 rounded-full object-cover" />
                        </div>
                      )}
                      <div>
                        <Input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) handleFileUpload('chatWindowAvatar', file); }} className="w-full" />
                        <p className="text-xs text-slate-500 mt-1">64x64px, PNG/JPG</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Live Preview & Embed Code */}
        <div className="space-y-8 lg:sticky lg:top-24 h-fit">
          <div ref={previewRef} className={`transition-all duration-500 ${highlightPreview ? 'ring-4 ring-blue-400 ring-opacity-60' : ''}`}>
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold"><Eye className="h-5 w-5" /> Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <ChatPreview chatbot={previewChatbot} {...previewProps} />
              </CardContent>
            </Card>
          </div>
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold"><Code className="h-5 w-5" /> Embed Code</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={embedCode} readOnly className="font-mono text-xs min-h-[180px] bg-slate-50" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
