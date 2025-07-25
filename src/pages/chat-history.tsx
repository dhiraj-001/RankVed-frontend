import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  id: string;
  sessionId: string;
  chatbotId: string;
  content: string;
  sender: string;
  createdAt: string;
}

interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
}

function groupMessagesBySession(messages: ChatMessage[]): ChatSession[] {
  const sessions: Record<string, ChatMessage[]> = {};
  for (const msg of messages) {
    if (!sessions[msg.sessionId]) sessions[msg.sessionId] = [];
    sessions[msg.sessionId].push(msg);
  }
  // Sort sessions by first message time ascending
  return Object.entries(sessions)
    .map(([sessionId, messages]) => ({
      sessionId,
      messages: messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    }))
    .sort((a, b) => new Date(a.messages[0].createdAt).getTime() - new Date(b.messages[0].createdAt).getTime());
}

export default function ChatHistory() {
  const { activeChatbot } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!activeChatbot) return;
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest('GET', `/api/chatbots/${activeChatbot.id}/history`);
        if (!res.ok) throw new Error('Failed to fetch chat history');
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : data.messages || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch chat history');
      }
      setLoading(false);
    };
    fetchHistory();
  }, [activeChatbot?.id]);

  if (!activeChatbot) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white min-h-screen">
        <div className="text-center">
          <span className="text-2xl font-bold text-slate-900 mb-2">No Active Chatbot</span>
        </div>
      </div>
    );
  }

  const sessions = groupMessagesBySession(messages);

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-white min-h-screen p-6">
      <Card className="max-w-4xl mx-auto shadow-xl rounded-2xl border-0 bg-white/90">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Chat Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-3 text-blue-600 font-medium">Loading chat history...</span>
            </div>
          ) : error ? (
            <div className="text-red-600 font-semibold text-center py-6">{error}</div>
          ) : sessions.length === 0 ? (
            <div className="text-slate-500 text-center py-6">No chat sessions found for this chatbot.</div>
          ) : (
            <div className="space-y-8 max-h-[70vh] overflow-y-auto">
              {sessions.map((session, idx) => (
                <div key={session.sessionId} className="border-b border-slate-200 pb-6 mb-6">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-semibold text-blue-700">Session {sessions.length - idx}</span>
                    <span className="text-xs text-slate-500">
                      Started: {new Date(session.messages[0].createdAt).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">Messages: {session.messages.length}</span>
                  </div>
                  <div className="space-y-2">
                    {session.messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`rounded-lg px-4 py-2 shadow-sm max-w-xl whitespace-pre-line ${
                            msg.sender === 'user'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="text-xs text-slate-400 mb-1">
                            {msg.sender === 'user' ? 'User' : 'Bot'} &middot;{' '}
                            {new Date(msg.createdAt).toLocaleString()}
                          </div>
                          <div>{msg.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 