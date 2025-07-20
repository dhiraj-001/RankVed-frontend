import { useState, useEffect, useRef } from 'react';
import { useParams } from 'wouter';
import { Send, Bot, X, Loader2,  Mail, Phone, User } from 'lucide-react';
import {  useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useChatbot } from '@/hooks/use-chatbots';

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
  const [questionFlowActive, setQuestionFlowActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Fetch chatbot data

  const { data: chatbot } = useChatbot(chatbotId || "");

  // Chat response mutation
  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; chatbotId: string; context: ConversationContext }) => {
      const response = await fetch(`${apiUrl}/api/chat/${data.chatbotId}/message`, {
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
      const response = await fetch(`${apiUrl}/api/leads`, {
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
      // Support both array and object with nodes
      const flowNodes = Array.isArray(chatbot?.questionFlow)
        ? chatbot?.questionFlow
        : chatbot?.questionFlow?.nodes;
      if (flowNodes && Array.isArray(flowNodes)) {
        const startNode = flowNodes.find((n: any) => n.id === 'start');
        if (startNode) {
          setQuestionFlowActive(true);
          processQuestionNode(startNode);
        } else {
          console.warn('[ChatStandalone] No start node found in question flow.');
        }
      } else {
        console.warn('[ChatStandalone] flowNodes is not an array.');
      }
    }
  }, [chatbot, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function processQuestionNode(node: any) {
    if (!chatbot) return;
    const flowNodes = Array.isArray(chatbot?.questionFlow)
      ? chatbot?.questionFlow
      : chatbot?.questionFlow?.nodes;
    if (!flowNodes || !Array.isArray(flowNodes)) {
      console.error('[ChatStandalone] processQuestionNode: flowNodes is not an array.', flowNodes);
      return;
    }
    setContext(prev => ({ ...prev, currentNodeId: node.id }));
    switch (node.type) {
      case 'statement':
        addBotMessage(node.question);
        if (node.nextId) {
          const nextNode = flowNodes.find((n: any) => n.id === node.nextId);
          if (nextNode) setTimeout(() => processQuestionNode(nextNode), 1200);
        }
        break;
      case 'multiple-choice':
        const options = node.options?.map((opt: any) => ({
          text: opt.text,
          value: opt.text,
          action: opt.action,
          nextId: opt.nextId
        })) || [];
        addBotMessage(node.question, 'options', options);
        setContext(prev => ({ ...prev, awaitingInput: 'choice' }));
        break;
      case 'contact-form':
        addBotMessage(node.question, 'form');
        setContext(prev => ({ ...prev, awaitingInput: 'form', showingLeadForm: true }));
        break;
      case 'open-ended':
        addBotMessage(node.question);
        setContext(prev => ({ ...prev, awaitingInput: 'text' }));
        break;
      default:
        console.warn('[ChatStandalone] Unknown node type:', node.type, node);
    }
  }

  function addBotMessage(content: string, type: 'text' | 'options' | 'form' = 'text', options?: any[]) {
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const message: Message = {
      id: messageId,
      content,
      sender: 'bot',
      timestamp: new Date(),
      type,
      options
    };
    setMessages(prev => [...prev, message]);
  }
  function addUserMessage(content: string) {
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message: Message = {
      id: messageId,
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  }

  function handleOptionClick(option: any) {
    if (!chatbot) return;
    const flowNodes = Array.isArray(chatbot?.questionFlow)
      ? chatbot?.questionFlow
      : chatbot?.questionFlow?.nodes;
    if (!flowNodes || !Array.isArray(flowNodes)) {
      console.error('[ChatStandalone] handleOptionClick: flowNodes is not an array.', flowNodes);
      return;
    }
    addUserMessage(option.text);
    setContext(prev => ({
      ...prev,
      variables: { ...prev.variables, [context.currentNodeId || 'selection']: option.text },
      awaitingInput: undefined
    }));
    if (option.action === 'collect-lead') {
      setContext(prev => ({ ...prev, showingLeadForm: true, awaitingInput: 'form' }));
      addBotMessage('Please provide your contact information so we can help you better.', 'form');
    } else if (option.action === 'end-chat') {
      addBotMessage('Thank you for chatting with us! Have a great day!');
      setQuestionFlowActive(false);
    } else if (option.nextId) {
      const nextNode = flowNodes.find((n: any) => n.id === option.nextId);
      if (nextNode) processQuestionNode(nextNode);
    }
  };

  const handleLeadSubmit = async () => {
    if (!leadForm.name || !leadForm.email || !leadForm.consent || !chatbotId) return;

    try {
      await leadMutation.mutateAsync({
        chatbotId,
        userId: chatbot?.userId, // <-- Add userId from chatbot config
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

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !chatbotId || !chatbot) return;

    const requestId = Date.now().toString();
    console.log(`[${requestId}] 🚀 Chat standalone - Sending message:`, {
      messageLength: input.length,
      chatbotId,
      questionFlowActive,
      timestamp: new Date().toISOString()
    });

    const userInput = input;
    setInput('');
    addUserMessage(userInput);

    const flowNodes = Array.isArray(chatbot?.questionFlow)
      ? chatbot?.questionFlow
      : chatbot?.questionFlow?.nodes;

    if (questionFlowActive && context.currentNodeId) {
      console.log(`[${requestId}] 🔄 Processing question flow:`, {
        currentNodeId: context.currentNodeId,
        awaitingInput: context.awaitingInput
      });
      
      const currentNode = flowNodes?.find((n: any) => n.id === context.currentNodeId);
      console.log(`[${requestId}] 🟦 Current node:`, currentNode);
      if (currentNode) {
        console.log(`[${requestId}] 🟧 Node type: ${currentNode.type}, aiHandling: ${currentNode.aiHandling}`);
        setIsLoading(true);
        try {
          if (currentNode.type === 'open-ended' && currentNode.aiHandling) {
            console.log(`[${requestId}] 🤖 Sending custom message to AI backend`);
          }
          const response = await chatMutation.mutateAsync({ message: userInput, chatbotId: chatbotId, context });
          
          console.log(`[${requestId}] ✅ Question flow API response:`, {
            responseLength: response.message?.length || 0,
            responseType: response.type,
            hasContext: !!response.context
          });
          
          addBotMessage(response.message || 'I\'m here to help! How can I assist you?');
          if (response.context) setContext(response.context);
        } catch (error) {
          console.error(`[${requestId}] ❌ Question flow API error:`, error);
          addBotMessage('Sorry, I\'m having trouble responding right now. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
      if (currentNode?.nextId) {
        const nextNode = flowNodes?.find((n: any) => n.id === currentNode.nextId);
        console.log(`[${requestId}] ⏭️ Next node:`, nextNode);
        if (nextNode) setTimeout(() => processQuestionNode(nextNode), 1000);
      }
    } else {
      // Fallback to classic AI chat
      console.log(`[${requestId}] 🤖 Using classic AI chat (no question flow)`);
      setIsLoading(true);
      try {
        console.log(`[${requestId}] 📡 Making API call for classic AI chat`);
        const response = await chatMutation.mutateAsync({ message: userInput, chatbotId: chatbotId, context });
        
        console.log(`[${requestId}] ✅ Classic AI API response:`, {
          responseLength: response.message?.length || 0,
          responseType: response.type,
          hasContext: !!response.context
        });
        
        addBotMessage(response.message || 'I\'m here to help! How can I assist you?');
        if (response.context) setContext(response.context);
      } catch (error) {
        console.error(`[${requestId}] ❌ Classic AI API error:`, error);
        addBotMessage('Sorry, I\'m having trouble responding right now. Please try again.');
      } finally {
        setIsLoading(false);
      }
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white relative">
      {/* Chat Header */}
      <div
        className="sticky top-0 z-20 backdrop-blur-md bg-white/80 border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-lg"
        style={{ background: `linear-gradient(90deg, ${chatbot.primaryColor || '#6366F1'}11 0%, #fff 100%)` }}
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 shadow-md">
            <AvatarImage src={chatbot.chatWidgetIcon || undefined} />
            <AvatarFallback className="bg-white/30 text-slate-700">
              <Bot className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-bold text-lg text-slate-900">{chatbot.chatWidgetName || chatbot.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500">Online</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 bg-gradient-to-br from-blue-50/60 via-slate-50 to-blue-100 px-2 md:px-0">
        <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
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
                  <AvatarImage src={chatbot.chatWindowAvatar || undefined} />
                  <AvatarFallback style={{ backgroundColor: chatbot.primaryColor || '#6366F1' }} className="text-white">
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
                style={{ backgroundColor: message.sender === 'user' ? (chatbot.primaryColor || '#6366F1') : undefined }}
              >
                {/* Speech bubble tail */}
               
                {message.type === 'options' ? (
                  <div className="space-y-3">
                    <p className="mb-2">{message.content}</p>
                    <div className="space-y-2">
                      {message.options?.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(option)}
                          className="block w-full text-left px-4 py-2 text-base bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors shadow-sm"
                        >
                          {option.text}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : message.type === 'form' ? (
                  <div className="space-y-3">
                    <p className="mb-3">{message.content}</p>
                    <div className="space-y-3 bg-slate-50 rounded-xl p-4 shadow-inner">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Your name"
                          value={leadForm.name}
                          onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                          className="pl-10 text-base"
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Email address"
                          type="email"
                          value={leadForm.email}
                          onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                          className="pl-10 text-base"
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Phone number (optional)"
                          value={leadForm.phone}
                          onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                          className="pl-10 text-base"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="consent"
                          checked={leadForm.consent}
                          onCheckedChange={(checked) => setLeadForm({ ...leadForm, consent: checked as boolean })}
                        />
                        <Label htmlFor="consent" className="text-xs text-slate-600">
                          I agree to be contacted
                        </Label>
                      </div>
                      <Button
                        onClick={handleLeadSubmit}
                        disabled={!leadForm.name || !leadForm.email || !leadForm.consent || leadMutation.isPending}
                        className="w-full text-base flex items-center justify-center rounded-xl shadow-md"
                        size="lg"
                        style={{ backgroundColor: chatbot.primaryColor || '#6366F1' }}
                      >
                        {leadMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Submit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">
                    {message.content.split('\n').map((line, index) => (
                      <div key={index}>{line}{index < message.content.split('\n').length - 1 && <br />}</div>
                    ))}
                  </div>
                )}
                {/* Timestamp */}
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
                <AvatarImage src={chatbot.chatWindowAvatar || undefined} />
                <AvatarFallback style={{ backgroundColor: chatbot.primaryColor || '#6366F1' }} className="text-white">
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
            placeholder={chatbot.inputPlaceholder || 'Type your message...'}
            className="flex-1 rounded-full px-5 py-3 text-base shadow-md bg-white border focus:ring-2 focus:ring-blue-400"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="lg"
            className="rounded-full px-5 py-3 shadow-lg transition-all hover:scale-105"
            style={{ backgroundColor: chatbot.primaryColor || '#c3c4ef' }}
          >
            <Send className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Powered By */}
      {chatbot.poweredByText && (
        <div className="w-full border-t mt-0 pt-2 pb-3 bg-white/80 text-center text-xs text-slate-400">
          <a
            href={chatbot.poweredByLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors"
          >
            {chatbot.poweredByText}
          </a>
        </div>
      )}
    </div>
  );
}