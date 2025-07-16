import { Bot, MessageCircle, Users, TrendingUp, Download, Plus, Trash, Edit, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    shadowStyle: 'soft'
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
    window.open(`/chat/${chatbot.id}`, '_blank');
  };

  // Reset edit mode when dialog closes
  useEffect(() => {
    if (!showCreateDialog) {
      setEditMode(false);
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
      color: 'emerald',
    },
    {
      title: 'Response Rate',
      value: stats && (stats.totalConversations ?? 0) > 0 ? `${Math.round(((stats.totalLeads ?? 0) / (stats.totalConversations ?? 1)) * 100)}%` : '0%',
      change: 'Real-time',
      trend: 'neutral',
      icon: TrendingUp,
      color: 'violet',
    },
    {
      title: 'Active Chatbots',
      value: stats?.activeChatbots || 0,
      change: 'No change',
      trend: 'neutral',
      icon: Bot,
      color: 'amber',
    },
  ];

  const cardBase = "rounded-2xl shadow-md border border-slate-100 bg-white hover:shadow-xl transition-shadow duration-200 group";
  const cardHover = "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:rounded-l-3xl before:bg-blue-500";

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
     
        <div className="flex-1 bg-gradient-to-br from-slate-50 to-white min-h-screen">
          {/* Chatbot Creation Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="sm:max-w-[430px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-0 overflow-hidden">
              <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-200">
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
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all rounded-lg border-slate-300 hover:border-blue-400"
                  />
                </div>
                <div className="border-t border-slate-100 pt-6 space-y-2">
                  <Label htmlFor="prompt" className="font-semibold">AI System Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={newChatbot.aiSystemPrompt}
                    onChange={(e) => setNewChatbot(prev => ({ ...prev, aiSystemPrompt: e.target.value }))}
                    placeholder="You are a helpful customer service assistant..."
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all rounded-lg border-slate-300 hover:border-blue-400 min-h-[80px]"
                  />
                </div>
                <div className="border-t border-slate-100 pt-6 space-y-2">
                  <Label htmlFor="welcome" className="font-semibold">Welcome Message</Label>
                  <Input
                    id="welcome"
                    value={newChatbot.welcomeMessage}
                    onChange={(e) => setNewChatbot(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                    placeholder="Hello! How can I help you today?"
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all rounded-lg border-slate-300 hover:border-blue-400"
                  />
                </div>
                <div className="border-t border-slate-100 pt-6 flex items-center space-x-2 mt-2">
                  <Switch
                    id="active"
                    checked={newChatbot.isActive}
                    onCheckedChange={(checked) => setNewChatbot(prev => ({ ...prev, isActive: checked }))}
                    className={`transition-colors duration-300 w-10 h-6 rounded-full relative focus:ring-2 focus:ring-green-500 focus:border-green-500
                      ${newChatbot.isActive ? 'bg-green-500 shadow-green-200 shadow' : 'bg-gray-300'}
                    `}
                  />
                  <Label
                    htmlFor="active"
                    className={`ml-2 font-medium transition-colors duration-300 flex items-center select-none
                      ${newChatbot.isActive ? 'text-green-600' : 'text-gray-500'}
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
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} aria-label="Cancel chatbot creation" className="rounded-lg px-5 py-2">
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
                          shadowStyle: 'soft'
                        });
                      } else {
                        await handleCreateChatbot(newChatbot);
                      }
                    }}
                    disabled={!newChatbot.name || (editMode ? updateChatbot.isPending : createChatbot.isPending)}
                    aria-label={editMode ? 'Save chatbot changes' : 'Create new chatbot'}
                    className="rounded-lg px-5 py-2 shadow-sm font-semibold"
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
            <DialogContent className="sm:max-w-[425px] transition-all duration-300">
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
          <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Dashboard</h2>
              <p className="text-sm sm:text-base text-slate-600 mt-1">Monitor your chatbots and analyze performance</p>
            </div>
            <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={exportDashboardStats}
                aria-label="Export dashboard stats as CSV"
              >
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            
              <Button
                size="sm"
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white border-none"
                onClick={() => setShowCreateDialog(true)}
                aria-label="Create new chatbot"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Create</span>
              </Button>
            </div>
          </header>

          {/* Dashboard Overview */}
          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-6">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsData.map((stat, i) => (
                <Card key={i} className="rounded-2xl shadow-md border border-slate-100 bg-white hover:shadow-xl transition-shadow duration-200 group">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
                    <div className={`rounded-full p-3 bg-${stat.color}-100 group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{stat.change}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="p-4 sm:p-4 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Analytics & Chatbots */}
              <div className="lg:col-span-2 space-y-6">
                {/* Conversation Analytics Chart */}
                {/* <Card className={`${cardBase} ${cardHover} before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:rounded-l-3xl before:bg-blue-500`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-slate-900">Conversation Analytics</CardTitle>
                      <select className="px-3 py-1 border border-slate-200 rounded-lg text-sm">
                        <option>Last 30 days</option>
                        <option>Last 7 days</option>
                        <option>Last 90 days</option>
                      </select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      // Demo chart 
                      <div className="flex-1 flex items-center justify-center min-w-[180px] overflow-x-auto p-2">
                        <svg width="180" height="80" viewBox="0 0 180 80" fill="none" className="max-w-full mx-auto">
                          <polyline points="0,60 30,50 60,55 90,35 120,45 150,20 180,30" stroke="#6366F1" strokeWidth="3" fill="none" />
                          <circle cx="180" cy="30" r="4" fill="#6366F1" />
                        </svg>
                      </div>
                      // Summary stats 
                      <div className="flex flex-col items-center md:items-end gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-slate-900">{stats?.totalConversations ?? 0}</span>
                          <span className="text-xs text-slate-500">Conversations</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm text-emerald-600 font-semibold">+12% this month</span>
                        </div>
                      </div>
                    </div>
                  </CardContent> 
                </Card> */}

                {/* Toggle for Chatbots List */}
                <div className="flex items-center gap-2 mt-4 cursor-pointer select-none" onClick={() => setShowChatbots(v => !v)}>
                  <span className="font-semibold text-slate-800 text-lg">Active Chatbots</span>
                  {showChatbots ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
                <div className={`transition-all duration-700 ease-in-out overflow-hidden ${showChatbots ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                  {showChatbots && (
                    <Card className={`${cardBase} ${cardHover} before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:rounded-l-3xl before:bg-purple-500`}>
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-900">Active Chatbots</CardTitle>
                        <p className="text-slate-600">Manage and monitor your deployed chatbots</p>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="text-left p-4 font-medium text-slate-600">Name</th>
                                <th className="text-left p-4 font-medium text-slate-600">Status</th>
                                <th className="text-left p-4 font-medium text-slate-600">Conversations</th>
                                <th className="text-left p-4 font-medium text-slate-600">Leads</th>
                                <th className="text-left p-4 font-medium text-slate-600">Last Active</th>
                                <th className="text-left p-4 font-medium text-slate-600">Actions</th>
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
                              ) : (
                                chatbots?.map((chatbot) => (
                                  <tr key={chatbot.id} className="border-b border-slate-100 hover:bg-blue-50 odd:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                          <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-slate-900">{chatbot.name}</p>
                                          <p className="text-sm text-slate-500">ID: {chatbot.id.slice(0, 8)}...</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <Badge variant={chatbot.isActive ? "default" : "secondary"}>
                                        {chatbot.isActive ? 'Active' : 'Paused'}
                                      </Badge>
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
                <div className="flex items-center gap-2 mt-4 cursor-pointer select-none" onClick={() => setShowLeads(v => !v)}>
                  <span className="font-semibold text-slate-800 text-lg">Recent Leads</span>
                  {showLeads ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
                <div className={`transition-all duration-700 ease-in-out overflow-hidden ${showLeads ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                  {showLeads && (
                    <Card className="shadow-lg rounded-2xl border-0">
                      <CardHeader className="top-[180px] z-10 bg-white/90 backdrop-blur-md rounded-t-2xl flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                          <Users className="h-5 w-5 text-blue-600" /> Recent Leads
                        </CardTitle>
                        <Button
                          onClick={exportLeads}
                          variant="outline"
                          size="sm"
                          className="ml-auto"
                          aria-label="Export leads as CSV"
                        >
                          <Download className="h-4 w-4 mr-2" /> Export
                        </Button>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-slate-200 bg-white/80 sticky top-0 z-10">
                                <th className="text-left p-4 font-medium text-slate-600">Contact</th>
                                <th className="text-left p-4 font-medium text-slate-600">Phone</th>
                                <th className="text-left p-4 font-medium text-slate-600">Email</th>
                                <th className="text-left p-4 font-medium text-slate-600">Consent</th>
                                <th className="text-left p-4 font-medium text-slate-600">Chatbot</th>
                                <th className="text-left p-4 font-medium text-slate-600">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {leadsLoading ? (
                                <tr><td colSpan={6} className="p-8 text-center">Loading...</td></tr>
                              ) : !leads || leads.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center">No leads found.</td></tr>
                              ) : (
                                [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10).map((lead) => (
                                  <tr key={lead.id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors">
                                    <td className="p-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                          <Users className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                          <p className="font-semibold text-slate-900">{lead.name}</p>
                                          <p className="text-xs text-slate-500">ID: {lead.id}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-4">{lead.phone || <span className="text-slate-400 text-sm">No phone</span>}</td>
                                    <td className="p-4">{lead.email || <span className="text-slate-400 text-sm">No email</span>}</td>
                                    <td className="p-4">
                                      <Badge variant={lead.consentGiven ? "default" : "secondary"} className={lead.consentGiven ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}>
                                        {lead.consentGiven ? 'Yes' : 'No'}
                                      </Badge>
                                    </td>
                                    <td className="p-4">{chatbots?.find(c => c.id === lead.chatbotId)?.name || 'Unknown'}</td>
                                    <td className="p-4">{formatTimeAgo(lead.createdAt)}</td>
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
              {/* Right Column - Live Preview and Recent Leads */}
              <div className="space-y-6">
                {/* Live Chatbot Preview */}
                <Card className={`${cardBase} ${cardHover} before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:rounded-l-3xl before:bg-blue-400`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-slate-900">Live Chatbot Preview</CardTitle>
                      {activeChatbot && (
                        <Button variant="outline" size="sm" onClick={() => window.open(`/chat/${activeChatbot.id}`, '_blank')}>
                          Try Live
                        </Button>
                      )}
                    </div>
                    {activeChatbot && (
                      <div className="flex items-center gap-3 mt-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{activeChatbot.name}</p>
                          <span className="text-xs text-green-600 font-medium">Active</span>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ChatPreview chatbot={activeChatbot || undefined} />
                    {/* Optionally, add a typing indicator or quick replies here */}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
     
    </>
  );
}
