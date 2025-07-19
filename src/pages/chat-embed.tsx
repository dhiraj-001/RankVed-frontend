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
import { apiRequest } from '@/lib/queryClient';
import type { Chatbot } from '@/types';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'options' | 'form';
  options?: { text: string; value: string; action?: string; nextId?: string }[];
}

interface QuestionNode {
  id: string;
  type: 'statement' | 'multiple-choice' | 'contact-form' | 'open-ended';
  question: string;
  options?: { text: string; nextId?: string; action?: 'continue' | 'collect-lead' | 'end-chat' }[];
  nextId?: string;
  collectVariable?: string;
  aiHandling?: boolean;
}

interface ConversationContext {
  currentNodeId?: string;
  variables: Record<string, any>;
  awaitingInput?: 'text' | 'choice' | 'form';
  showingLeadForm?: boolean;
}

export default function ChatEmbed() {
  const { chatbotId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState<ConversationContext>({
    variables: {},
    currentNodeId: 'start'
  });
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    consent: false
  });
  const [hasPlayedNotification, setHasPlayedNotification] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Fetch chatbot configuration
  const { data: chatbot, isLoading } = useQuery<Chatbot>({
    queryKey: ['/api/chatbots', chatbotId],
    enabled: !!chatbotId,
  });

  // Send message to AI
  const sendMessage = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await apiRequest('POST', `/api/chat/${chatbotId}/message`, { message });
      return response.json();
    },
  });

  // Submit lead
  const submitLead = useMutation({
    mutationFn: async (leadData: any) => {
      const response = await apiRequest('POST', '/api/leads', leadData);
      return response.json();
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    if (chatbot && messages.length === 0) {
      const timer = setTimeout(() => {
        addBotMessage(chatbot.welcomeMessage || 'Hello! How can I help you today?');
        
        // Start the question flow if it exists
        if (chatbot.questionFlow && Array.isArray(chatbot.questionFlow)) {
          const startNode = (chatbot.questionFlow as QuestionNode[]).find(node => node.id === 'start');
          if (startNode) {
            processQuestionNode(startNode);
          }
        }
      }, chatbot.initialMessageDelay || 1000);

      return () => clearTimeout(timer);
    }
  }, [chatbot, messages.length]);

  // Play notification sound when bubble appears
  useEffect(() => {
    if (chatbot && !hasPlayedNotification && chatbot.enableNotificationSound) {
      // In a real implementation, you'd play the notification sound here
      setHasPlayedNotification(true);
    }
  }, [chatbot, hasPlayedNotification]);

  const addBotMessage = (content: string, type: 'text' | 'options' | 'form' = 'text', options?: any[]) => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      sender: 'bot',
      timestamp: new Date(),
      type,
      options
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const processQuestionNode = (node: QuestionNode) => {
    setContext(prev => ({ ...prev, currentNodeId: node.id }));

    switch (node.type) {
      case 'statement':
        addBotMessage(node.question);
        // Move to next node if specified
        if (node.nextId && chatbot?.questionFlow) {
          const nextNode = (chatbot.questionFlow as QuestionNode[]).find(n => n.id === node.nextId);
          if (nextNode) {
            setTimeout(() => processQuestionNode(nextNode), 1500);
          }
        }
        break;

      case 'multiple-choice':
        const options = node.options?.map(opt => ({
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
  };

  const handleOptionClick = (option: any) => {
    addUserMessage(option.text);
    
    // Store the selection in context
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
    } else if (option.nextId && chatbot?.questionFlow) {
      const nextNode = (chatbot.questionFlow as QuestionNode[]).find(n => n.id === option.nextId);
      if (nextNode) {
        setTimeout(() => processQuestionNode(nextNode), 500);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userInput = input.trim();
    setInput('');
    addUserMessage(userInput);

    // Store input in context if we have a current node
    if (context.currentNodeId) {
      setContext(prev => ({
        ...prev,
        variables: { ...prev.variables, [context.currentNodeId!]: userInput },
        awaitingInput: undefined
      }));
    }

    // Check if current node has AI handling enabled
    const currentNode = chatbot?.questionFlow && Array.isArray(chatbot.questionFlow) 
      ? (chatbot.questionFlow as QuestionNode[]).find(n => n.id === context.currentNodeId)
      : null;

    if (currentNode?.aiHandling || context.awaitingInput === 'text') {
      try {
        const response = await sendMessage.mutateAsync({ message: userInput });
        addBotMessage(response.response);
      } catch (error) {
        addBotMessage('I apologize, but I encountered an error. Please try again or contact our support team.');
      }
    } else {
      // If no AI handling, provide a generic response
      addBotMessage('Thank you for your message. Is there anything else I can help you with?');
    }

    // Continue to next node if specified
    if (currentNode?.nextId && chatbot?.questionFlow) {
      const nextNode = (chatbot.questionFlow as QuestionNode[]).find(n => n.id === currentNode.nextId);
      if (nextNode) {
        setTimeout(() => processQuestionNode(nextNode), 1000);
      }
    }
  };

  const handleLeadSubmit = async () => {
    if (!leadForm.name) return;

    try {
      await submitLead.mutateAsync({
        chatbotId: chatbotId,
        userId: chatbot?.userId,
        name: leadForm.name,
        phone: leadForm.phone || null,
        email: leadForm.email || null,
        consentGiven: leadForm.consent,
        conversationContext: {
          messages: messages.slice(0, -1), // Exclude the form message
          variables: context.variables
        }
      });

      setContext(prev => ({ ...prev, showingLeadForm: false, awaitingInput: undefined }));
      setLeadForm({ name: '', phone: '', email: '', consent: false });
      
      addBotMessage('Thank you for your information! Someone from our team will be in touch with you soon.');
      
      // Send webhook if configured
      if (chatbot?.leadsWebhookUrl) {
        // The webhook is handled on the server side
      }
    } catch (error) {
      addBotMessage('I apologize, but there was an error submitting your information. Please try again.');
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  if (isLoading || !chatbot) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="w-14 h-14 bg-slate-300 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (!chatbot.isActive) {
    return null; // Don't show inactive chatbots
  }

  const bubblePosition = chatbot.bubblePosition || 'bottom-right';
  const horizontalOffset = chatbot.horizontalOffset || 20;
  const verticalOffset = chatbot.verticalOffset || 20;

  const getBubblePositionStyles = () => {
    const styles: React.CSSProperties = { position: 'fixed', zIndex: 1000 };
    
    if (bubblePosition.includes('bottom')) {
      styles.bottom = `${verticalOffset}px`;
    } else {
      styles.top = `${verticalOffset}px`;
    }
    
    if (bubblePosition.includes('right')) {
      styles.right = `${horizontalOffset}px`;
    } else {
      styles.left = `${horizontalOffset}px`;
    }
    
    return styles;
  };

  const getWindowPositionStyles = () => {
    const styles: React.CSSProperties = { position: 'fixed', zIndex: 999 };
    
    if (bubblePosition.includes('bottom')) {
      styles.bottom = `${verticalOffset + 70}px`;
    } else {
      styles.top = `${verticalOffset + 70}px`;
    }
    
    if (bubblePosition.includes('right')) {
      styles.right = `${horizontalOffset}px`;
    } else {
      styles.left = `${horizontalOffset}px`;
    }
    
    return styles;
  };

  return (
    <>
      {/* Chat Bubble */}
      <button
        onClick={toggleChat}
        className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group chat-bubble-enter"
        style={{
          ...getBubblePositionStyles(),
          backgroundColor: chatbot.primaryColor || '#6366F1',
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {chatbot.chatBubbleIcon ? (
          <img 
            src={chatbot.chatBubbleIcon} 
            alt="Chat" 
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : isOpen ? (
          <X className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
        ) : (
          <Bot className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
        )}
        
        {/* Notification Badge */}
        {!hasPlayedNotification && !isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            1
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="bg-white rounded-lg shadow-2xl border border-slate-200 flex flex-col chat-widget-enter"
          style={{
            ...getWindowPositionStyles(),
            width: '320px',
            height: '480px',
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
                onClick={toggleChat}
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
                  
                  <div className="max-w-[80%]">
                    {message.type === 'form' && context.showingLeadForm ? (
                      <div className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
                        <h4 className="font-medium text-sm">Contact Information</h4>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor="name" className="text-xs">Name *</Label>
                            <Input
                              id="name"
                              placeholder="Your name"
                              value={leadForm.name}
                              onChange={(e) => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                              className="text-sm h-8"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone" className="text-xs">Phone</Label>
                            <Input
                              id="phone"
                              placeholder="Phone number"
                              value={leadForm.phone}
                              onChange={(e) => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                              className="text-sm h-8"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email" className="text-xs">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="Email address"
                              value={leadForm.email}
                              onChange={(e) => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                              className="text-sm h-8"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="consent"
                              checked={leadForm.consent}
                              onCheckedChange={(checked) => setLeadForm(prev => ({ ...prev, consent: checked as boolean }))}
                            />
                            <Label htmlFor="consent" className="text-xs">
                              I agree to be contacted about this inquiry
                            </Label>
                          </div>
                          <Button
                            onClick={handleLeadSubmit}
                            disabled={!leadForm.name || submitLead.isPending}
                            className="w-full text-sm h-8"
                            style={{ backgroundColor: chatbot.primaryColor }}
                          >
                            {submitLead.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : null}
                            {chatbot.leadButtonText || 'Submit'}
                          </Button>
                        </div>
                      </div>
                    ) : message.type === 'options' ? (
                      <div className="space-y-2">
                        <div className="bg-white p-3 rounded-lg text-sm shadow-sm">
                          {message.content}
                        </div>
                        <div className="space-y-1">
                          {message.options?.map((option, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="w-full text-left justify-start text-xs h-8"
                              onClick={() => handleOptionClick(option)}
                              disabled={context.awaitingInput !== 'choice'}
                            >
                              {option.text}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'p-3 rounded-lg text-sm',
                          message.sender === 'user'
                            ? 'text-white'
                            : 'bg-white shadow-sm text-slate-900'
                        )}
                        style={message.sender === 'user' ? { backgroundColor: chatbot.primaryColor } : {}}
                      >
                        {message.content}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {sendMessage.isPending && (
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
                className="flex-1 text-sm h-8"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={sendMessage.isPending || context.showingLeadForm}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || sendMessage.isPending || context.showingLeadForm}
                size="sm"
                className="h-8"
                style={{ backgroundColor: chatbot.primaryColor }}
              >
                <Send className="h-3 w-3" />
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
      )}
    </>
  );
}
