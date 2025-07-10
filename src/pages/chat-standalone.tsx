import { useState, useEffect, useRef } from 'react';
import { useParams } from 'wouter';
import { Send, Bot, X, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Chatbot } from '@/types';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'options' | 'form';
  options?: { text: string; value: string; action?: string; nextId?: string }[];
}

interface ConversationContext {
  currentNodeId?: string;
  variables: Record<string, any>;
  awaitingInput?: 'text' | 'choice' | 'form';
  showingLeadForm?: boolean;
}

export default function ChatStandalone() {
  const { chatbotId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState<ConversationContext>({
    variables: {},
    currentNodeId: 'start'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    consent: false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chatbot data
  const { data: chatbot } = useQuery<Chatbot>({
    queryKey: ['/api/chatbots', chatbotId],
    enabled: !!chatbotId,
  });

  // Chat response mutation
  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; chatbotId: string; context: ConversationContext }) => {
      const response = await fetch(`/api/chatbots/${data.chatbotId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: data.message,
          context: data.context
        }),
      });
      return response.json();
    },
  });

  // Lead submission mutation
  const leadMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  });

  // Initialize chat with welcome message
  useEffect(() => {
    if (chatbot && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: chatbot.welcomeMessage || 'Hello! How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [chatbot, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !chatbotId || !chatbot) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatMutation.mutateAsync({
        message: input.trim(),
        chatbotId,
        context
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message || 'I\'m here to help! How can I assist you?',
        sender: 'bot',
        timestamp: new Date(),
        type: response.type || 'text',
        options: response.options
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (response.context) {
        setContext(response.context);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I\'m having trouble responding right now. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (option: any) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: option.text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    if (option.action === 'collect-lead') {
      const leadMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Please provide your contact information so we can help you better.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'form'
      };
      setMessages(prev => [...prev, leadMessage]);
    }
  };

  const handleLeadSubmit = async () => {
    if (!leadForm.name || !leadForm.email || !leadForm.consent || !chatbotId) return;

    try {
      await leadMutation.mutateAsync({
        chatbotId,
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone,
        consentGiven: leadForm.consent,
        conversationContext: { messages, variables: context.variables }
      });

      const confirmMessage: Message = {
        id: Date.now().toString(),
        content: 'Thank you! We\'ve received your information and will get back to you soon.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, confirmMessage]);
      setLeadForm({ name: '', phone: '', email: '', consent: false });
    } catch (error) {
      console.error('Failed to submit lead:', error);
    }
  };

  const handleClose = () => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'CLOSE_CHAT' }, '*');
    }
  };

  if (!chatbot) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Chat Header */}
      <div 
        className="px-4 py-3 text-white flex items-center justify-between shadow-sm"
        style={{ backgroundColor: chatbot.primaryColor || '#6366F1' }}
      >
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={chatbot.chatWindowAvatar || undefined} />
            <AvatarFallback className="bg-white/20 text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-sm">{chatbot.title || chatbot.name}</h4>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs opacity-90">Online</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-white/80 hover:text-white hover:bg-white/20 p-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 bg-gray-50">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start space-x-2",
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.sender === 'bot' && (
                <Avatar className="h-6 w-6 mt-1">
                  <AvatarImage src={chatbot.chatWindowAvatar || undefined} />
                  <AvatarFallback style={{ backgroundColor: chatbot.primaryColor || '#6366F1' }} className="text-white">
                    <Bot className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                  message.sender === 'user'
                    ? 'text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm border'
                )}
                style={{
                  backgroundColor: message.sender === 'user' ? (chatbot.primaryColor || '#6366F1') : undefined
                }}
              >
                {message.type === 'options' ? (
                  <div className="space-y-3">
                    <p className="mb-2">{message.content}</p>
                    <div className="space-y-2">
                      {message.options?.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(option)}
                          className="block w-full text-left px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg border hover:bg-gray-100 transition-colors"
                        >
                          {option.text}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : message.type === 'form' ? (
                  <div className="space-y-3">
                    <p className="mb-3">{message.content}</p>
                    <div className="space-y-3">
                      <Input
                        placeholder="Your name"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Email address"
                        type="email"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Phone number (optional)"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        className="text-sm"
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="consent"
                          checked={leadForm.consent}
                          onCheckedChange={(checked) => setLeadForm({ ...leadForm, consent: checked as boolean })}
                        />
                        <Label htmlFor="consent" className="text-xs text-gray-600">
                          I agree to be contacted
                        </Label>
                      </div>
                      <Button
                        onClick={handleLeadSubmit}
                        disabled={!leadForm.name || !leadForm.email || !leadForm.consent}
                        className="w-full text-sm"
                        size="sm"
                        style={{ backgroundColor: chatbot.primaryColor || '#6366F1' }}
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">
                    {message.content.split('\n').map((line, index) => (
                      <div key={index}>
                        {line}
                        {index < message.content.split('\n').length - 1 && <br />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start items-start space-x-2">
              <Avatar className="h-6 w-6 mt-1">
                <AvatarImage src={chatbot.chatWindowAvatar || undefined} />
                <AvatarFallback style={{ backgroundColor: chatbot.primaryColor || '#6366F1' }} className="text-white">
                  <Bot className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm border">
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={chatbot.inputPlaceholder || "Type your message..."}
            className="flex-1 rounded-full"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="rounded-full px-4"
            style={{ backgroundColor: chatbot.primaryColor || '#6366F1' }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Powered By */}
      {chatbot.poweredByText && (
        <div className="px-4 py-2 text-center bg-white border-t">
          <a
            href={chatbot.poweredByLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {chatbot.poweredByText}
          </a>
        </div>
      )}
    </div>
  );
}