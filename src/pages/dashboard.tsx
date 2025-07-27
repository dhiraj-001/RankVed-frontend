import { Bot, MessageCircle, Users, TrendingUp, Download, Plus, Trash, Edit, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChatPreview } from '@/components/chat/chat-preview';
import { useDashboardStats } from '@/hooks/use-leads';
import { useChatbots } from '@/hooks/use-chatbots';
import { useApp } from '@/contexts/app-context';
import { formatTimeAgo } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useChatbotActions } from '@/hooks/use-chatbot-actions';
import { useEffect, useState } from 'react';
import { useLeads } from '@/hooks/use-leads';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { activeChatbot } = useApp();
  const { data: stats } = useDashboardStats();
  const { data: chatbots, isLoading: chatbotsLoading } = useChatbots();

  // Chatbot creation dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newChatbot, setNewChatbot] = useState<{
    id?: string;
    name: string;
    aiSystemPrompt: string;
    welcomeMessage: string;
    isActive: boolean;
    inputPlaceholder: string;
    primaryColor: string;
    chatWindowAvatar: string;
    chatBubbleIcon: string;
    chatWidgetIcon: string;
    chatWidgetName: string;
    poweredByText: string;
    poweredByLink: string;
    suggestionButtons: string;
    suggestionTiming: string;
    suggestionPersistence: string;
    suggestionTimeout: number;
    leadCollectionEnabled: boolean;
    leadCollectionAfterMessages: number;
    leadCollectionMessage: string;
    chatWindowStyle: string;
    chatWindowTheme: string;
    borderRadius: number;
    shadowStyle: string;
    popupDelay: number;
    replyDelay: number;
  }>({
    name: '',
    aiSystemPrompt: '',
    welcomeMessage: '',
    isActive: true,
    inputPlaceholder: 'Type your message...',
    primaryColor: '#6366F1',
    chatWindowAvatar: '',
    chatBubbleIcon: '',
    chatWidgetIcon: '',
    chatWidgetName: '',
    poweredByText: '',
    poweredByLink: '',
    suggestionButtons: '',
    suggestionTiming: 'initial',
    suggestionPersistence: 'until_clicked',
    suggestionTimeout: 30000,
    leadCollectionEnabled: true,
    leadCollectionAfterMessages: 3,
    leadCollectionMessage: 'To help you better, may I have your name and contact information!',
    chatWindowStyle: 'modern',
    chatWindowTheme: 'light',
    borderRadius: 16,
    shadowStyle: 'soft',
    popupDelay: 2000,
    replyDelay: 1000
  });
  const { handleCreateChatbot, handleUpdateChatbot, handleDeleteChatbot, createChatbot, updateChatbot } = useChatbotActions({ setShowCreateDialog, setNewChatbot });
  const [editMode, setEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [chatbotToDelete, setChatbotToDelete] = useState<{ id: string, name: string } | null>(null);

  // Function to handle edit button click
  const handleEditChatbot = (chatbot: any) => {
    setNewChatbot({ ...chatbot, id: chatbot.id });
    setEditMode(true);
    setShowCreateDialog(true);
  };

  // Function to handle preview button click
  const handlePreviewChatbot = (chatbot: any) => {
    window.open(`/chat-test?chatbotId=${chatbot.id}`, '_blank');
  };

  // Reset edit mode when dialog closes
  useEffect(() => {
    if (!showCreateDialog) {
      setEditMode(false);
      setNewChatbot({
        name: '',
        aiSystemPrompt: '',
        welcomeMessage: '',
        isActive: true,
        inputPlaceholder: 'Type your message...',
        primaryColor: '#6366F1',
        chatWindowAvatar: '',
        chatBubbleIcon: '',
        chatWidgetIcon: '',
        chatWidgetName: '',
        poweredByText: '',
        poweredByLink: '',
        suggestionButtons: '',
        suggestionTiming: 'initial',
        suggestionPersistence: 'until_clicked',
        suggestionTimeout: 30000,
        leadCollectionEnabled: true,
        leadCollectionAfterMessages: 3,
        leadCollectionMessage: 'To help you better, may I have your name and contact information!',
        chatWindowStyle: 'modern',
        chatWindowTheme: 'light',
        borderRadius: 16,
        shadowStyle: 'soft',
        popupDelay: 2000,
        replyDelay: 1000
      });
    }
  }, [showCreateDialog]);

  // Fetch all leads for recent leads section using useLeads (like leads page)
  const { data: leads, isLoading: leadsLoading } = useLeads();

  // Toggle state for chatbots and leads
  const [showChatbots, setShowChatbots] = useState(true);
  const [showLeads, setShowLeads] = useState(false);

  const statsData = [
    {
      title: 'Total Conversations',
      value: stats?.totalConversations || 0,
      change: (stats?.totalConversations ?? 0) > 0 ? 'Active' : 'No data',
      trend: (stats?.totalConversations ?? 0) > 0 ? 'up' : 'neutral',
      icon: MessageCircle,
      color: 'blue',
    },
    {
      title: 'Leads Generated',
      value: stats?.totalLeads || 0,
      change: (stats?.totalLeads ?? 0) > 0 ? 'Active' : 'No data',
      trend: (stats?.totalLeads ?? 0) > 0 ? 'up' : 'neutral',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Response Rate',
      value: stats && (stats.totalConversations ?? 0) > 0 ? `${Math.round(((stats.totalLeads ?? 0) / (stats.totalConversations ?? 1)) * 100)}%` : '0%',
      change: 'Real-time',
      trend: 'neutral',
      icon: TrendingUp,
      color: 'blue',
    },
    {
      title: 'Active Chatbots',
      value: stats?.activeChatbots || 0,
      change: 'No change',
      trend: 'neutral',
      icon: Bot,
      color: 'blue',
    },
  ];

  // Export leads as CSV
  const exportLeads = () => {
    if (!leads || leads.length === 0) return;
    const csvContent = [
      ['Name', 'Phone', 'Email', 'Consent', 'Chatbot', 'Date'].join(','),
      ...leads.slice(0, 10).map(lead => [
        lead.name,
        lead.phone || '',
        lead.email || '',
        lead.consentGiven ? 'Yes' : 'No',
        chatbots?.find(c => c.id === lead.chatbotId)?.name || 'Unknown',
        new Date(lead.createdAt).toLocaleString()
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Leads exported as CSV', variant: 'default' });
  };

  // Export dashboard stats as CSV (formatted like leads page)
  const exportDashboardStats = () => {
    if (!stats) return;
    const csvContent = [
      ['Metric', 'Value'].join(','),
      ['Total Conversations', stats.totalConversations ?? 0].join(','),
      ['Leads Generated', stats.totalLeads ?? 0].join(','),
      ['Response Rate', stats.totalConversations ? `${Math.round(((stats.totalLeads ?? 0) / (stats.totalConversations ?? 1)) * 100)}%` : '0%'].join(','),
      ['Active Chatbots', stats.activeChatbots ?? 0].join(',')
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-stats-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Dashboard stats exported as CSV', variant: 'default' });
  };

  return (
    <>

      <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-white min-h-screen">
        {/* Chatbot Creation Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[430px] bg-white rounded-2xl shadow-2xl border border-blue-50 p-0 overflow-hidden">
            <DialogHeader className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <DialogTitle className="text-2xl font-bold text-slate-900">{editMode ? 'Edit Chatbot' : 'Create New Chatbot'}</DialogTitle>
              <p className="text-slate-500 text-sm mt-1">Set up your chatbot's basic details and welcome message.</p>
            </DialogHeader>
            <div className="space-y-2 px-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold">Chatbot Name</Label>
                <Input
                  id="name"
                  value={newChatbot.name}
                  onChange={(e) => setNewChatbot(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Customer Support Bot"
                  className="focus:ring-2 focus:ring-blue-200 focus:border-blue-200 transition-all rounded-lg border-blue-50 hover:border-blue-100"
                />
              </div>
              <div className="border-t border-slate-100 pt-6 space-y-2">
                <Label htmlFor="prompt" className="font-semibold">AI System Prompt</Label>
                <Textarea
                  id="prompt"
                  value={newChatbot.aiSystemPrompt}
                  onChange={(e) => setNewChatbot(prev => ({ ...prev, aiSystemPrompt: e.target.value }))}
                  placeholder="You are a helpful customer service assistant..."
                  className="focus:ring-2 focus:ring-blue-200 focus:border-blue-200 transition-all rounded-lg border-blue-50 hover:border-blue-100 min-h-[80px]"
                />
              </div>
              <div className="border-t border-slate-100 pt-6 space-y-2">
                <Label htmlFor="welcome" className="font-semibold">Welcome Message</Label>
                <Input
                  id="welcome"
                  value={newChatbot.welcomeMessage}
                  onChange={(e) => setNewChatbot(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                  placeholder="Hello! How can I help you today?"
                  className="focus:ring-2 focus:ring-blue-200 focus:border-blue-200 transition-all rounded-lg border-blue-50 hover:border-blue-100"
                />
              </div>
              <div className="border-t border-slate-100 pt-6 space-y-4">
                {/* Active Status */}
                <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newChatbot.isActive}
                  onCheckedChange={(checked) => setNewChatbot(prev => ({ ...prev, isActive: checked }))}
                  className={`transition-colors duration-300 w-10 h-6 rounded-full relative focus:ring-2 focus:ring-blue-200 focus:border-blue-200
                      ${newChatbot.isActive ? 'bg-blue-200 shadow-blue-100 shadow' : 'bg-blue-50'}
                    `}
                />
                <Label
                  htmlFor="active"
                  className={`ml-2 font-medium transition-colors duration-300 flex items-center select-none
                      ${newChatbot.isActive ? 'text-blue-600' : 'text-blue-400'}
                    `}
                >
                  {newChatbot.isActive ? (
                    <>
                      <svg className="h-4 w-4 mr-1 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Active
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                      </svg>
                      Paused
                    </>
                  )}
                </Label>
                </div>


              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} aria-label="Cancel chatbot creation" className="rounded-lg px-5 py-2 border-blue-100">
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (editMode && newChatbot.id) {
                      const { id, ...data } = newChatbot;
                      await handleUpdateChatbot(id, data);
                      setEditMode(false);
                      setNewChatbot({
                        name: '',
                        aiSystemPrompt: '',
                        welcomeMessage: '',
                        isActive: true,
                        inputPlaceholder: 'Type your message...',
                        primaryColor: '#6366F1',
                        chatWindowAvatar: '',
                        chatBubbleIcon: '',
                        chatWidgetIcon: '',
                        chatWidgetName: '',
                        poweredByText: '',
                        poweredByLink: '',
                        suggestionButtons: '',
                        suggestionTiming: 'initial',
                        suggestionPersistence: 'until_clicked',
                        suggestionTimeout: 30000,
                        leadCollectionEnabled: true,
                        leadCollectionAfterMessages: 3,
                        leadCollectionMessage: 'To help you better, may I have your name and contact information!',
                        chatWindowStyle: 'modern',
                        chatWindowTheme: 'light',
                        borderRadius: 16,
                        shadowStyle: 'soft',
                        popupDelay: 2000,
                        replyDelay: 1000
                      });
                    } else {
                      await handleCreateChatbot(newChatbot);
                    }
                  }}
                  disabled={!newChatbot.name || (editMode ? updateChatbot.isPending : createChatbot.isPending)}
                  aria-label={editMode ? 'Save chatbot changes' : 'Create new chatbot'}
                  className="rounded-lg px-5 py-2 shadow-sm font-semibold bg-blue-100 text-blue-900 hover:bg-blue-200"
                >
                  {(editMode ? updateChatbot.isPending : createChatbot.isPending) ? (
                    <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    editMode ? 'Save Changes' : 'Create Chatbot'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[425px] transition-all duration-300 bg-white border border-blue-50">
            <DialogHeader>
              <DialogTitle>Delete Chatbot</DialogTitle>
            </DialogHeader>
            <div>
              Are you sure you want to delete <b>{chatbotToDelete?.name}</b>? This action cannot be undone.
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} aria-label="Cancel chatbot deletion">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (chatbotToDelete) {
                    handleDeleteChatbot(chatbotToDelete.id);
                  }
                  setShowDeleteDialog(false);
                }}
                aria-label="Confirm chatbot deletion"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Responsive Header */}
        <header className="hidden sm:block backdrop-blur-md bg-gradient-to-br from-blue-50 via-white to-white border-b border-blue-50 px-4 sm:px-6 py-2 sm:py-4 sticky top-0 z-20 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto gap-2 sm:gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h2>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportDashboardStats}
                aria-label="Export dashboard stats as CSV"
                className="px-3 py-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-2 " /> Export
              </Button>

              <Button
                size="sm"
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1.5"
                onClick={() => setShowCreateDialog(true)}
                aria-label="Create new chatbot"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="text-xs sm:text-sm">Create</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Dashboard</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportDashboardStats}
                aria-label="Export dashboard stats as CSV"
                className="px-3 py-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5"
                onClick={() => setShowCreateDialog(true)}
                aria-label="Create new chatbot"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Overview */}
        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-6">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, i) => (
              <Card key={i} className="shadow-md rounded-lg border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-200 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  <div className={`rounded-full p-3 bg-blue-100 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-6 w-6 text-blue-600`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.change}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Analytics & Chatbots */}
            <div className="lg:col-span-2 space-y-6">
              {/* Toggle for Chatbots List */}
              <div 
                className={`flex items-center gap-3 mt-4 cursor-pointer select-none p-3 rounded-lg transition-all duration-300 hover:shadow-md ${
                  showChatbots 
                    ? 'bg-blue-50 border border-blue-100 shadow-md' 
                    : 'bg-white border border-gray-200 hover:border-blue-300 shadow-md'
                }`} 
                onClick={() => setShowChatbots(v => !v)}
              >
                <div className={`p-2 rounded-lg transition-colors duration-300 ${
                  showChatbots ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Bot className="h-5 w-5" />
                </div>
                <span className={`font-bold text-lg transition-colors duration-300 ${
                  showChatbots ? 'text-blue-600' : 'text-gray-700'
                }`}>Active Chatbots</span>
                <div className={`ml-auto p-1 rounded-full transition-all duration-300 ${
                  showChatbots ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {showChatbots ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
              <div className={`transition-all duration-700 ease-in-out overflow-hidden ${showChatbots ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}> 
                {showChatbots && (
                  <Card className="shadow-md rounded-lg border border-gray-200 bg-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Bot className="h-5 w-5 text-blue-600" />
                        Active Chatbots
                      </CardTitle>
                      <p className="text-gray-600">Manage and monitor your deployed chatbots</p>
                    </CardHeader>
                    <CardContent className="p-0 ">
                      <div className="overflow-x-auto ">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                              <th className="text-left p-4 font-medium text-gray-600">Name</th>
                              <th className="text-left p-4 font-medium text-gray-600">Status</th>
                              <th className="text-left p-4 font-medium text-gray-600">Conversations</th>
                              <th className="text-left p-4 font-medium text-gray-600">Leads</th>
                              <th className="text-left p-4 font-medium text-gray-600">Last Active</th>
                              <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {chatbotsLoading ? (
                              <tr>
                                <td colSpan={6} className="p-4">
                                  <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                  </div>
                                </td>
                              </tr>
                            ) : !chatbots || chatbots.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-8 text-center">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <Bot className="h-10 w-10 text-gray-300 mb-2" />
                                    <span className="text-lg font-semibold text-gray-400">No chatbots found.</span>
                                    <span className="text-sm text-gray-400">Create a chatbot to get started!</span>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              chatbots?.map((chatbot) => (
                                <tr key={chatbot.id} className="border-b border-blue-50 hover:bg-blue-50/60 transition-colors group">
                                  <td className="p-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 via-blue-50 to-white flex items-center justify-center shadow-md">
                                        {typeof chatbot.chatWidgetIcon === 'string' && chatbot.chatWidgetIcon.trim() !== '' ? (
                                          <img src={chatbot.chatWidgetIcon} alt="Chatbot Icon" className="w-8 h-8 rounded-full object-cover" />
                                        ) : chatbot.name ? (
                                          <span className="font-bold text-blue-700 text-lg">{chatbot.name.charAt(0).toUpperCase()}</span>
                                        ) : (
                                          <Bot className="h-5 w-5 text-blue-600" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-slate-900">{chatbot.name}</p>
                                        <p className="text-xs text-blue-300">ID: {chatbot.id.slice(0, 8)}...</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${chatbot.isActive ? 'bg-blue-50 text-blue-700' : 'bg-blue-100 text-blue-400'} shadow-sm`}>
                                      {chatbot.isActive ? 'Active' : 'Paused'}
                                    </span>
                                  </td>
                                  <td className="p-4 text-slate-900 font-medium">{chatbot.conversations ?? 0}</td>
                                  <td className="p-4 text-slate-900 font-medium">{chatbot.leads ?? 0}</td>
                                  <td className="p-4 text-slate-600">{formatTimeAgo(chatbot.updatedAt)}</td>
                                  <td className="p-4">
                                    <div className="flex items-center space-x-2">
                                      <Button variant="ghost" size="sm" onClick={() => handleEditChatbot(chatbot)} aria-label="Edit chatbot" title="Edit">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => handlePreviewChatbot(chatbot)} aria-label="Preview chatbot" title="Preview">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => { setChatbotToDelete({ id: chatbot.id, name: chatbot.name }); setShowDeleteDialog(true); }} aria-label="Delete chatbot" title="Delete" className="text-red-600 hover:text-red-700">
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Toggle for Leads List */}
              <div 
                className={`flex items-center gap-3 mt-4 cursor-pointer select-none p-3 rounded-lg transition-all duration-300 hover:shadow-md ${
                  showLeads 
                    ? 'bg-blue-50 border border-blue-200 shadow-md' 
                    : 'bg-white border border-gray-200 hover:border-blue-300 shadow-md'
                }`} 
                onClick={() => setShowLeads(v => !v)}
              >
                <div className={`p-2 rounded-lg transition-colors duration-300 ${
                  showLeads ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Users className="h-5 w-5" />
                </div>
                <span className={`font-bold text-lg transition-colors duration-300 ${
                  showLeads ? 'text-blue-600' : 'text-gray-700'
                }`}>Recent Leads</span>
                <div className={`ml-auto p-1 rounded-full transition-all duration-300 ${
                  showLeads ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {showLeads ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
              <div className={`transition-all duration-700 ease-in-out overflow-hidden ${showLeads ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}> 
                {showLeads && (
                  <Card className="shadow-md rounded-lg border border-gray-200 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Users className="h-5 w-5 text-blue-600" /> Recent Leads
                      </CardTitle>
                      <Button
                        onClick={exportLeads}
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        aria-label="Export leads as CSV"
                      >
                        <Download className="h-4 w-4 mr-2" /> Export
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                              <th className="text-left p-4 font-medium text-gray-600">Contact</th>
                              <th className="text-left p-4 font-medium text-gray-600">Phone</th>
                              <th className="text-left p-4 font-medium text-gray-600">Email</th>
                              <th className="text-left p-4 font-medium text-gray-600">Consent</th>
                              <th className="text-left p-4 font-medium text-gray-600">Chatbot</th>
                              <th className="text-left p-4 font-medium text-gray-600">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leadsLoading ? (
                              <tr><td colSpan={6} className="p-8 text-center text-blue-500 animate-pulse">Loading...</td></tr>
                            ) : !leads || leads.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-8 text-center">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <Users className="h-10 w-10 text-gray-300 mb-2" />
                                    <span className="text-lg font-semibold text-gray-400">No leads found.</span>
                                    <span className="text-sm text-gray-400">Your leads will appear here as soon as you collect some!</span>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10).map((lead) => (
                                <tr key={lead.id} className="border-b border-blue-50 hover:bg-blue-50/60 transition-colors group">
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 via-blue-50 to-white flex items-center justify-center shadow-md">
                                        {lead.name ? (
                                          <span className="font-bold text-blue-700 text-lg">{lead.name.charAt(0).toUpperCase()}</span>
                                        ) : (
                                          <Users className="h-5 w-5 text-blue-600" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-slate-900">{lead.name || 'Unknown'}</p>
                                        <p className="text-xs text-blue-300">ID: {lead.id}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">{lead.phone || <span className="text-slate-400 text-sm">No phone</span>}</td>
                                  <td className="p-4">{lead.email || <span className="text-slate-400 text-sm">No email</span>}</td>
                                  <td className="p-4">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${lead.consentGiven ? 'bg-blue-50 text-blue-700' : 'bg-blue-100 text-blue-400'} shadow-sm`}>
                                      {lead.consentGiven ? 'Yes' : 'No'}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 shadow-sm">
                                      {chatbots?.find(c => c.id === lead.chatbotId)?.name || 'Unknown'}
                                    </span>
                                  </td>
                                  <td className="p-4 text-blue-400">{formatTimeAgo(lead.createdAt)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            {/* Right Column - Live Preview */}
            <div className="space-y-6">
              {/* Live Chatbot Preview */}
              <Card className="shadow-md rounded-lg border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Bot className="h-5 w-5 text-blue-600" />
                        Live Preview
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Test your chatbot in real-time</p>
                    </div>
                    {activeChatbot && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePreviewChatbot(activeChatbot)}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Try Live
                      </Button>
                    )}
                  </div>
                  {/* Active Chatbot Info */}
                  {activeChatbot && (
                    <div className="flex items-center gap-3 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shadow-md">
                        {typeof activeChatbot.chatWidgetIcon === 'string' && activeChatbot.chatWidgetIcon.trim() !== '' ? (
                          <img src={activeChatbot.chatWidgetIcon} alt="Chatbot Icon" className="w-8 h-8 rounded-full object-cover" />
                        ) : activeChatbot.name ? (
                          <span className="font-bold text-blue-600 text-lg">{activeChatbot.name.charAt(0).toUpperCase()}</span>
                        ) : (
                          <Bot className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{activeChatbot.name || 'Unnamed Chatbot'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${activeChatbot.isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}> 
                            {activeChatbot.isActive ? 'Active' : 'Paused'}
                          </span>
                          <span className="text-xs text-gray-500">ID: {activeChatbot.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                      {/* Preview Header */}
                      {/* Preview Content */}
                      <div className="p-2 min-h-[300px] max-h-[400px] overflow-y-auto">
                        {activeChatbot ? (
                          <ChatPreview chatbot={activeChatbot} />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center py-8">
                            <Bot className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium mb-2">No Active Chatbot</p>
                            <p className="text-gray-400 text-sm">Select a chatbot from the header to see a live preview</p>
                          </div>
                        )}
                      </div>
                      {/* Preview Input */}
                      <div className="border-t border-gray-200 p-3 bg-gray-50">
                        <div className="flex items-center gap-2">
                         
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
