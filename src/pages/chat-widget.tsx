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

export default function ChatWidget() {
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
  const { data: chatbot } = useQuery<Chatbot>({
    queryKey: ['/api/chatbots', chatbotId],
    enabled: !!chatbotId,
  });

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
      // Start question flow if present
      if (chatbot.questionFlow && Array.isArray(chatbot.questionFlow)) {
        const startNode = chatbot.questionFlow.find((n: any) => n.id === 'start');
        if (startNode) {
          setQuestionFlowActive(true);
          processQuestionNode(startNode);
        }
      }
    }
  }, [chatbot, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function processQuestionNode(node: any) {
    setContext(prev => ({ ...prev, currentNodeId: node.id }));
    switch (node.type) {
      case 'statement':
        addBotMessage(node.question);
        if (node.nextId && chatbot?.questionFlow) {
          const nextNode = chatbot.questionFlow.find((n: any) => n.id === node.nextId);
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
    }
  }
  function addBotMessage(content: string, type: 'text' | 'options' | 'form' = 'text', options?: any[]) {
    const messageId = Date.now().toString();
    console.log(`[${messageId}] 📝 Adding bot message to UI:`, {
      contentLength: content.length,
      type,
      hasOptions: !!options,
      optionsCount: options?.length || 0,
      timestamp: new Date().toISOString()
    });
    
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
    const message: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  }
  const handleOptionClick = (option: any) => {
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
    } else if (option.nextId && chatbot?.questionFlow) {
      const nextNode = chatbot.questionFlow.find((n: any) => n.id === option.nextId);
      if (nextNode) setTimeout(() => processQuestionNode(nextNode), 500);
    }
  };
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !chatbotId || !chatbot) return;

    const requestId = Date.now().toString();
    console.log(`[${requestId}] 🚀 Chat widget - Sending message:`, {
      messageLength: input.length,
      chatbotId,
      questionFlowActive,
      timestamp: new Date().toISOString()
    });

    const userInput = input;
    setInput('');
    addUserMessage(userInput);

    if (questionFlowActive && context.currentNodeId) {
      console.log(`[${requestId}] 🔄 Processing question flow:`, {
        currentNodeId: context.currentNodeId,
        awaitingInput: context.awaitingInput
      });
      
      const currentNode = chatbot.questionFlow?.find((n: any) => n.id === context.currentNodeId);
      if (currentNode) {
        setIsLoading(true);
        try {
          console.log(`[${requestId}] 📡 Making API call for question flow`);
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
        const nextNode = chatbot.questionFlow?.find((n: any) => n.id === currentNode.nextId);
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
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Chat Header */}
      <div 
        className="p-4 text-white flex items-center justify-between"
        style={{ backgroundColor: chatbot.primaryColor || '#6366F1' }}
      >
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
          onClick={handleClose}
          className="text-white/80 hover:text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  message.sender === 'user'
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-900'
                )}
                style={{
                  backgroundColor: message.sender === 'user' ? (chatbot.primaryColor || '#6366F1') : undefined
                }}
              >
                {message.type === 'options' ? (
                  <div className="space-y-2">
                    <p>{message.content}</p>
                    <div className="space-y-1">
                      {message.options?.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(option)}
                          className="block w-full text-left px-2 py-1 text-xs bg-white text-gray-700 rounded border hover:bg-gray-50"
                        >
                          {option.text}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : message.type === 'form' ? (
                  <div className="space-y-3">
                    <p>{message.content}</p>
                    <div className="space-y-2">
                      <Input
                        placeholder="Your name"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                        className="text-xs"
                      />
                      <Input
                        placeholder="Email address"
                        type="email"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        className="text-xs"
                      />
                      <Input
                        placeholder="Phone number"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        className="text-xs"
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="consent"
                          checked={leadForm.consent}
                          onCheckedChange={(checked) => setLeadForm({ ...leadForm, consent: checked as boolean })}
                        />
                        <Label htmlFor="consent" className="text-xs">
                          I agree to be contacted
                        </Label>
                      </div>
                      <Button
                        onClick={handleLeadSubmit}
                        disabled={!leadForm.name || !leadForm.email || !leadForm.consent}
                        className="w-full text-xs"
                        size="sm"
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
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Suggested Questions */}
      {messages.length === 1 && chatbot.suggestionButtons && (
        <div className="px-4 py-2 border-t bg-gray-50">
          <div className="text-xs text-gray-600 mb-2">Quick questions:</div>
          <div className="flex flex-wrap gap-2">
            {JSON.parse(chatbot.suggestionButtons || '[]').map((suggestion: string, index: number) => (
              <button
                key={index}
                onClick={() => {
                  setInput(suggestion);
                  setTimeout(() => handleSendMessage(), 100);
                }}
                className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={chatbot.inputPlaceholder || "Type your message..."}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="sm"
            style={{ backgroundColor: chatbot.primaryColor || '#6366F1' }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Powered By */}
      {chatbot.poweredByText && (
        <div className="px-4 py-2 text-center border-t">
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
  );
}