import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface FollowUpButton {
  text: string;
  payload: string | { type: string; link: string };
}
interface CtaButton {
  text: string;
  link: string;
}
interface BotResponse {
  message_text: string;
  follow_up_buttons?: FollowUpButton[];
  cta_button?: CtaButton;
  action_collect_contact_info?: boolean;
  requested_contact_field?: string;
}
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  followUpButtons?: FollowUpButton[];
  ctaButton?: CtaButton;
}

function isValidEmail(text: string) {
  return /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(text);
}


export default function ChatTest() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingContactInfo, setAwaitingContactInfo] = useState<null | { field: string }>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const userId = 'test-user-123';

  // Initialize chat with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      // Fetch the bot's hello message from the backend
      (async () => {
        try {
          const response = await fetch(`${apiUrl}/api/intent-detect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'hello' }),
          });
          const data = await response.json();
          const bot: BotResponse = data.intent;
          setMessages([
            {
              id: 'welcome',
              content: bot.message_text,
              sender: 'bot',
              timestamp: new Date(),
              followUpButtons: bot.follow_up_buttons,
              ctaButton: bot.cta_button,
            }
          ]);
          // If bot is now asking for contact info, set awaitingContactInfo
          if (bot.action_collect_contact_info && bot.requested_contact_field) {
            setAwaitingContactInfo({ field: bot.requested_contact_field });
          } else {
            setAwaitingContactInfo(null);
          }
        } catch {
          setMessages([
            {
              id: 'welcome',
              content: 'Hello! How can I help you today?',
              sender: 'bot',
              timestamp: new Date(),
            }
          ]);
        }
      })();
    }
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (msg?: string) => {
    const userInput = typeof msg === 'string' ? msg : input;
    if (!userInput.trim() || isLoading) return;
    setInput('');
    setMessages(prev => [
      ...prev,
      {
        id: `${Date.now()}-user`,
        content: userInput,
        sender: 'user',
        timestamp: new Date(),
      }
    ]);

    // Phase 1: Contact Info Collection (frontend logic)
    if (awaitingContactInfo) {
      if (awaitingContactInfo.field === 'email' && isValidEmail(userInput)) {
        setAwaitingContactInfo(null);
        setMessages(prev => [
          ...prev,
          {
            id: `${Date.now()}-bot`,
            content: "Thank you! We've received your email. You can ask another question or use the contact options below.",
            sender: 'bot',
            timestamp: new Date(),
          }
        ]);
        return;
      }
      // For all other cases (including cancellation), send to backend for intent detection
      setIsLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/intent-detect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userInput }),
        });
        const data = await response.json();
        const bot: BotResponse = data.intent;
        setMessages(prev => [
          ...prev,
          {
            id: `${Date.now()}-bot`,
            content: bot.message_text,
            sender: 'bot',
            timestamp: new Date(),
            followUpButtons: bot.follow_up_buttons,
            ctaButton: bot.cta_button,
          }
        ]);
        if (bot.action_collect_contact_info && bot.requested_contact_field) {
          setAwaitingContactInfo({ field: bot.requested_contact_field });
        } else {
          setAwaitingContactInfo(null);
        }
      } catch (e) {
        setMessages(prev => [
          ...prev,
          {
            id: `${Date.now()}-bot`,
            content: 'Sorry, I could not connect to the server.',
            sender: 'bot',
            timestamp: new Date(),
          }
        ]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      // Prepare last 4 messages as history for context
      const history = messages.slice(-4).map(m => ({
        role: m.sender === 'user' ? 'user' : 'bot',
        content: m.content
      }));
      const response = await fetch(`${apiUrl}/api/intent-detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput, history }),
      });
      const data = await response.json();
      const bot: BotResponse = data.intent;
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-bot`,
          content: bot.message_text,
          sender: 'bot',
          timestamp: new Date(),
          followUpButtons: bot.follow_up_buttons,
          ctaButton: bot.cta_button,
        }
      ]);
      // If bot is now asking for contact info, set awaitingContactInfo
      if (bot.action_collect_contact_info && bot.requested_contact_field) {
        setAwaitingContactInfo({ field: bot.requested_contact_field });
      } else {
        setAwaitingContactInfo(null);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-bot`,
          content: 'Sorry, I could not connect to the server.',
          sender: 'bot',
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUp = (btn: FollowUpButton) => {
    if (typeof btn.payload === 'string') {
      handleSendMessage(btn.text);
    } else if (btn.payload && typeof btn.payload === 'object' && btn.payload.type === 'cta_option' && btn.payload.link) {
      window.open(btn.payload.link, '_blank');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white relative">
      {/* Chat Header */}
      <div
        className="sticky top-0 z-20 backdrop-blur-md bg-white/80 border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-lg"
        style={{ background: `linear-gradient(90deg, #6366F111 0%, #fff 100%)` }}
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 shadow-md">
            <AvatarFallback className="bg-white/30 text-slate-700">
              <Bot className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-bold text-lg text-slate-900">Test Chatbot</h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 bg-gradient-to-br from-blue-50/60 via-slate-50 to-blue-100 px-2 md:px-0">
        <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
          {messages.map((message, idx) => (
            <div
              key={message.id}
              className={cn(
                "flex items-end group",
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.sender === 'bot' && (
                <Avatar className="h-8 w-8 mr-2 shadow-sm">
                  <AvatarFallback style={{ backgroundColor: '#6366F1' }} className="text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "relative max-w-[80vw] md:max-w-[60%] px-5 py-3 text-base transition-all duration-300",
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-400 text-white rounded-2xl rounded-br-sm shadow-lg animate-fadeInRight'
                    : 'bg-white text-slate-900 rounded-2xl rounded-bl-sm shadow-md animate-fadeInLeft'
                )}
                style={{ backgroundColor: message.sender === 'user' ? '#6366F1' : undefined }}
              >
                <div className="whitespace-pre-wrap">
                  {message.content.split('\n').map((line, index) => (
                    <div key={index}>{line}{index < message.content.split('\n').length - 1 && <br />}</div>
                  ))}
                </div>
                {/* Follow-up buttons */}
                {message.followUpButtons && message.followUpButtons.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2">
                    {message.followUpButtons.map((btn, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="w-full text-left"
                        onClick={() => handleFollowUp(btn)}
                      >
                        {btn.text}
                      </Button>
                    ))}
                  </div>
                )}
                {/* CTA button */}
                {message.ctaButton && (
                  <div className="mt-4">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => window.open(message.ctaButton!.link, '_blank')}
                    >
                      {message.ctaButton.text}
                    </Button>
                  </div>
                )}
                <div className="text-xs text-slate-400 mt-2 text-right opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {message.timestamp instanceof Date ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
              {message.sender === 'user' && (
                <div className="ml-2 h-8 w-8" />
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start items-end space-x-2 animate-fadeInLeft">
              <Avatar className="h-8 w-8 mr-2 shadow-sm">
                <AvatarFallback style={{ backgroundColor: '#6366F1' }} className="text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-md border">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="sticky bottom-0 z-10 px-4 pb-4 pt-2 bg-gradient-to-t from-white/90 to-white/60  shadow-2xl">
        <div className="flex gap-2 items-center max-w-2xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={awaitingContactInfo ? `Please provide your ${awaitingContactInfo.field}...` : 'Type your message...'}
            className="flex-1 rounded-full px-5 py-3 text-base shadow-md bg-white border focus:ring-2 focus:ring-blue-400"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            size="lg"
            className="rounded-full px-5 py-3 shadow-lg transition-all hover:scale-105"
            style={{ backgroundColor: '#c3c4ef' }}
          >
            <Send className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
