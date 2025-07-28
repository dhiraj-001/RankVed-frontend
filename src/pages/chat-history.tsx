import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/app-context';
import { useChatbots } from '@/hooks/use-chatbots';
import { 
  useChatSessions, 
  useChatMessages, 
  useDeleteChatSession, 
  useDeleteAllChatSessions,
  type ChatSessionSummary,
  type ChatMessage 
} from '@/hooks/use-chat-sessions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Search, 
  Filter, 
  Calendar,
  MessageSquare,
  User,
  Bot,
  Clock,
  Mail,
  Loader2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface ChatSessionsFilters {
  chatbotId?: string;
  startDate?: Date;
  endDate?: Date;
  leadCollected?: boolean;
  searchTerm?: string;
}

export default function ChatHistory() {
  const { activeChatbot } = useApp();
  const { toast } = useToast();
  const { data: chatbots = [] } = useChatbots();
  
  // State for filters
  const [filters, setFilters] = useState<ChatSessionsFilters>({
    chatbotId: activeChatbot?.id,
    searchTerm: '',
  });
  
  // State for expanded sessions
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  
  // State for date inputs
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');

  // Queries
  const { 
    data: sessions = [], 
    isLoading: sessionsLoading, 
    error: sessionsError,
    refetch: refetchSessions 
  } = useChatSessions(filters.chatbotId, filters);

  const deleteSessionMutation = useDeleteChatSession();
  const deleteAllSessionsMutation = useDeleteAllChatSessions();

  // Update filters when activeChatbot changes
  useEffect(() => {
    if (activeChatbot?.id) {
      setFilters(prev => ({ ...prev, chatbotId: activeChatbot.id }));
    }
  }, [activeChatbot?.id]);

  // Handle date changes
  useEffect(() => {
    const newFilters = { ...filters };
    
    if (startDateInput) {
      newFilters.startDate = new Date(startDateInput);
    } else {
      delete newFilters.startDate;
    }
    
    if (endDateInput) {
      newFilters.endDate = new Date(endDateInput);
    } else {
      delete newFilters.endDate;
    }
    
    setFilters(newFilters);
  }, [startDateInput, endDateInput]);

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSessionMutation.mutateAsync({ 
        sessionId, 
        chatbotId: filters.chatbotId! 
      });
      toast({
        title: "Session deleted",
        description: "Chat session has been deleted successfully.",
      });
      // Remove from expanded sessions if it was expanded
      setExpandedSessions(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat session.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAllSessions = async () => {
    if (!filters.chatbotId) return;
    
    try {
      await deleteAllSessionsMutation.mutateAsync(filters.chatbotId);
      toast({
        title: "All sessions deleted",
        description: "All chat sessions have been deleted successfully.",
      });
      setExpandedSessions(new Set());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete all chat sessions.",
        variant: "destructive",
      });
    }
  };

  const toggleSessionExpansion = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!activeChatbot && chatbots.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white min-h-screen p-4">
        <div className="text-center max-w-md">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Chatbots Available</h2>
          <p className="text-gray-600 text-sm sm:text-base">Create a chatbot to start viewing chat sessions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      {/* Header */}
      <header className="hidden sm:block backdrop-blur-md bg-gradient-to-br from-blue-50 via-white to-white border-b border-blue-50 px-4 sm:px-6 py-2 sm:py-4 sticky top-0 z-20 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto gap-2 sm:gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Chat Sessions</h2>
            <p className="text-slate-600 text-sm mt-1">View and manage conversation history</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              onClick={() => refetchSessions()}
              disabled={sessionsLoading}
              variant="outline"
              size="sm"
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${sessionsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {sessions.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Chat Sessions</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all chat sessions 
                      for the selected chatbot, including all messages and conversation history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAllSessions}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Chat Sessions</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => refetchSessions()}
              disabled={sessionsLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 ${sessionsLoading ? 'animate-spin' : ''}`} />
            </Button>
            {sessions.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Sessions</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all chat sessions for this chatbot.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAllSessions}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Filters */}
        <Card className="bg-white shadow-md border-0 rounded-lg">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Chatbot Selector */}
              <div className="space-y-2">
                <Label htmlFor="chatbot-select" className="text-sm font-medium text-gray-700">Chatbot</Label>
                <Select
                  value={filters.chatbotId || ''}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, chatbotId: value || undefined }))}
                >
                  <SelectTrigger className="border-gray-200 focus:ring-blue-200 focus:border-blue-200">
                    <SelectValue placeholder="Select chatbot" />
                  </SelectTrigger>
                  <SelectContent>
                    {chatbots.map((chatbot) => (
                      <SelectItem key={chatbot.id} value={chatbot.id}>
                        {chatbot.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700">Search Messages</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search in messages..."
                    value={filters.searchTerm || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10 border-gray-200 focus:ring-blue-200 focus:border-blue-200"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm font-medium text-gray-700">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="start-date"
                    type="date"
                    value={startDateInput}
                    onChange={(e) => setStartDateInput(e.target.value)}
                    className="pl-10 border-gray-200 focus:ring-blue-200 focus:border-blue-200"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-sm font-medium text-gray-700">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="end-date"
                    type="date"
                    value={endDateInput}
                    onChange={(e) => setEndDateInput(e.target.value)}
                    className="pl-10 border-gray-200 focus:ring-blue-200 focus:border-blue-200"
                  />
                </div>
              </div>
            </div>

            {/* Lead Collection Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-2">
              <Label className="text-sm font-medium text-gray-700">Lead Collection:</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.leadCollected === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, leadCollected: undefined }))}
                  className={filters.leadCollected === undefined ? "bg-blue-200 hover:bg-blue-200" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
                >
                  All
                </Button>
                <Button
                  variant={filters.leadCollected === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, leadCollected: true }))}
                  className={filters.leadCollected === true ? "bg-blue-200 hover:bg-blue-200" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
                >
                  With Leads
                </Button>
                <Button
                  variant={filters.leadCollected === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, leadCollected: false }))}
                  className={filters.leadCollected === false ? "bg-blue-200 hover:bg-blue-200" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
                >
                  Without Leads
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Card className="bg-white shadow-md border-0 rounded-lg">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
              Chat Sessions ({sessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-3 text-gray-600">Loading chat sessions...</span>
              </div>
            ) : sessionsError ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">Failed to load chat sessions</p>
                <Button 
                  variant="outline" 
                  onClick={() => refetchSessions()}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No chat sessions found</h3>
                <p className="text-gray-600">
                  {filters.chatbotId 
                    ? "No conversations have been recorded for this chatbot yet."
                    : "Select a chatbot to view its chat sessions."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {sessions.map((session: ChatSessionSummary) => (
                  <SessionCard
                    key={session.sessionId}
                    session={session}
                    isExpanded={expandedSessions.has(session.sessionId)}
                    onToggleExpansion={() => toggleSessionExpansion(session.sessionId)}
                    onDelete={() => handleDeleteSession(session.sessionId)}
                    formatDuration={formatDuration}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface SessionCardProps {
  session: ChatSessionSummary;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onDelete: () => void;
  formatDuration: (minutes: number) => string;
  formatDate: (date: Date) => string;
}

function SessionCard({ 
  session, 
  isExpanded, 
  onToggleExpansion, 
  onDelete, 
  formatDuration, 
  formatDate 
}: SessionCardProps) {
  const { data: messages = [], isLoading: messagesLoading } = useChatMessages(
    isExpanded ? session.sessionId : ''
  );

  return (
    <Card className="border border-gray-200 hover:border-gray-300 transition-colors bg-white">
      <CardContent className="p-3 sm:p-4">
        {/* Session Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <span className="font-medium text-gray-900 text-sm sm:text-base">
                Session {session.sessionId.slice(-8)}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">{formatDate(session.firstMessage)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                {session.messageCount} messages
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                {formatDuration(session.duration)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session.leadCollected && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                <Mail className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Lead Collected</span>
                <span className="sm:hidden">Lead</span>
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpansion}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Chat Session</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this chat session 
                    and all its messages.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Lead Information */}
        {(session.userName || session.userEmail) && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
              {session.userName && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900 truncate">{session.userName}</span>
                </div>
              )}
              {session.userEmail && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900 truncate">{session.userEmail}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        {isExpanded && (
          <div className="mt-4 space-y-3">
            {messagesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading messages...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto border-t border-gray-100 pt-4">
                {messages.map((message: ChatMessage) => (
                  <MessageBubble key={message.id} message={message} formatDate={formatDate} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  formatDate: (date: Date) => string;
}

function MessageBubble({ message, formatDate }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md rounded-lg px-3 sm:px-4 py-2 shadow-sm ${
        isUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        <div className={`text-xs mb-1 ${
          isUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {isUser ? <User className="h-3 w-3 inline mr-1" /> : <Bot className="h-3 w-3 inline mr-1" />}
          {isUser ? 'User' : 'Bot'} • {formatDate(new Date(message.createdAt))}
        </div>
        <div className="whitespace-pre-wrap break-words text-sm">{message.content}</div>
      </div>
    </div>
  );
} 