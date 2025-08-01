import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, ExternalLink, User, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

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
  lead?: boolean; // Flag to indicate if lead form should be shown
}
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  followUpButtons?: FollowUpButton[];
  ctaButton?: CtaButton;
  lead?: boolean; // Flag to indicate if lead form should be shown
}

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

interface LeadField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
}

function isValidEmail(text: string) {
  return /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(text);
}

// Format bot message for bold, newlines, bullets
function formatBotMessage(content: string) {
  // Bold
  let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Newlines
  formatted = formatted.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
  // Bullets
  formatted = formatted.replace(/^- (.*)$/gm, '<li>$1</li>');
  if (/<li>/.test(formatted)) {
    formatted = '<ul style="margin: 0 0 0 1em; padding: 0; list-style: disc inside;">' + formatted.replace(/(<br>)*(<li>)/g, '$2') + '</ul>';
  }
  return formatted;
}

function getChatbotIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('chatbotId') || 'test-chatbot-id';
}

export default function ChatTest() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingContactInfo, setAwaitingContactInfo] = useState<null | { field: string }>(null);
  const [ctaLoading, setCtaLoading] = useState<string | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormData, setLeadFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [leadFields, setLeadFields] = useState<LeadField[]>([]);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const chatbotId = getChatbotIdFromUrl();

  // Initialize chat with welcome message
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${apiUrl}/api/intent-detect/${chatbotId}`, {
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
            lead: bot.lead,
          }
        ]);
        if (bot.action_collect_contact_info && bot.requested_contact_field) {
          setAwaitingContactInfo({ field: bot.requested_contact_field });
        } else {
          setAwaitingContactInfo(null);
        }
        
        // Fetch chatbot lead fields configuration
        try {
          const chatbotResponse = await fetch(`${apiUrl}/api/chatbots/${chatbotId}`);
          if (chatbotResponse.ok) {
            const chatbotData = await chatbotResponse.json();
            if (chatbotData.leadCollectionFields && Array.isArray(chatbotData.leadCollectionFields)) {
              // Convert array of field names to field objects
              const fieldObjects = chatbotData.leadCollectionFields.map((fieldName: string) => {
                switch (fieldName) {
                  case 'name':
                    return { id: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Your name' };
                  case 'email':
                    return { id: 'email', label: 'Email Address', type: 'email', required: false, placeholder: 'your@email.com' };
                  case 'phone':
                    return { id: 'phone', label: 'Phone Number', type: 'tel', required: false, placeholder: 'Your phone number' };
                  default:
                    return { id: fieldName, label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1), type: 'text', required: false, placeholder: `Your ${fieldName}` };
                }
              });
              setLeadFields(fieldObjects);
            } else {
              // Default fields if none configured
              setLeadFields([
                { id: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Your name' },
                { id: 'phone', label: 'Phone Number', type: 'tel', required: false, placeholder: 'Your phone number' }
              ]);
            }
          } else {
            // Default fields if response not ok
            setLeadFields([
              { id: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Your name' },
              { id: 'phone', label: 'Phone Number', type: 'tel', required: false, placeholder: 'Your phone number' }
            ]);
          }
        } catch (error) {
          console.log('Could not fetch chatbot lead fields, using defaults');
          // Default fields if fetch fails
          setLeadFields([
            { id: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Your name' },
            { id: 'phone', label: 'Phone Number', type: 'tel', required: false, placeholder: 'Your phone number' }
          ]);
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
  }, [apiUrl, chatbotId]);

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
        const response = await fetch(`${apiUrl}/api/intent-detect/${chatbotId}`, {
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
            lead: bot.lead,
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
      const response = await fetch(`${apiUrl}/api/intent-detect/${chatbotId}`, {
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
          lead: bot.lead,
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
      if (btn.text && btn.text.trim()) {
        handleSendMessage(btn.text);
      }
    } else if (btn.payload && typeof btn.payload === 'object' && btn.payload.type === 'cta_option' && btn.payload.link) {
      window.open(btn.payload.link, '_blank');
    }
  };

  const handleLeadFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLead(true);
    
    // Validate required fields - ensure leadFields is an array
    if (!Array.isArray(leadFields)) {
      console.error('leadFields is not an array:', leadFields);
      setIsSubmittingLead(false);
      return;
    }
    
    const requiredFields = leadFields.filter(field => field && field.required);
    const missingFields = requiredFields.filter(field => field && !leadFormData[field.id as keyof LeadFormData]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in the required fields: ${missingFields.map(f => f.label).join(', ')}`);
      setIsSubmittingLead(false);
      return;
    }
    
    try {
      // Submit lead to the API
      const response = await fetch(`${apiUrl}/api/chat/${chatbotId}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatbotId,
          name: leadFormData.name,
          email: leadFormData.email,
          phone: leadFormData.phone,
          company: leadFormData.company,
          message: leadFormData.message,
          consentGiven: true,
          source: 'chat-test',
          conversationContext: {
            messages: messages.slice(-5), // Include last 5 messages for context
            variables: {
              page: window.location.href,
              referrer: document.referrer,
              userAgent: navigator.userAgent
            }
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      await response.json();

      // Add success message
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-bot`,
          content: "Thank you! We've received your information and will get back to you soon. Is there anything else I can help you with?",
          sender: 'bot',
          timestamp: new Date(),
        }
      ]);
      
      setShowLeadForm(false);
      setLeadFormData({ name: '', email: '', phone: '', company: '', message: '' });
      
    } catch (error) {
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-bot`,
          content: "I apologize, but there was an error submitting your information. Please try again or contact us directly.",
          sender: 'bot',
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsSubmittingLead(false);
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
      <ScrollArea className="flex-1 bg-gradient-to-br from-blue-50/60 via-slate-50 to-blue-100 px-2 md:px-0 scrollbar-none">
        <div className="pt-8 pb-4 md:pt-12 md:pb-8 px-4 md:px-8 space-y-6 max-w-4xl mx-auto">

          {messages.map((message) => (
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
                  {message.sender === 'bot'
                    ? <span dangerouslySetInnerHTML={{ __html: formatBotMessage(message.content) }} />
                    : message.content.split('\n').map((line, index) => (
                        <div key={index}>{line}{index < message.content.split('\n').length - 1 && <br />}</div>
                      ))}
                </div>
                
                {/* Follow-up buttons */}
                {message.followUpButtons && message.followUpButtons.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {message.followUpButtons.map((btn, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200 rounded-xl px-4 py-2.5 text-sm font-medium"
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
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                      onClick={async () => {
                        setCtaLoading(message.id);
                        setTimeout(() => {
                          window.open(message.ctaButton!.link, '_blank');
                          setCtaLoading(null);
                        }, 600);
                      }}
                      disabled={ctaLoading === message.id}
                    >
                      {ctaLoading === message.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {message.ctaButton.text}
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                {/* Lead form trigger */}
                {message.lead && !showLeadForm && (
                  <div className="mt-4">
                    <Card className="border-blue-200 bg-blue-50/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 text-sm">Get in Touch</h4>
                            <p className="text-blue-700 text-xs">Share your details for personalized assistance</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setShowLeadForm(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg"
                          >
                            Fill Form
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                <div className="text-xs text-blue-200 mt-2 text-right font-medium">
                  {message.timestamp instanceof Date ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            </div>
          ))}
          
          {/* Lead Form */}
          {showLeadForm && (
            <div className="flex justify-start items-start space-x-2 animate-fadeInLeft">
              <Avatar className="h-8 w-8 mr-2 shadow-sm">
                <AvatarFallback style={{ backgroundColor: '#6366F1' }} className="text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="max-w-md bg-white border-blue-200 shadow-lg">
                <CardContent className="p-0">
                  <div className="p-4 border-b border-blue-100 bg-blue-50/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <h4 className="font-semibold text-blue-900">Contact Information</h4>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowLeadForm(false)}
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                      >
                        <X className="h-3 w-3 text-blue-600" />
                      </Button>
                    </div>
                  </div>
                  
                                     <form onSubmit={handleLeadFormSubmit} className="p-4 space-y-3">
                     {Array.isArray(leadFields) && leadFields.map((field) => (
                       <div key={field.id}>
                         <label className="text-xs font-medium text-slate-700 mb-1 block">
                           {field.label}
                           {field.required && <span className="text-red-500 ml-1">*</span>}
                         </label>
                         {field.type === 'textarea' ? (
                           <textarea
                             value={leadFormData[field.id as keyof LeadFormData] || ''}
                             onChange={(e) => setLeadFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                             placeholder={field.placeholder}
                             className="w-full text-sm h-16 p-2 border border-slate-300 rounded-md resize-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                             required={field.required}
                           />
                         ) : (
                           <Input
                             type={field.type}
                             value={leadFormData[field.id as keyof LeadFormData] || ''}
                             onChange={(e) => setLeadFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                             placeholder={field.placeholder}
                             className="text-sm h-8"
                             required={field.required}
                           />
                         )}
                       </div>
                     ))}
                    
                    <Button
                      type="submit"
                      disabled={isSubmittingLead}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-all duration-200"
                    >
                      {isSubmittingLead ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Submit Information
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-start items-end space-x-2 animate-fadeInLeft">
              <Avatar className="h-8 w-8 mr-2 shadow-sm">
                <AvatarFallback style={{ backgroundColor: '#6366F1' }} className="text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="sticky bottom-0 z-10 px-4 pb-4 pt-2 bg-gradient-to-t from-white/90 to-white/60 shadow-2xl">
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
            style={{ backgroundColor: '#1116d5' }}
          >
            <Send className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
