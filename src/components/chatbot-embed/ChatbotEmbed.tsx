import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send,  Volume2, VolumeX, User, Phone, Mail } from 'lucide-react';

// Declare global window property for RankVedChatbotConfig
declare global {
  interface Window {
    RankVedChatbotConfig?: {
      apiUrl?: string;
      [key: string]: any;
    };
  }
}

interface ChatbotConfig {
  chatbotId: string;
  position: string;
  theme: 'light' | 'dark';
  primaryColor: string;
  zIndex: number;
  apiUrl: string;
  autoOpen: boolean;
  greetingMessage: string;
  avatarUrl: string;
  showAvatar: boolean;
  soundEnabled: boolean;
  popupDelay: number;
  messageDelay: number;
  // Dynamic config fields
  name?: string;
  welcomeMessage?: string;
  secondaryColor?: string;
  chatWindowAvatar?: string;
  chatBubbleIcon?: string;
  chatWidgetIcon?: string;
  chatWidgetName?: string;
  inputPlaceholder?: string;
  initialMessageDelay?: number;
  popupSoundEnabled?: boolean;
  customPopupSound?: string;
  popupSoundVolume?: number;
  replyDelay?: number;
  bubblePosition?: string;
  horizontalOffset?: number;
  verticalOffset?: number;
  title?: string;
  showWelcomePopup?: boolean;
  suggestionButtons?: string[];
  leadButtonText?: string;
  leadCollectionEnabled?: boolean;
  leadCollectionFields?: string[];
  whatsapp?: string;
  email?: string;
  phone?: string;
  website?: string;
  poweredByText?: string;
  poweredByLink?: string;
  chatWindowStyle?: string;
  chatWindowTheme?: string;
  borderRadius?: number;
  shadowStyle?: string;
  isActive?: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  followUpButtons?: Array<{ text: string; payload: string | object }>;
  ctaButton?: { text: string; link: string };
  shouldShowLead?: boolean;
  intentId?: string;
}

interface LeadData {
  name: string;
  email: string;
  phone: string;
  [key: string]: string; // For additional custom fields
}

interface ChatbotEmbedProps {
  config: ChatbotConfig;
  domain: string;
  referer: string;
}

const ChatbotEmbed: React.FC<ChatbotEmbedProps> = ({ config, domain, referer }: ChatbotEmbedProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [dynamicConfig, setDynamicConfig] = useState<ChatbotConfig | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isFirstMessageLoading, setIsFirstMessageLoading] = useState(false);
  const [hasPlayedInitialSound, setHasPlayedInitialSound] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(false);
  
  // Lead collection states
  const [leadData, setLeadData] = useState<LeadData>({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize audio for notification sounds
  useEffect(() => {
    if (dynamicConfig && !isConfigLoading) {
      // Use the frontend URL for sound files, not the backend API URL
      const frontendUrl = window.location.origin;
      const soundUrl = dynamicConfig.customPopupSound || `${frontendUrl}/openclose.mp3`;
      console.log('Loading sound from:', soundUrl);
      console.log('Frontend URL:', frontendUrl);
      
      // Create audio element and handle loading
      const audio = new Audio();
      audio.preload = 'auto';
      
      // Add event listeners to track loading
      audio.addEventListener('canplaythrough', () => {
        console.log('✅ Audio loaded successfully');
        setAudioRef(audio);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('❌ Audio loading error:', e);
        console.error('❌ Audio error details:', audio.error);
      });
      
      // Set the source after adding event listeners
      audio.src = soundUrl;
    }
  }, [dynamicConfig, config.apiUrl, isConfigLoading]);

  // Handle audio configuration when config and audio are ready
  useEffect(() => {
    if (dynamicConfig && audioRef) {
      // Update audio source and volume based on config
      if (dynamicConfig.customPopupSound) {
        audioRef.src = dynamicConfig.customPopupSound;
      }
      audioRef.volume = (dynamicConfig.popupSoundVolume || 50) / 100;
    }
  }, [dynamicConfig, audioRef]);



    // Handle popup delay - show chat bubble after delay
  useEffect(() => {
    if (dynamicConfig && !isConfigLoading) {
      const popupDelay = dynamicConfig.popupDelay || config.popupDelay || 0;
      console.log('Popup delay set to:', popupDelay, 'ms');
      
      if (popupDelay > 0) {
        console.log('Waiting', popupDelay, 'ms before showing chat bubble...');
        const timer = setTimeout(() => {
          console.log('Showing chat bubble after popup delay');
          setShowChatBubble(true);
          
          // Try to play sound when bubble appears
          if (soundEnabled && audioRef && dynamicConfig.popupSoundEnabled !== false && !hasPlayedInitialSound) {
            setTimeout(() => {
              try {
                audioRef.currentTime = 0;
                audioRef.volume = (dynamicConfig.popupSoundVolume || 50) / 100;
                audioRef.play().then(() => {
                  console.log('🎵 ✅ Sound played successfully when bubble appeared!');
                  setHasPlayedInitialSound(true);
                }).catch((error) => {
                  console.log('⚠️ Autoplay blocked by browser (expected):', error.message);
                  setHasPlayedInitialSound(true); // Mark as played even if blocked
                });
                console.log('🎵 Attempting to play sound when bubble appears');
              } catch (error) {
                console.error('❌ Error playing sound when bubble appears:', error);
                setHasPlayedInitialSound(true);
              }
            }, 100); // Small delay to ensure bubble is rendered
          }
        }, popupDelay);
        
        return () => clearTimeout(timer);
      } else {
        // No delay, show immediately
        console.log('No popup delay, showing chat bubble immediately');
        setShowChatBubble(true);
        
        // Try to play sound when bubble appears immediately
        if (soundEnabled && audioRef && dynamicConfig.popupSoundEnabled !== false && !hasPlayedInitialSound) {
          setTimeout(() => {
            try {
              audioRef.currentTime = 0;
              audioRef.volume = (dynamicConfig.popupSoundVolume || 50) / 100;
              audioRef.play().then(() => {
                console.log('🎵 ✅ Sound played successfully when bubble appeared!');
                setHasPlayedInitialSound(true);
              }).catch((error) => {
                console.log('⚠️ Autoplay blocked by browser (expected):', error.message);
                setHasPlayedInitialSound(true);
              });
              console.log('🎵 Attempting to play sound when bubble appears');
            } catch (error) {
              console.error('❌ Error playing sound when bubble appears:', error);
              setHasPlayedInitialSound(true);
            }
          }, 100);
        }
      }
    }
  }, [dynamicConfig, isConfigLoading, config.popupDelay, soundEnabled, audioRef]); // Removed hasPlayedInitialSound from dependencies

  // Fetch dynamic configuration from API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsConfigLoading(true);
        // Use the apiUrl from the config that was already fetched by the loader
        const apiUrl = config.apiUrl || window.RankVedChatbotConfig?.apiUrl;
        if (!apiUrl) {
          throw new Error('No API URL available');
        }
        
        const response = await fetch(`${apiUrl}/api/chatbot/${config.chatbotId}/config`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Domain': domain,
            'X-Referer': referer
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`);
        }

        const dynamicConfigData = await response.json();
        console.log("dynamicConfigData", dynamicConfigData);
        // Merge static config with dynamic config
        const mergedConfig = {
          ...config,
          ...dynamicConfigData
        };

        setDynamicConfig(mergedConfig);

        // Set initial states based on dynamic config
        setSoundEnabled(mergedConfig.popupSoundEnabled !== false);

      } catch (error) {
        console.error('Error fetching chatbot config:', error);
        setConfigError('Failed to load chatbot configuration');
        // Fallback to static config
        setDynamicConfig(config);
        setSoundEnabled(config.soundEnabled);
      } finally {
        setIsConfigLoading(false);
      }
    };

    fetchConfig();
  }, [config.chatbotId, config.apiUrl, domain, referer]);

  // Handle welcome message logic and auto-load first message
  useEffect(() => {
    console.log("dynamicConfig welcomeMessage:", dynamicConfig?.welcomeMessage);
    console.log("dynamicConfig showWelcomePopup:", dynamicConfig?.showWelcomePopup);
    
    if (dynamicConfig && isOpen && messages.length === 0) {
      // Check if welcome message is enabled
      if (dynamicConfig.showWelcomePopup) {
        // If custom welcome message exists and is not empty, show it
        if (dynamicConfig.welcomeMessage && dynamicConfig.welcomeMessage.trim() !== '') {
          console.log("Showing custom welcome message:", dynamicConfig.welcomeMessage);
          setMessages([{
            id: 'greeting',
            text: dynamicConfig.welcomeMessage,
            sender: 'bot',
            timestamp: new Date()
          }]);
        } else {
          // If no custom message or message is blank, start loading first message immediately
          console.log("No custom welcome message, starting first message loading");
          setIsFirstMessage(true);
          setIsFirstMessageLoading(true);
          // Automatically send "hello" to get first response
          sendFirstMessage();
        }
      } else {
        // Welcome message is disabled, don't add any messages - let the UI show the welcome widget
        console.log("Welcome message disabled, showing widget welcome");
        // Don't add any messages - the welcome widget will be shown in the UI
      }
    }
  }, [dynamicConfig, isOpen, messages.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Play bubble sound when bubble appears
  // Play notification sound for new messages
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled || !audioRef) return;
    try {
      audioRef.currentTime = 0;
      audioRef.volume = (dynamicConfig?.popupSoundVolume || 50) / 100;
      audioRef.play().catch(console.error);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [soundEnabled, audioRef, dynamicConfig?.popupSoundVolume]);





  // Send first message automatically
  const sendFirstMessage = async () => {
    if (!dynamicConfig) return;
    
    try {
      const apiUrl = dynamicConfig.apiUrl || window.RankVedChatbotConfig?.apiUrl;
      if (!apiUrl) {
        throw new Error('No API URL available');
      }
      
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Chatbot-ID': dynamicConfig.chatbotId,
          'X-Domain': domain,
          'X-Referer': referer
        },
        body: JSON.stringify({
          message: 'hello',
          sessionId: getSessionId(),
          chatbotId: dynamicConfig.chatbotId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send first message');
      }

      const data = await response.json();

      // Simulate typing delay
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response || 'Hello! How can I help you today?',
          sender: 'bot',
          timestamp: new Date(),
          followUpButtons: data.followUpButtons || [],
          ctaButton: data.ctaButton || undefined,
          shouldShowLead: data.shouldShowLead || false,
          intentId: data.intentId || 'unrecognized_intent'
        };

        setMessages([botMessage]);
        setIsFirstMessageLoading(false);
        setIsFirstMessage(false);
        playNotificationSound();
        
        // Check if lead form should be shown
        showLeadFormIfNeeded(botMessage);
      }, dynamicConfig.replyDelay || 1000);

    } catch (error) {
      console.error('Error sending first message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Hello! How can I help you today?',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([errorMessage]);
      setIsFirstMessageLoading(false);
      setIsFirstMessage(false);
    }
  };

  // Get or create session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem('rankved-chatbot-session');
    // Check if the existing session ID is in the old format and clear it
    if (sessionId && (sessionId.startsWith('session_') || sessionId.includes('-'))) {
      localStorage.removeItem('rankved-chatbot-session');
      sessionId = null;
    }
    if (!sessionId) {
      // Generate a proper UUID v4 format
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      sessionId = generateUUID();
      localStorage.setItem('rankved-chatbot-session', sessionId);
    }
    return sessionId;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !dynamicConfig) return;

    // If first message is already loading, don't send another
    if (isFirstMessageLoading) {
      console.log("First message is already loading, ignoring user input");
      return;
    }

    // Handle first message case
    let messageToSend = text.trim();
    let shouldShowUserMessage = true;

    if (isFirstMessage && dynamicConfig.showWelcomePopup && 
        (!dynamicConfig.welcomeMessage || dynamicConfig.welcomeMessage.trim() === '')) {
      // If it's the first message and welcome is enabled but no custom message, send "hello" automatically
      console.log("First message detected, sending 'hello' automatically");
      messageToSend = 'hello';
      shouldShowUserMessage = false; // Don't show the "hello" message to user
      setIsFirstMessage(false);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    // Only show user message if it should be visible
    if (shouldShowUserMessage) {
      setMessages(prev => [...prev, userMessage]);
    }
    setInputValue('');
    setIsLoading(true);

    try {
      const apiUrl = dynamicConfig.apiUrl || window.RankVedChatbotConfig?.apiUrl;
      if (!apiUrl) {
        throw new Error('No API URL available');
      }
      
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Chatbot-ID': dynamicConfig.chatbotId,
          'X-Domain': domain,
          'X-Referer': referer
        },
        body: JSON.stringify({
          message: messageToSend,
          sessionId: getSessionId(),
          chatbotId: dynamicConfig.chatbotId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Simulate typing delay
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response || 'Sorry, I couldn\'t process your message.',
          sender: 'bot',
          timestamp: new Date(),
          followUpButtons: data.followUpButtons || [],
          ctaButton: data.ctaButton || undefined,
          shouldShowLead: data.shouldShowLead || false,
          intentId: data.intentId || 'unrecognized_intent'
        };

        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
        playNotificationSound();
        
        // Check if lead form should be shown
        showLeadFormIfNeeded(botMessage);
      }, dynamicConfig.replyDelay || 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, there was an error processing your message. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Toggle sound
  const toggleSound = () => setSoundEnabled(!soundEnabled);

  // Handle lead form submission
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dynamicConfig) return;

    setIsSubmittingLead(true);
    console.log('[Lead Form] Submitting lead data:', {
      chatbotId: dynamicConfig.chatbotId,
      sessionId: getSessionId(),
      leadData,
      conversationContext: messages.length
    });
    
    try {
      const apiUrl = dynamicConfig.apiUrl || window.RankVedChatbotConfig?.apiUrl;
      if (!apiUrl) {
        throw new Error('No API URL available');
      }
      
      const response = await fetch(`${apiUrl}/api/chat/${dynamicConfig.chatbotId}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Domain': domain,
          'X-Referer': referer
        },
        body: JSON.stringify({
          chatbotId: dynamicConfig.chatbotId,
          sessionId: getSessionId(),
          ...leadData,
          consentGiven: true,
          source: 'chat_widget',
          conversationContext: messages.map(msg => ({
            role: msg.sender,
            content: msg.text,
            timestamp: msg.timestamp
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit lead');
      }

      setLeadSubmitted(true);
      
      // Add a success message
      const successMessage: Message = {
        id: Date.now().toString(),
        text: 'Thank you! Your information has been submitted successfully. We\'ll get back to you soon!',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);

    } catch (error) {
      console.error('Error submitting lead:', error);
      // Add an error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Sorry, there was an error submitting your information. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Handle lead form input changes
  const handleLeadInputChange = (field: string, value: string) => {
    setLeadData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Show lead form when shouldShowLead is true
  const showLeadFormIfNeeded = (message: Message) => {
    console.log('[Lead Form] Checking if should show lead form:', {
      shouldShowLead: message.shouldShowLead,
      leadCollectionEnabled: dynamicConfig?.leadCollectionEnabled,
      leadSubmitted
    });
  };

  // Function to parse and render formatted text
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    // Split by line breaks first
    const lines = text.split('\n');

    return lines.map((line, lineIndex) => {
      if (!line.trim()) {
        return <br key={lineIndex} />;
      }

      // Check for key points (lines starting with •, -, *, or numbered)
      const keyPointMatch = line.match(/^[\s]*([•\-\*]|\d+\.)\s+(.+)$/);
      if (keyPointMatch) {
        return (
          <div key={lineIndex} className="key-point">
            <span className="key-point-marker">{keyPointMatch[1]}</span>
            <span className="key-point-text">{renderInlineFormatting(keyPointMatch[2])}</span>
          </div>
        );
      }

      // Check for headers (lines with #)
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const headerText = renderInlineFormatting(headerMatch[2]);
        const Tag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
        return <Tag key={lineIndex} className="formatted-header">{headerText}</Tag>;
      }

      // Regular paragraph
      return (
        <p key={lineIndex} className="formatted-paragraph">
          {renderInlineFormatting(line)}
        </p>
      );
    });
  };

  // Function to render inline formatting (bold, italic, etc.)
  const renderInlineFormatting = (text: string) => {
    if (!text) return null;

    // Handle HTML tags from AI responses first
    let processedText = text;
    
    // Replace HTML tags with markdown equivalents
    processedText = processedText
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<code>(.*?)<\/code>/g, '`$1`')
      .replace(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/g, '[$2]($1)');

    // Simple approach: process one pattern at a time
    let remainingText = processedText;
    
    // Process bold text first
    const boldParts = remainingText.split(/(\*\*.*?\*\*)/);
    const boldResult = boldParts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2);
        return <strong key={`bold-${index}`}>{content}</strong>;
      }
      return part;
    });
    
    // Process italic text
    const italicResult: (string | JSX.Element)[] = [];
    boldResult.forEach((part, index) => {
      if (typeof part === 'string') {
        const italicParts = part.split(/(\*.*?\*)/);
        italicParts.forEach((italicPart, italicIndex) => {
          if (italicPart.startsWith('*') && italicPart.endsWith('*') && italicPart.length > 2) {
            const content = italicPart.slice(1, -1);
            italicResult.push(<em key={`italic-${index}-${italicIndex}`}>{content}</em>);
          } else {
            italicResult.push(italicPart);
          }
        });
      } else {
        italicResult.push(part);
      }
    });
    
    // Process code
    const codeResult: (string | JSX.Element)[] = [];
    italicResult.forEach((part, index) => {
      if (typeof part === 'string') {
        const codeParts = part.split(/(`.*?`)/);
        codeParts.forEach((codePart, codeIndex) => {
          if (codePart.startsWith('`') && codePart.endsWith('`') && codePart.length > 2) {
            const content = codePart.slice(1, -1);
            codeResult.push(<code key={`code-${index}-${codeIndex}`}>{content}</code>);
          } else {
            codeResult.push(codePart);
          }
        });
      } else {
        codeResult.push(part);
      }
    });
    
    // Process links
    const linkResult: (string | JSX.Element)[] = [];
    codeResult.forEach((part, index) => {
      if (typeof part === 'string') {
        const linkParts = part.split(/(\[.*?\]\(.*?\))/);
        linkParts.forEach((linkPart, linkIndex) => {
          const linkMatch = linkPart.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (linkMatch) {
            linkResult.push(
              <a 
                key={`link-${index}-${linkIndex}`} 
                href={linkMatch[2]} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {linkMatch[1]}
              </a>
            );
          } else {
            linkResult.push(linkPart);
          }
        });
      } else {
        linkResult.push(part);
      }
    });

    return linkResult;
  };

  // Don't render if config is still loading
  if (isConfigLoading) {
    return null;
  }

  // Don't render if there's a config error
  if (configError) {
    console.error('Chatbot config error:', configError);
    return null;
  }

  // Don't render if chatbot is not active
  if (dynamicConfig && dynamicConfig.isActive === false) {
    return null;
  }

  const theme = dynamicConfig?.chatWindowTheme === 'dark' ? 'dark' : 'light';
  const primaryColor = dynamicConfig?.primaryColor || '#6366F1';
  const secondaryColor = dynamicConfig?.secondaryColor || '#797cf6d4';

  // Get position styles based on dynamic config
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: dynamicConfig?.zIndex || 9999,
      '--primary-color': primaryColor,
      '--secondary-color': secondaryColor
    } as React.CSSProperties;

    const position = dynamicConfig?.bubblePosition || 'bottom-right';
    const horizontalOffset = dynamicConfig?.horizontalOffset || 20;
    const verticalOffset = dynamicConfig?.verticalOffset || 20;

    switch (position) {
      case 'bottom-right':
        return { ...baseStyles, bottom: `${verticalOffset}px`, right: `${horizontalOffset}px` };
      case 'bottom-left':
        return { ...baseStyles, bottom: `${verticalOffset}px`, left: `${horizontalOffset}px` };
      case 'top-right':
        return { ...baseStyles, top: `${verticalOffset}px`, right: `${horizontalOffset}px` };
      case 'top-left':
        return { ...baseStyles, top: `${verticalOffset}px`, left: `${horizontalOffset}px` };
      default:
        return { ...baseStyles, bottom: `${verticalOffset}px`, right: `${horizontalOffset}px` };
    }
  };

  const borderRadius = dynamicConfig?.borderRadius || 16;
  const shadowStyle = dynamicConfig?.shadowStyle || 'soft';

  // Get shadow styles
  const getShadowStyles = () => {
    switch (shadowStyle) {
      case 'none':
        return 'none';
      case 'soft':
        return '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      case 'medium':
        return '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      case 'strong':
        return '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      default:
        return '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .rankved-chatbot {
          position: fixed !important;
          pointer-events: auto;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
        }
        .rankved-chatbot * {
          box-sizing: border-box;
        }
        .rankved-chatbot .chat-bubble {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          background: ${primaryColor};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: ${getShadowStyles()};
          transition: all 0.3s ease;
          color: white;
        }
        .rankved-chatbot .chat-bubble:hover {
          transform: scale(1.1);
        }
        .rankved-chatbot .chat-window {
          width: 380px;
          height: 600px;
          max-height: 85vh;
          background: ${theme === 'dark' ? '#111827' : 'white'};
          border-radius: ${borderRadius}px;
          box-shadow: ${getShadowStyles()};
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 768px) {
          .rankved-chatbot .chat-window {
            width: 420px;
            height: 750px;
            max-height: 85vh;
          }
        }
        @media (min-width: 1024px) {
          .rankved-chatbot .chat-window {
            width: 460px;
            height: 900px;
            max-height: 90vh;
          }
        }
        .rankved-chatbot .chat-header {
          background: ${primaryColor};
          color: white;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          min-height: 80px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }
        .rankved-chatbot .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          min-height: 300px;
          max-height: none;
          background: ${theme === 'dark' ? '#1f2937' : '#fafafa'};
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .rankved-chatbot .chat-messages::-webkit-scrollbar {
          display: none;
        }
        .rankved-chatbot .message {
          margin-bottom: 8px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .rankved-chatbot .message.user {
          align-items: flex-end;
        }
        .rankved-chatbot .message.bot {
          align-items: flex-start;
        }
        .rankved-chatbot .message-content {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          width: 100%;
        }
        .rankved-chatbot .message.user .message-content {
          flex-direction: row-reverse;
        }
        .rankved-chatbot .message.bot .message-content {
          flex-direction: row;
        }
        .rankved-chatbot .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${primaryColor};
          color: white;
          font-size: 16px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 480px) {
          .rankved-chatbot .message-avatar {
            width: 28px;
            height: 28px;
            font-size: 14px;
          }
        }
        
        /* Welcome container styles - centered display */
        .rankved-chatbot .welcome-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 400px;
          text-align: center;
          padding: 20px;
        }
        
        .rankved-chatbot .welcome-avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: ${primaryColor};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        
        .rankved-chatbot .welcome-title-large {
          font-size: 24px;
          font-weight: 700;
          color: ${theme === 'dark' ? '#f9fafb' : '#1f2937'};
          margin-bottom: 12px;
          line-height: 1.2;
        }
        
        .rankved-chatbot .welcome-text-large {
          font-size: 16px;
          color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
          line-height: 1.4;
          max-width: 280px;
        }
        
        @media (max-width: 480px) {
          .rankved-chatbot .welcome-container {
            min-height: 300px;
            padding: 16px;
          }
          
          .rankved-chatbot .welcome-avatar-large {
            width: 64px;
            height: 64px;
            margin-bottom: 16px;
          }
          
          .rankved-chatbot .welcome-title-large {
            font-size: 20px;
            margin-bottom: 10px;
          }
          
          .rankved-chatbot .welcome-text-large {
            font-size: 14px;
            max-width: 240px;
          }
        }
        .rankved-chatbot .message.user .message-avatar {
          display: none;
        }
        .rankved-chatbot .message-bubble {
          max-width: 75%;
          padding: 6px 14px;
          word-wrap: break-word;
          position: relative;
          font-size: 12px;
          font-weight: 400;
          line-height: 1.2;
          border-radius: 18px;
          letter-spacing: 0.01em;
        }
        @media (min-width: 768px) {
          .rankved-chatbot .message-bubble {
            padding: 6px 14px;
            font-size: 12px;
            line-height: 1.4;
          }
        }
        @media (min-width: 1024px) {
          .rankved-chatbot .message-bubble {
            padding: 6px 14px;
            font-size: 14px;
            line-height: 1.2;
          }
        }
        .rankved-chatbot .message.user .message-bubble {
          background: ${primaryColor};
          color: white;
          border-radius: 18px 18px 4px 18px;
          margin-left: auto;
        }
        .rankved-chatbot .message.bot .message-bubble {
          background: ${theme === 'dark' ? '#374151' : '#ededed'};
          color: ${theme === 'dark' ? '#f9fafb' : '#374151'};
          max-width: 80%;  
          border-radius: 18px 18px 18px 4px;
          box-shadow: 2px 2px 2px 0px #f0f0f02b;
        }
        .rankved-chatbot .chat-input {
          padding: 0px 20px 10px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: transparent;
          position: relative;
        }
        .rankved-chatbot .chat-input-container {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          margin-bottom: 3px;
          z-index: 1;
        }
        .rankved-chatbot .chat-input input {
          width: 100%;
          padding: 12px 48px 12px 16px;
          border: 1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'};
          border-radius: 25px;
          outline: none;
          font-size: 13px;
          background: ${theme === 'dark' ? '#374151' : 'white'};
          color: ${theme === 'dark' ? '#f9fafb' : '#374151'};
          box-shadow: 0 4px 6px -3px rgb(0 0 0 / 10%);
          box-sizing: border-box;
          line-height: 1.2;
        }
        @media (min-width: 768px) {
          .rankved-chatbot .chat-input input {
            padding: 12px 52px 12px 18px;
            font-size: 12px;
            border-radius: 28px;
          }
        }
        @media (min-width: 1024px) {
          .rankved-chatbot .chat-input input {
            padding: 14px 56px 14px 20px;
            font-size: 13px;
            border-radius: 30px;
          }
        }
        .rankved-chatbot .chat-input input:focus {
          border-color: ${primaryColor};
          box-shadow: 0 0 0 2px ${primaryColor}20;
        }
        .rankved-chatbot .chat-input button {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          width: 38px;
          height: 38px;
          background: ${primaryColor};
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 10;
          box-sizing: border-box;
        }
        @media (min-width: 768px) {
          .rankved-chatbot .chat-input button {
            width: 34px;
            height: 34px;
            right: 4px;
          }
        }
        @media (min-width: 1024px) {
          .rankved-chatbot .chat-input button {
            width: 40px;
            height: 40px;
            right: 4px;
          }
        }
        .rankved-chatbot .chat-input button:hover {
          background: ${primaryColor}dd;
          transform: translateY(-50%) scale(1.05);
        }
        .rankved-chatbot .chat-input button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: translateY(-50%) scale(1);
        }
        .rankved-chatbot .message-actions {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: flex-start;
          width: 100%;
          padding-left: 46px;
        }
        .rankved-chatbot .message.user .message-actions {
          align-items: flex-end;
          padding-left: 0;
          padding-right: 0;
        }
        .rankved-chatbot .follow-up-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 8px;
        }
        .rankved-chatbot .follow-up-button {
          padding: 4px 10px;
          background: ${secondaryColor};
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          transition: all 0.2s ease;
          min-height: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .rankved-chatbot .follow-up-button:hover {
          background: ${secondaryColor}dd;
          transform: scale(1.02);
        }
        .rankved-chatbot .cta-button {
          padding: 2px 8px;
          background: white;
          color: ${primaryColor};
          border: 2px solid ${secondaryColor};
          border-radius: 20px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          min-height: 20px;
        }
        .rankved-chatbot .cta-button:hover {
          background: ${secondaryColor}10;
          transform: scale(1.02);
        }
        .rankved-chatbot .cta-button::after {
          content: '↗';
          font-size: 12px;
          font-weight: bold;
          margin-left: 4px;
        }
        .rankved-chatbot .powered-by {
          font-size: 11px;
          color: #9ca3af;
          text-align: center;
          margin-top: 3px;
        }
        @media (max-width: 480px) {
          .rankved-chatbot .chat-window {
            width: calc(100vw - 40px);
            height: calc(100vh - 70px);
            max-height: calc(100vh - 120px);
            position: fixed;
            
            left: 20px;
            right: 20px;
            bottom: 20px;
          }
          .rankved-chatbot .chat-messages {
            min-height: 150px;
          }
        }
        @media (min-width: 768px) {
          .rankved-chatbot .follow-up-button,
          .rankved-chatbot .cta-button {
            padding: 1px 11px;
            font-size: 12px;
            font-weight: 500;
            border-radius: 22px;
          }
          .rankved-chatbot .cta-button::after {
            font-size: 12px;
            margin-left: 4px;
          }
        }
        @media (min-width: 1024px) {
          .rankved-chatbot .follow-up-button,
          .rankved-chatbot .cta-button {
            padding: 3px 14px;
            font-size: 12px;
            font-weight: 500;
            border-radius: 24px;
            min-height: 25px;
          }
          .rankved-chatbot .cta-button::after {
            font-size: 13px;
            margin-left: 4px;
          }
        }
        
        /* Typing indicator animation */
        .rankved-chatbot .typing-indicator {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          min-width: 60px;
        }
        .rankved-chatbot .typing-dots {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .rankved-chatbot .typing-dots .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: ${secondaryColor};
          animation: typing-wave 1.4s ease-in-out infinite both;
        }
        .rankved-chatbot .typing-dots .dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        .rankved-chatbot .typing-dots .dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        .rankved-chatbot .typing-dots .dot:nth-child(3) {
          animation-delay: 0s;
        }
        @keyframes typing-wave {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        /* Formatted text styles */
        .rankved-chatbot .message-bubble .formatted-paragraph {
          margin: 0 0 8px 0;
          line-height: 1.5;
        }
        .rankved-chatbot .message-bubble .formatted-paragraph:last-child {
          margin-bottom: 0;
        }
        .rankved-chatbot .message-bubble .formatted-header {
          margin: 12px 0 8px 0;
          font-weight: 600;
          line-height: 1.3;
        }
        .rankved-chatbot .message-bubble .formatted-header:first-child {
          margin-top: 0;
        }
        .rankved-chatbot .message-bubble h1.formatted-header {
          font-size: 1.4em;
          color: ${primaryColor};
        }
        .rankved-chatbot .message-bubble h2.formatted-header {
          font-size: 1.3em;
          color: ${primaryColor};
        }
        .rankved-chatbot .message-bubble h3.formatted-header {
          font-size: 1.2em;
          color: ${primaryColor};
        }
        .rankved-chatbot .message-bubble h4.formatted-header,
        .rankved-chatbot .message-bubble h5.formatted-header,
        .rankved-chatbot .message-bubble h6.formatted-header {
          font-size: 1.1em;
          color: ${primaryColor};
        }
        .rankved-chatbot .message-bubble .key-point {
          display: flex;
          align-items: flex-start;
          margin: 6px 0;
          line-height: 1.4;
        }
        .rankved-chatbot .message-bubble .key-point-marker {
          margin-right: 8px;
          color: ${primaryColor};
          font-weight: 600;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .rankved-chatbot .message-bubble .key-point-text {
          flex: 1;
        }
        .rankved-chatbot .message-bubble strong {
          font-weight: 600;
          color: ${primaryColor};
        }
        .rankved-chatbot .message-bubble em {
          font-style: italic;
          color: #6b7280;
        }
        .rankved-chatbot .message-bubble code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          color: #374151;
        }
        .rankved-chatbot .message-bubble a {
          color: ${primaryColor};
          text-decoration: underline;
          transition: color 0.2s ease;
        }
        .rankved-chatbot .message-bubble a:hover {
          color: ${primaryColor}dd;
        }
        
        /* Lead Form Styles */
        .rankved-chatbot .lead-form-container {
          padding: 16px;
          background: #ffffff;
          border-top: 1px solid #e5e7eb;
          flex-shrink: 0;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
        }
        .rankved-chatbot .lead-form-header {
          text-align: center;
          margin-bottom: 16px;
        }
        .rankved-chatbot .lead-form-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }
        .rankved-chatbot .lead-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .rankved-chatbot .lead-form-field {
          position: relative;
          display: flex;
          align-items: center;
        }
        .rankved-chatbot .field-icon {
          position: absolute;
          left: 10px;
          color: #9ca3af;
          z-index: 1;
        }
        .rankved-chatbot .lead-form-field input {
          width: 100%;
          padding: 10px 10px 10px 36px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          background: white;
          transition: all 0.2s ease;
        }
        .rankved-chatbot .lead-form-field input:focus {
          outline: none;
          border-color: ${primaryColor};
          box-shadow: 0 0 0 2px ${primaryColor}15;
        }
        .rankved-chatbot .lead-form-field input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }
        .rankved-chatbot .lead-form-actions {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }
        .rankved-chatbot .lead-submit-button {
          flex: 1;
          padding: 10px 16px;
          background: ${primaryColor};
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .rankved-chatbot .lead-submit-button:hover:not(:disabled) {
          background: ${primaryColor}dd;
          transform: translateY(-1px);
        }
        .rankved-chatbot .lead-submit-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }
        .rankved-chatbot .lead-cancel-button {
          padding: 10px 16px;
          background: white;
          color: #6b7280;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .rankved-chatbot .lead-cancel-button:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }
        .rankved-chatbot .lead-cancel-button:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }
        
        /* Inline Lead Form Styles (as part of message) */
        .rankved-chatbot .lead-form-message {
          margin-top: 12px;
          margin-left: auto;
          margin-right: auto;
          padding: 12px;
          background: ${theme === 'dark' ? '#374151' : '#f8fafc'};
          border: 1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
          width: 90%;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .rankved-chatbot .lead-form-message .lead-form-header {
          text-align: center;
          margin-bottom: 12px;
        }
        .rankved-chatbot .lead-form-message .lead-form-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }
        .rankved-chatbot .lead-form-message .lead-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rankved-chatbot .lead-form-message .lead-form-field {
          position: relative;
          display: flex;
          align-items: center;
        }
        .rankved-chatbot .lead-form-message .field-icon {
          position: absolute;
          left: 8px;
          color: #9ca3af;
          z-index: 1;
        }
        .rankved-chatbot .lead-form-message .lead-form-field input {
          width: 100%;
          padding: 8px 8px 8px 28px;
          border: 1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          border-radius: 4px;
          font-size: 12px;
          background: ${theme === 'dark' ? '#4b5563' : 'white'};
          color: ${theme === 'dark' ? '#f9fafb' : '#374151'};
          transition: all 0.2s ease;
        }
        .rankved-chatbot .lead-form-message .lead-form-field input:focus {
          outline: none;
          border-color: ${primaryColor};
          box-shadow: 0 0 0 2px ${primaryColor}15;
        }
        .rankved-chatbot .lead-form-message .lead-form-actions {
          display: flex;
          gap: 6px;
          margin-top: 2px;
        }
        .rankved-chatbot .lead-form-message .lead-submit-button {
          flex: 1;
          padding: 8px 12px;
          background: ${primaryColor};
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .rankved-chatbot .lead-form-message .lead-submit-button:hover:not(:disabled) {
          background: ${primaryColor}dd;
          transform: translateY(-1px);
        }
        .rankved-chatbot .lead-form-message .lead-submit-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }
        .rankved-chatbot .lead-form-message .lead-cancel-button {
          padding: 8px 12px;
          background: white;
          color: #6b7280;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .rankved-chatbot .lead-form-message .lead-cancel-button:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }
        .rankved-chatbot .lead-form-message .lead-cancel-button:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }
      `}</style>

      {showChatBubble && (
        <div className="rankved-chatbot" style={getPositionStyles()}>
          {!isOpen ? (
            <div className="chat-bubble" onClick={() => setIsOpen(true)}>
              {dynamicConfig?.chatBubbleIcon ? (
                <img src={dynamicConfig.chatBubbleIcon} alt="Chat" style={{ width: '35px', height: '35x', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <MessageCircle size={28} />
              )}
            </div>
          ) : (
          <div className="chat-window">
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {dynamicConfig?.chatWidgetIcon ? (
                  <img
                    src={dynamicConfig.chatWidgetIcon}
                    alt="Widget Icon"
                    style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : dynamicConfig?.showAvatar && dynamicConfig?.chatWindowAvatar ? (
                  <img
                    src={dynamicConfig.chatWindowAvatar}
                    alt="Avatar"
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                  />
                ) : null}
                <span style={{ fontWeight: '600' }}>
                  {dynamicConfig?.chatWidgetName || 'Support Chat'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={toggleSound}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="chat-messages">
              {/* Show welcome message when popup is disabled and no messages exist */}
              {!dynamicConfig?.showWelcomePopup && messages.length === 0 && !isFirstMessageLoading && (
                <div className="welcome-container">
                  <div className="welcome-avatar-large">
                    {dynamicConfig?.chatWidgetIcon ? (
                      <img
                        src={dynamicConfig.chatWidgetIcon}
                        alt="Bot Avatar"
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <MessageCircle size={48} />
                    )}
                  </div>
                  <div className="welcome-title-large">
                    {dynamicConfig?.name || dynamicConfig?.chatWidgetName || 'AI Assistant'}
                  </div>
                  <div className="welcome-text-large">
                    {dynamicConfig?.welcomeMessage || 'Ask Your Query'}
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-content">
                    {message.sender === 'bot' && (
                      <div className="message-avatar">
                        {dynamicConfig?.chatWindowAvatar ? (
                          <img
                            src={dynamicConfig.chatWindowAvatar}
                            alt="Bot Avatar"
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <MessageCircle size={16} />
                        )}
                      </div>
                    )}
                    <div className="message-bubble">
                      {message.sender === 'bot' ? renderFormattedText(message.text) : message.text}
                    </div>
                  </div>

                  {/* Message actions (follow-up buttons and CTA) */}
                  {(message.sender === 'bot' && ((message.followUpButtons && message.followUpButtons.length > 0) || message.ctaButton)) && (
                    <div className="message-actions">
                      {/* Follow-up buttons */}
                      {message.followUpButtons && message.followUpButtons.length > 0 && (
                        <div className="follow-up-buttons">
                          {message.followUpButtons.map((button, index) => (
                            <button
                              key={index}
                              className="follow-up-button"
                              onClick={() => {
                                // Send the button text as the message instead of the payload
                                sendMessage(button.text);
                              }}
                            >
                              {button.text}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* CTA button */}
                      {message.ctaButton && (
                        <a
                          href={message.ctaButton.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cta-button"
                        >
                          {message.ctaButton.text}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Lead Form - Show as part of bot message when shouldShowLead is true */}
                  {message.sender === 'bot' && message.shouldShowLead && dynamicConfig?.leadCollectionEnabled && !leadSubmitted && (
                    <div className="lead-form-message">
                      <div className="lead-form-header">
                        <h3>Contact Details</h3>
                      </div>
                      <form onSubmit={handleLeadSubmit} className="lead-form">
                        {dynamicConfig?.leadCollectionFields?.includes('name') && (
                          <div className="lead-form-field">
                            <div className="field-icon">
                              <User size={14} />
                            </div>
                            <input
                              type="text"
                              placeholder="Your Name"
                              value={leadData.name}
                              onChange={(e) => handleLeadInputChange('name', e.target.value)}
                              required
                              disabled={isSubmittingLead}
                            />
                          </div>
                        )}
                        
                        {dynamicConfig?.leadCollectionFields?.includes('email') && (
                          <div className="lead-form-field">
                            <div className="field-icon">
                              <Mail size={14} />
                            </div>
                            <input
                              type="email"
                              placeholder="Your Email"
                              value={leadData.email}
                              onChange={(e) => handleLeadInputChange('email', e.target.value)}
                              required
                              disabled={isSubmittingLead}
                            />
                          </div>
                        )}
                        
                        {dynamicConfig?.leadCollectionFields?.includes('phone') && (
                          <div className="lead-form-field">
                            <div className="field-icon">
                              <Phone size={14} />
                            </div>
                            <input
                              type="tel"
                              placeholder="Your Phone"
                              value={leadData.phone}
                              onChange={(e) => handleLeadInputChange('phone', e.target.value)}
                              required
                              disabled={isSubmittingLead}
                            />
                          </div>
                        )}
                        
                        <div className="lead-form-actions">
                          <button
                            type="submit"
                            disabled={isSubmittingLead}
                            className="lead-submit-button"
                          >
                            {isSubmittingLead ? 'Submitting...' : 'Submit'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setLeadSubmitted(true)}
                            className="lead-cancel-button"
                            disabled={isSubmittingLead}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="message bot">
                  <div className="message-content">
                    <div className="message-avatar">
                      {dynamicConfig?.chatWindowAvatar ? (
                        <img
                          src={dynamicConfig.chatWindowAvatar}
                          alt="Bot Avatar"
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <MessageCircle size={16} />
                      )}
                    </div>
                    <div className="message-bubble typing-indicator">
                      <div className="typing-dots">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isFirstMessageLoading && (
                <div className="message bot">
                  <div className="message-content">
                    <div className="message-avatar">
                      {dynamicConfig?.chatWindowAvatar ? (
                        <img
                          src={dynamicConfig.chatWindowAvatar}
                          alt="Bot Avatar"
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <MessageCircle size={16} />
                      )}
                    </div>
                    <div className="message-bubble typing-indicator">
                      <div className="typing-dots">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input" onSubmit={handleSubmit}>
              <div className="chat-input-container">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={dynamicConfig?.inputPlaceholder || 'Type your message...'}
                  disabled={isLoading || isFirstMessageLoading}
                />
                <button type="submit" disabled={isLoading || isFirstMessageLoading || !inputValue.trim()}>
                  <Send size={16} />
                </button>
              </div>
              <div className="powered-by">
                ⚡ Powered by RankVed
              </div>
            </form>
          </div>
        )}
        </div>
      )}
    </>
  );
};

export default ChatbotEmbed; 