import { Bot, Send, MessageSquare, Sparkles, Zap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import './chat-preview.css';

interface ChatPreviewProps {
  chatbot?: any; // Accepts Chatbot or preview object with appearance props
}

export function ChatPreview({ chatbot }: ChatPreviewProps) {
  const primaryColor = chatbot?.primaryColor || chatbot?.primary_color || '#6366F1';
  const title = chatbot?.chatWidgetName || chatbot?.name || 'Support Bot';
  const welcomeMessage = chatbot?.welcomeMessage || 'Hello! How can I help you today?';

  // Modern styling props (support both camelCase and snake_case for preview objects)
  const chatWindowStyle = chatbot?.chatWindowStyle || chatbot?.chat_window_style || 'modern';
  const chatWindowTheme = chatbot?.chatWindowTheme || chatbot?.chat_window_theme || 'light';
  const borderRadius = chatbot?.borderRadius ?? chatbot?.border_radius ?? 16;
  const shadowStyle = chatbot?.shadowStyle || chatbot?.shadow_style || 'soft';
  const inputPlaceholder = chatbot?.inputPlaceholder || chatbot?.input_placeholder || 'Type your message...';

  // Enhanced appearance calculation matching chat-embed.js
  const getAppearance = () => {
    const theme = chatWindowTheme;
    const shadowStyleValue = shadowStyle;
    const chatWindowStyleValue = chatWindowStyle;
    let primaryColorValue = primaryColor;
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(primaryColorValue)) primaryColorValue = '#6366F1';
    
    // Enhanced background colors based on theme and style
    let backgroundColor = theme === 'dark'
      ? 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)';
    
    // Style-specific backgrounds
    if (chatWindowStyleValue === 'modern') {
      backgroundColor = theme === 'dark'
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)'
        : 'linear-gradient(135deg, rgb(252 243 255 / 90%) 0%, rgb(229 242 255 / 80%) 100%)';
    } else if (chatWindowStyleValue === 'classic') {
      backgroundColor = theme === 'dark' ? '#1e293b' : '#ffffff';
    } else if (chatWindowStyleValue === 'minimal') {
      backgroundColor = theme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    } else if (chatWindowStyleValue === 'floating') {
      backgroundColor = theme === 'dark' ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)';
    }
    
    // Enhanced shadow styles
    let boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
    if (shadowStyleValue === 'none') boxShadow = 'none';
    else if (shadowStyleValue === 'soft') boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
    else if (shadowStyleValue === 'medium') boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    else if (shadowStyleValue === 'strong') boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
    
    const textColor = theme === 'dark' ? '#fff' : '#333';
    const headerBg = primaryColorValue;
    const headerText = '#fff';
    
    // Enhanced input backgrounds
    let inputBg = theme === 'dark' 
      ? 'linear-gradient(250deg, #0e1a50 0%, #18181b 100%)'
      : 'linear-gradient(170deg, #e7ebff -1%, #c7c5ff 100%)';
    
    if (chatWindowStyleValue === 'minimal') {
      inputBg = theme === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)';
    } else if (chatWindowStyleValue === 'floating') {
      inputBg = theme === 'dark' ? 'rgba(51, 65, 85, 0.9)' : 'rgba(255, 255, 255, 0.95)';
    }
    
    const inputText = theme === 'dark' ? '#fff' : '#333';
    const inputBorder = theme === 'dark' ? '#6a739f' : '#d7adec';
    
    // Enhanced message backgrounds
    let msgBg = theme === 'dark' ? '#23232a' : '#fff';
    if (chatWindowStyleValue === 'minimal') {
      msgBg = theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(255, 255, 255, 0.8)';
    } else if (chatWindowStyleValue === 'floating') {
      msgBg = theme === 'dark' ? 'rgba(51, 65, 85, 0.7)' : 'rgba(255, 255, 255, 0.9)';
    }
    
    const msgText = theme === 'dark' ? '#fff' : '#333';
    const userMsgBg = primaryColorValue;
    const userMsgText = '#fff';

    return {
      theme, borderRadius, shadowStyle: shadowStyleValue, primaryColor: primaryColorValue, 
      backgroundColor, boxShadow, textColor, headerBg, headerText, inputBg, inputText, 
      inputBorder, msgBg, msgText, userMsgBg, userMsgText, chatWindowStyle: chatWindowStyleValue
    };
  };

  const appearance = getAppearance();

  // Theme-based classes
  const isDark = appearance.theme === 'dark';

  return (
    <div className="relative border-2 border-slate-200 rounded-2xl p-4 bg-gradient-to-br from-blue-50/60 via-white/80 to-blue-100/60 flex justify-center items-center min-h-[480px] shadow-xl overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full blur-2xl"></div>
      </div>

      {/* Enhanced Chat Window with Data Attributes */}
      <div
        className="w-full max-w-sm mx-auto border transition-all duration-300 backdrop-blur-md relative z-10 rankved-chat-preview"
        style={{ 
          borderRadius: appearance.borderRadius, 
          background: appearance.backgroundColor,
          boxShadow: appearance.boxShadow,
          border: `1px solid ${appearance.inputBorder}`
        }}
        data-rankved-widget="true"
        data-theme={appearance.theme}
        data-style={appearance.chatWindowStyle}
        data-shadow={appearance.shadowStyle}
      >
        {/* Enhanced Chat Header */}
        <div
          className="p-4 rounded-t-2xl flex items-center justify-between shadow-md relative overflow-hidden"
          style={{ 
            backgroundColor: appearance.headerBg, 
            borderTopLeftRadius: appearance.borderRadius, 
            borderTopRightRadius: appearance.borderRadius 
          }}
        >
          {/* Header Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-full blur-xl"></div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Avatar className="h-9 w-9 border-2 border-white/30 shadow-lg backdrop-blur-sm">
              <AvatarImage src={chatbot?.chatWidgetIcon || chatbot?.chatWindowAvatar || undefined} />
              <AvatarFallback className="bg-white/20 backdrop-blur-sm">
                <Bot className="h-5 w-5 text-white" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base truncate drop-shadow-sm text-white">{title}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs opacity-90 text-green-100">Online</span>
                </div>
                <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button 
            id="rankved-close-btn"
            className="relative z-10 text-white/80 hover:text-white text-2xl font-light transition-all duration-200 hover:scale-110 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
            style={{ fontSize: '24px' }}
          >
            ×
          </button>
        </div>

        {/* Enhanced Chat Messages */}
        <div 
          id="rankved-messages"
          className="p-4 space-y-4 h-64 overflow-y-auto scrollbar-none relative"
          style={{ 
            background: appearance.backgroundColor,
            borderBottomLeftRadius: appearance.borderRadius, 
            borderBottomRightRadius: appearance.borderRadius 
          }}
        >
          {/* Welcome Message */}
          <div className="flex space-x-3 items-start animate-in slide-in-from-left duration-300">
            <Avatar className="h-7 w-7 flex-shrink-0 border-2 border-white/20 shadow-sm">
              <AvatarImage src={chatbot?.chatWindowAvatar || chatbot?.chatWidgetIcon || undefined} />
              <AvatarFallback style={{ backgroundColor: appearance.primaryColor }}>
                <Bot className="h-4 w-4 text-white" />
              </AvatarFallback>
            </Avatar>
            <div 
              className="p-3 rounded-2xl text-sm shadow-lg max-w-[80%] backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{ 
                background: appearance.msgBg, 
                color: appearance.msgText,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              {welcomeMessage}
            </div>
          </div>

          {/* User Message */}
          <div className="flex justify-end animate-in slide-in-from-right duration-300 delay-200">
            <div
              className="p-3 rounded-2xl text-sm max-w-[80%] shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{ 
                backgroundColor: appearance.userMsgBg, 
                color: appearance.userMsgText,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              I need help with my account
            </div>
          </div>

          {/* Bot Response */}
          <div className="flex space-x-3 items-start animate-in slide-in-from-left duration-300 delay-400">
            <Avatar className="h-7 w-7 flex-shrink-0 border-2 border-white/20 shadow-sm">
              <AvatarImage src={chatbot?.chatWindowAvatar || chatbot?.chatWidgetIcon || undefined} />
              <AvatarFallback style={{ backgroundColor: appearance.primaryColor }}>
                <Bot className="h-4 w-4 text-white" />
              </AvatarFallback>
            </Avatar>
            <div 
              className="p-3 rounded-2xl text-sm shadow-lg max-w-[80%] backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{ 
                background: appearance.msgBg, 
                color: appearance.msgText,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              I'd be happy to help! What specific issue are you experiencing?
            </div>
          </div>

          {/* Typing Indicator */}
          <div className="flex space-x-3 items-start animate-in slide-in-from-left duration-300 delay-600">
            <Avatar className="h-7 w-7 flex-shrink-0 border-2 border-white/20 shadow-sm">
              <AvatarImage src={chatbot?.chatWindowAvatar || chatbot?.chatWidgetIcon || undefined} />
              <AvatarFallback style={{ backgroundColor: appearance.primaryColor }}>
                <Bot className="h-4 w-4 text-white" />
              </AvatarFallback>
            </Avatar>
            <div 
              className="p-3 rounded-2xl text-sm shadow-lg max-w-[80%] backdrop-blur-sm"
              style={{ 
                background: appearance.msgBg, 
                color: appearance.msgText,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <div className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce"></span>
                <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Chat Input */}
        <div 
          className="p-2 border-t bg-transparent relative overflow-hidden"
          style={{ 
            borderBottomLeftRadius: appearance.borderRadius, 
            borderBottomRightRadius: appearance.borderRadius, 
            borderTop: `2px solid ${appearance.inputBorder}`,
            background: appearance.inputBg,
            boxShadow: isDark ? '0 2px 8px rgba(30,41,59,0.12)' : '0 2px 8px rgba(100,116,139,0.08)'
          }}
        >
          {/* Input Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-400 to-purple-600 rounded-full blur-2xl"></div>
          </div>

          <div className="flex space-x-2 relative z-10">
            <Input
              id="rankved-input"
              placeholder={inputPlaceholder}
              className="flex-1 text-sm h-10 rounded-xl shadow-inner border-0 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:scale-105"
              style={{
                background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                color: appearance.inputText,
                border: `1px solid ${appearance.inputBorder}`
              }}
              disabled
            />
            <Button 
              id="rankved-send-btn"
              size="sm" 
              className="rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 active:scale-95" 
              style={{ backgroundColor: appearance.primaryColor }}
              disabled
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>



          {/* Enhanced Footer */}
          <div className="mt-1 text-center relative z-10">
            {chatbot?.poweredByText ? (
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} transition-all duration-200 hover:-translate-y-1`}>
                {chatbot.poweredByText}
              </span>
            ) : (
              <div className="flex items-center justify-center gap-1">
                <Zap className="h-3 w-3 text-slate-400" />
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} transition-all duration-200 hover:-translate-y-1`}>
                  Powered by <span className="font-medium" style={{ color: appearance.primaryColor }}>RankVed</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Elements for Enhanced Visual Appeal */}
      <div className="absolute top-4 right-4 z-5">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
      </div>
      <div className="absolute bottom-4 left-4 z-5">
        <div className="w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
      </div>
    </div>
  );
}
