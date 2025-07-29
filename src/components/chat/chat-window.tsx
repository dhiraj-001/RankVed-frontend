import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useChatResponse } from '@/hooks/use-chatbots';
import { useCreateLead } from '@/hooks/use-leads';
import type { Chatbot } from '@/types';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  followUpButtons?: Array<{ text: string; payload: string | object }>;
  ctaButton?: { text: string; link: string };
  shouldShowLead?: boolean;
  intentId?: string;
}

interface ChatWindowProps {
  chatbot: Chatbot;
  onClose: () => void;
  className?: string;
}

export function ChatWindow({ chatbot, onClose, className }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState({ name: '', phone: '', email: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chatResponse = useChatResponse();
  const createLead = useCreateLead();

  // Initialize with welcome message
  useEffect(() => {
    if (chatbot.welcomeMessage) {
      const timer = setTimeout(() => {
        setMessages([{
          id: '1',
          content: chatbot.welcomeMessage || 'Hello! How can I help you today?',
          sender: 'bot',
          timestamp: new Date(),
        }]);
      }, chatbot.initialMessageDelay || 1000);
      
      return () => clearTimeout(timer);
    }
  }, [chatbot]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const requestId = Date.now().toString();
    console.log(`[${requestId}] 🚀 Chat window - Sending message:`, {
      messageLength: input.length,
      chatbotId: chatbot.id,
      timestamp: new Date().toISOString()
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      console.log(`[${requestId}] 📡 Making API call to chat response`);
      const response = await chatResponse.mutateAsync({
        chatbotId: chatbot.id,
        message: input,
      });

      console.log(`[${requestId}] ✅ API response received:`, {
        responseLength: response.response?.length || 0,
        responseType: response.type,
        shouldShowLead: response.shouldShowLead,
        hasFollowUpButtons: response.followUpButtons?.length > 0,
        hasCtaButton: !!response.ctaButton,
        intentId: response.intentId
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'bot',
        timestamp: new Date(),
        // Add new fields for structured response
        followUpButtons: response.followUpButtons,
        ctaButton: response.ctaButton,
        shouldShowLead: response.shouldShowLead,
        intentId: response.intentId
      };

      console.log(`[${requestId}] 📝 Adding bot message to UI:`, {
        messageId: botMessage.id,
        contentLength: botMessage.content.length,
        timestamp: botMessage.timestamp.toISOString()
      });

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(`[${requestId}] ❌ Chat response error:`, error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleLeadSubmit = async () => {
    try {
      await createLead.mutateAsync({
        chatbotId: chatbot.id,
        userId: String(chatbot.userId),
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        source: 'chat-widget',
        consentGiven: true,
        conversationContext: { messages },
      });

      setShowLeadForm(false);
      setLeadData({ name: '', phone: '', email: '' });
      
      const confirmMessage: Message = {
        id: Date.now().toString(),
        content: 'Thank you for your information! Someone will be in touch with you soon.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, confirmMessage]);
    } catch (error) {
      console.error('Failed to create lead:', error);
    }
  };

  return (
    <div
      className={cn(
        'fixed bg-white rounded-lg shadow-2xl border border-slate-200 flex flex-col chat-widget-enter',
        className
      )}
      style={{
        width: '320px',
        height: '480px',
        bottom: `${(chatbot.verticalOffset || 20) + 70}px`,
        right: `${chatbot.horizontalOffset || 20}px`,
        zIndex: 999,
      }}
    >
      {/* Chat Header */}
      <div 
        className="p-4 rounded-t-lg text-white"
        style={{ backgroundColor: chatbot.primaryColor || '#6366F1' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={chatbot.chatWindowAvatar || undefined} />
              <AvatarFallback className="bg-white/20">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-sm">{chatbot.title || chatbot.name}</h4>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs opacity-90">Online</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-slate-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex space-x-2',
                message.sender === 'user' && 'justify-end'
              )}
            >
              {message.sender === 'bot' && (
                <Avatar className="h-6 w-6 mt-1">
                  <AvatarImage src={chatbot.chatWindowAvatar || undefined} />
                  <AvatarFallback style={{ backgroundColor: chatbot.primaryColor }}>
                    <Bot className="h-3 w-3 text-white" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={cn(
                  'max-w-[80%] p-3 rounded-lg text-sm',
                  message.sender === 'user'
                    ? 'text-white'
                    : 'bg-white shadow-sm text-slate-900'
                )}
                style={message.sender === 'user' ? { backgroundColor: chatbot.primaryColor } : {}}
              >
                <div>{message.content}</div>
                
                {/* Follow-up buttons for bot messages */}
                {message.sender === 'bot' && message.followUpButtons && message.followUpButtons.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.followUpButtons.map((button, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start text-xs"
                        onClick={() => {
                          if (typeof button.payload === 'string') {
                            setInput(button.text);
                          } else if (button.payload && typeof button.payload === 'object' && 'link' in button.payload) {
                            const link = (button.payload as any).link;
                            if (typeof link === 'string') {
                              window.open(link, '_blank');
                            }
                          }
                        }}
                      >
                        {button.text}
                      </Button>
                    ))}
                  </div>
                )}
                
                {/* CTA button for bot messages */}
                {message.sender === 'bot' && message.ctaButton && (
                  <div className="mt-3">
                    <Button
                      onClick={() => window.open(message.ctaButton!.link, '_blank')}
                      size="sm"
                      className="w-full text-sm"
                      style={{ backgroundColor: chatbot.primaryColor }}
                    >
                      {message.ctaButton.text}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Quick Reply Buttons */}
          {messages.length === 1 && chatbot.suggestionButtons && (
            <div className="space-y-2">
              {JSON.parse(chatbot.suggestionButtons).map((suggestion: string, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start text-xs"
                  onClick={() => setInput(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}

          {/* Lead Form */}
          {showLeadForm && (
            <div className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
              <h4 className="font-medium text-sm">Contact Information</h4>
              <div className="space-y-2">
                <Input
                  placeholder="Your name"
                  value={leadData.name}
                  onChange={(e) => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-sm"
                />
                <Input
                  placeholder="Phone number"
                  value={leadData.phone}
                  onChange={(e) => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
                  className="text-sm"
                />
                <Input
                  placeholder="Email address"
                  value={leadData.email}
                  onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                  className="text-sm"
                />
                <Button
                  onClick={handleLeadSubmit}
                  disabled={!leadData.name || createLead.isPending}
                  className="w-full text-sm"
                  style={{ backgroundColor: chatbot.primaryColor }}
                >
                  {createLead.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : null}
                  {chatbot.leadButtonText || 'Submit'}
                </Button>
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {chatResponse.isPending && (
            <div className="flex space-x-2">
              <Avatar className="h-6 w-6 mt-1">
                <AvatarImage src={chatbot.chatWindowAvatar || undefined} />
                <AvatarFallback style={{ backgroundColor: chatbot.primaryColor }}>
                  <Bot className="h-3 w-3 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex space-x-1 typing-indicator">
                  <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={chatbot.inputPlaceholder || 'Type your message...'}
            className="flex-1 text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={chatResponse.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || chatResponse.isPending}
            size="sm"
            style={{ backgroundColor: chatbot.primaryColor }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Powered By Link */}
        {chatbot.poweredByText && (
          <div className="mt-2 text-center">
            <a
              href={chatbot.poweredByLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              {chatbot.poweredByText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
