import { useState, useEffect } from 'react';
import { Plus, Bot, Edit, Eye, Trash2, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useChatbots, useUpdateChatbot } from '@/hooks/use-chatbots';
import { formatDateTime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatbotActions } from '@/hooks/use-chatbot-actions';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Menu } from '@headlessui/react';

export default function Chatbots() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editChatbot, setEditChatbot] = useState<any | null>(null);
  const [chatbotToDelete, setChatbotToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newChatbot, setNewChatbot] = useState({
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
    leadCollectionFields: ['name', 'phone'],
    chatWindowStyle: 'modern',
    chatWindowTheme: 'light',
    borderRadius: 16,
    shadowStyle: 'soft'
  });
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');

  const { data: chatbots, isLoading, refetch } = useChatbots();
  const updateChatbot = useUpdateChatbot();
  const { handleCreateChatbot, handleDeleteChatbot, createChatbot } = useChatbotActions({ setShowCreateDialog, setNewChatbot });
  const { toast } = useToast();

  // const [activeTogglingId, setActiveTogglingId] = useState<string | null>(null);

  // Edit functionality
  const handleEdit = (chatbot: any) => {
    setEditChatbot(chatbot);
    setShowEditDialog(true);
  };
  const handleEditSave = async () => {
    if (!editChatbot?.id) return;
    // Actually update the chatbot via API
    const { id, ...data } = editChatbot;
    await updateChatbot.mutateAsync({ id, data });
    setShowEditDialog(false);
    refetch();
    toast({ title: 'Chatbot updated', description: 'Your changes have been saved.', variant: 'default' });
  };

  // Preview functionality
  const handlePreview = (chatbot: any) => {
    window.open(`/chat-test?chatbotId=${chatbot.id}`, '_blank');
  };

  // Delete functionality
  const handleDelete = (chatbot: any) => {
    setChatbotToDelete(chatbot);
    setShowDeleteDialog(true);
  };
  const handleDeleteConfirm = async () => {
    if (chatbotToDelete) {
      setIsDeleting(true);
      await handleDeleteChatbot(chatbotToDelete.id);
      setIsDeleting(false);
      setShowDeleteDialog(false);
      refetch();
      toast({ title: 'Chatbot deleted', description: 'The chatbot has been removed.', variant: 'default' });
    }
  };

  // Set active functionality
  // const handleToggleActive = async (chatbot: any) => {
  //   setActiveTogglingId(chatbot.id);
  //   await updateChatbot.mutateAsync({
  //     id: chatbot.id,
  //     data: { isActive: !chatbot.isActive },
  //   });
  //   setActiveTogglingId(null);
  //   refetch();
  // };

  // After create, refetch
  useEffect(() => {
    if (!showCreateDialog) refetch();
  }, [showCreateDialog, refetch]);

  // Filtered chatbots
  const filteredChatbots = chatbots?.filter((cb: any) => {
    if (filter === 'all') return true;
    if (filter === 'active') return cb.isActive;
    if (filter === 'paused') return !cb.isActive;
    return true;
  }) || [];


  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-white min-h-screen">
            {/* Header */}
      <header className="hidden sm:block backdrop-blur-md bg-gradient-to-br from-blue-50 via-white to-white border-b border-blue-50 px-4 sm:px-6 py-2 sm:py-4 sticky top-0 z-20 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto gap-2 sm:gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl text-slate-900 font-bold">Chatbots</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="rounded-lg px-5 py-2 shadow-sm font-semibold text-base border-blue-200 text-blue-700 hover:bg-blue-50 border">
                <Plus className="h-4 w-4 mr-2" />
                Create Chatbot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[430px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-0 overflow-hidden">
              <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <DialogTitle className="text-2xl font-bold text-slate-900">Create New Chatbot</DialogTitle>
                <p className="text-slate-500 text-sm mt-1">Set up your chatbot's basic details and welcome message.</p>
              </DialogHeader>
              <div className="space-y-6 px-6 py-6">
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
                <div className="border-t border-slate-100 pt-6 flex items-center space-x-3 mt-2">
                  <Switch
                    checked={newChatbot.isActive}
                    onCheckedChange={checked => setNewChatbot(prev => ({ ...prev, isActive: checked }))}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                    aria-label={newChatbot.isActive ? 'Deactivate chatbot' : 'Activate chatbot'}
                  />
                  <span className={`ml-2 font-medium transition-colors duration-300 flex items-center select-none ${newChatbot.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {newChatbot.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} aria-label="Cancel chatbot creation" className="rounded-lg px-5 py-2">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleCreateChatbot(newChatbot)}
                    disabled={!newChatbot.name || createChatbot.isPending}
                    aria-label="Create new chatbot"
                    className="rounded-lg px-5 py-2 shadow-sm font-semibold"
                  >
                    {createChatbot.isPending ? (
                      <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'Create Chatbot'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Chatbots</h2>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 border-blue-200 border">
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search chatbots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          {/* Filter Button */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out">
              <Filter className="h-5 w-5 mr-2 text-blue-600" />
              <span className="font-medium text-slate-700">{filter === 'all' ? 'All' : filter === 'active' ? 'Active' : 'Paused'}</span>
              <svg className="ml-2 h-4 w-4 text-slate-400 transition-transform duration-300 ease-in-out" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white border border-slate-200 divide-y divide-slate-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in duration-500 ease-in-out">
              <Menu.Item>
                {({ active }: { active: boolean }) => (
                  <button
                    className={`w-full text-left px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out ${filter === 'all' ? 'bg-blue-100 text-blue-700' : active ? 'bg-slate-100' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }: { active: boolean }) => (
                  <button
                    className={`w-full text-left px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out ${filter === 'active' ? 'bg-green-100 text-green-700' : active ? 'bg-slate-100' : ''}`}
                    onClick={() => setFilter('active')}
                  >
                    Active
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }: { active: boolean }) => (
                  <button
                    className={`w-full text-left px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out ${filter === 'paused' ? 'bg-gray-200 text-gray-700' : active ? 'bg-slate-100' : ''}`}
                    onClick={() => setFilter('paused')}
                  >
                    Paused
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>

        {/* Chatbots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="rounded-2xl shadow-md bg-white border border-slate-100">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredChatbots.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <Bot className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No chatbots found</h3>
              <p className="text-slate-500 text-center max-w-sm">
                {searchTerm ? 'No chatbots match your search.' : 'Get started by creating your first chatbot.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateDialog(true)} className="mt-4 rounded-lg px-5 py-2 shadow-sm font-semibold text-base">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Chatbot
                </Button>
              )}
            </div>
          ) : (
            filteredChatbots.map((chatbot) => (
              <Card
                key={chatbot.id}
                className="rounded-2xl shadow-md border border-slate-100 bg-white hover:shadow-xl transition-shadow duration-200 group flex flex-col h-full"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: `${(chatbot as any).primaryColor || '#6366F1'}20` }}
                      >
                        {typeof chatbot.chatWidgetIcon === 'string' && chatbot.chatWidgetIcon.trim() !== '' ? (
                          <img src={chatbot.chatWidgetIcon} alt="Chatbot Icon" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <Bot
                            className="h-6 w-6"
                            style={{ color: (chatbot as any).primaryColor || '#6366F1' }}
                          />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{chatbot.name}</CardTitle>
                        <p className="text-xs text-slate-400 mt-0.5" title={chatbot.id}>
                          ID: {chatbot.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <Badge variant={chatbot.isActive ? "default" : "secondary"} className="rounded px-2 py-0.5 text-xs">
                      {chatbot.isActive ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                      {chatbot.welcomeMessage || 'No welcome message set'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Created: {formatDateTime(chatbot.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-4">
                    {/* Toggle Active Button */}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={chatbot.isActive}
                        onCheckedChange={async checked => {
                          // Optimistically update UI
                          const prev = chatbot.isActive;
                          chatbot.isActive = checked;
                          // Show toast immediately
                          toast({
                            title: checked ? 'Chatbot activated' : 'Chatbot paused',
                            description: checked ? 'This chatbot is now active.' : 'This chatbot is now paused.',
                            variant: 'default',
                          });
                          try {
                            await updateChatbot.mutateAsync({ id: chatbot.id, data: { isActive: checked } });
                          } catch (err) {
                            // Revert UI if failed
                            chatbot.isActive = prev;
                            toast({
                              title: 'Error',
                              description: 'Failed to update chatbot status. Please try again.',
                              variant: 'destructive',
                            });
                          }
                        }}
                        className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                        aria-label={chatbot.isActive ? 'Deactivate chatbot' : 'Activate chatbot'}
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(chatbot)} aria-label="Edit chatbot" className="rounded-md px-3 py-1.5 text-xs font-medium">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePreview(chatbot)} aria-label="Preview chatbot" className="rounded-md px-3 py-1.5 text-xs font-medium">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(chatbot)}
                      className="text-red-600 hover:text-red-700 rounded-md px-3 py-1.5 text-xs font-medium"
                      aria-label="Delete chatbot"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      {/* Edit Chatbot Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[430px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-0 overflow-hidden">
          <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <DialogTitle className="text-2xl font-bold text-slate-900">Edit Chatbot</DialogTitle>
            <p className="text-slate-500 text-sm mt-1">Update your chatbot's details.</p>
          </DialogHeader>
          <div className="space-y-2 px-6 py-6">
            {/* Pre-fill fields with editChatbot data, similar to create dialog */}
            {/* For brevity, not duplicating all fields here. In production, use a shared form component. */}
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="font-semibold">Chatbot Name</Label>
              <Input
                id="edit-name"
                value={editChatbot?.name || ''}
                onChange={(e) => setEditChatbot((prev: any) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Customer Support Bot"
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all rounded-lg border-slate-300 hover:border-blue-400"
              />
            </div>
            <div className="border-t border-slate-100 pt-6 space-y-2">
              <Label htmlFor="edit-prompt" className="font-semibold">AI System Prompt</Label>
              <Textarea
                id="edit-prompt"
                value={editChatbot?.aiSystemPrompt || ''}
                onChange={(e) => setEditChatbot((prev: any) => ({ ...prev, aiSystemPrompt: e.target.value }))}
                placeholder="You are a helpful customer service assistant..."
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all rounded-lg border-slate-300 hover:border-blue-400 min-h-[80px]"
              />
            </div>
            <div className="border-t border-slate-100 pt-6 space-y-2">
              <Label htmlFor="edit-welcome" className="font-semibold">Welcome Message</Label>
              <Input
                id="edit-welcome"
                value={editChatbot?.welcomeMessage || ''}
                onChange={(e) => setEditChatbot((prev: any) => ({ ...prev, welcomeMessage: e.target.value }))}
                placeholder="Hello! How can I help you today?"
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all rounded-lg border-slate-300 hover:border-blue-400"
              />
            </div>
            <div className="border-t border-slate-100 pt-6 flex items-center space-x-2 mt-2">
              
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Switch
                checked={editChatbot?.isActive}
                onCheckedChange={checked => setEditChatbot((prev: any) => ({ ...prev, isActive: checked }))}
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                aria-label={editChatbot?.isActive ? 'Deactivate chatbot' : 'Activate chatbot'}
              />
              <span className={`ml-2 font-medium transition-colors duration-300 flex items-center select-none ${editChatbot?.isActive ? 'text-green-600' : 'text-gray-500'}`}>{editChatbot?.isActive ? 'Active' : 'Paused'}</span>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} aria-label="Cancel edit" className="rounded-lg px-5 py-2">
                Cancel
              </Button>
              <Button
                onClick={handleEditSave}
                aria-label="Save chatbot edits"
                className="rounded-lg px-5 py-2 shadow-sm font-semibold"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[430px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-0 overflow-hidden">
          <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <DialogTitle className="text-2xl font-bold text-slate-900">Delete Chatbot</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-6">
            Are you sure you want to delete <b>{chatbotToDelete?.name}</b>? This action cannot be undone.
            <div className="flex justify-end space-x-2 pt-6">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} aria-label="Cancel delete" className="rounded-lg px-5 py-2">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                aria-label="Confirm delete chatbot"
                className="rounded-lg px-5 py-2 shadow-sm font-semibold"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <svg className="animate-spin h-4 w-4 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
