import { Bot } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import './chat-preview.css';

interface ChatPreviewProps {
  chatbot?: any; // Accepts Chatbot or preview object with appearance props
}

export function ChatPreview({ chatbot }: ChatPreviewProps) {
  const primaryColor = chatbot?.primaryColor || chatbot?.primary_color || '#6366F1';
  const title = chatbot?.title || chatbot?.chatWidgetName || chatbot?.name || 'Support Bot';
  const welcomeMessage = chatbot?.welcomeMessage || 'Hello! How can I help you today?';
  const inputPlaceholder = chatbot?.inputPlaceholder || chatbot?.input_placeholder || 'Type your message...';
  const borderRadius = chatbot?.borderRadius ?? chatbot?.border_radius ?? 16;
  const shadowStyle = chatbot?.shadowStyle || chatbot?.shadow_style || 'soft';
  const chatWindowStyle = chatbot?.chatWindowStyle || chatbot?.chat_window_style || 'modern';
  const chatWindowTheme = chatbot?.chatWindowTheme || chatbot?.chat_window_theme || 'light';

  // Helper to map shadowStyle to boxShadow
  function getBoxShadow(shadowStyle: string) {
    switch (shadowStyle) {
      case 'none': return 'none';
      case 'soft': return '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
      case 'medium': return '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      case 'strong': return '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)';
      default: return '0 8px 32px rgba(0,0,0,0.10)';
    }
  }

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
    const boxShadow = getBoxShadow(shadowStyleValue);
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

  // Set background gradient based on theme
  const previewBg = isDark
    ? 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)';

  return (
    <div className="relative border-0 rounded-3xl p-0 flex justify-center items-center min-h-[480px] shadow-xl overflow-hidden" style={{ background: previewBg, borderRadius: borderRadius, }}>
      {/* Chat Window */}
      <div
        className="w-full max-w-md mx-auto relative z-10"
        style={{
          
          background: 'white',
          boxShadow: appearance.boxShadow,
          border: 'none',
          minHeight: 480
        }}
        data-rankved-widget="true"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 rounded-t-3xl"
          style={{
            background: appearance.primaryColor,
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
            color: '#fff',
            minHeight: 56
          }}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white/30 shadow-lg">
              <AvatarImage src={chatbot?.chatWidgetIcon || chatbot?.chatWindowAvatar || undefined} />
              <AvatarFallback className="bg-white/20">
                <Bot className="h-5 w-5 text-white" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-lg leading-tight text-white">{title}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs text-white/80">Online</span>
              </div>
            </div>
          </div>
          <button className="text-white/80 hover:text-white text-2xl font-light transition-all duration-200 hover:scale-110 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center" style={{ fontSize: '24px' }} tabIndex={-1} aria-hidden="true">×</button>
        </div>

        {/* Messages */}
        <div className="px-4 pt-6 pb-2 space-y-6 min-h-[320px] max-h-[400px] overflow-y-auto" style={{background: 'transparent'}}>
          {/* Bot Welcome Message */}
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 border-2 border-white/20 shadow-sm">
              <AvatarImage src={chatbot?.chatWindowAvatar || chatbot?.chatWidgetIcon || undefined} />
              <AvatarFallback style={{ backgroundColor: appearance.primaryColor }}>
                <Bot className="h-4 w-4 text-white" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-gray-50 rounded-2xl shadow p-3 text-[15px] leading-snug text-gray-800 max-w-[90%]"
              style={{
                fontWeight: 500,
               
                borderBottomLeftRadius: 0
              }}>
              {welcomeMessage}
            </div>
          </div>
          {/* Follow-up Buttons */}
          <div className="flex flex-wrap gap-2 pl-12">
            <button
              className="px-4 py-1 rounded-full text-sm font-medium shadow transition"
              style={{
                background: chatbot?.secondaryColor || '#A7C7E7',
                color: '#1e293b',
                border: 'none'
              }}
            >Academic Programs</button>
            <button
              className="px-4 py-1 rounded-full text-sm font-medium shadow transition"
              style={{
                background: chatbot?.secondaryColor || '#A7C7E7',
                color: '#1e293b',
                border: 'none'
              }}
            >Student Life</button>
            <button
              className="px-4 py-1 rounded-full text-sm font-medium shadow transition"
              style={{
                background: chatbot?.secondaryColor || '#A7C7E7',
                color: '#1e293b',
                border: 'none'
              }}
            >Contact Support</button>
            <button
              className="px-4 py-1 rounded-full border text-sm font-medium shadow transition flex items-center gap-1"
              style={{
                color: appearance.primaryColor,
                background: '#fff',
                border: `1.5px solid ${chatbot?.secondaryColor || '#A7C7E7'}`
              }}
            ><span>Explore EduExpress</span> <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg></button>
          </div>
          {/* CTA Button */}

          {/* Second Bot Message */}
          <div className="flex items-start gap-3">
           
            {/* You can add more preview messages here if needed, using chatbot data */}
          </div>
          {/* Demo user message bubble */}
          <div className="flex items-start gap-3 mt-4 justify-end">
            <div className=" text-white rounded-2xl shadow p-3 text-[15px] max-w-[80%]"
              style={{
                fontWeight: 500,
               backgroundColor: appearance.primaryColor,
                borderBottomRightRadius: 0
              }}>
              Hi! Can you tell me about admission requirements?
            </div>
           
          </div>
        </div>
        {/* Input Bar */}
        <div className="px-4 pb-4 pt-2">
          <div className="flex items-center bg-white rounded-full border border-blue-100 shadow px-4 py-2"
            style={{ borderRadius: borderRadius, boxShadow: appearance.boxShadow }}
          >
            <input
              className="flex-1 bg-transparent outline-none border-none text-[15px] placeholder-gray-400"
              placeholder={inputPlaceholder}
              disabled
              style={{ borderRadius: borderRadius }}
            />
            <button className="ml-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow transition">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/></svg>
            </button>
          </div>
        </div>
        {/* Powered by */}
        <div className="w-full text-center pb-2 pt-0">
          <span className="text-xs text-blue-400">Powered by <a href="https://rankved.com" className="underline font-medium" target="_blank" rel="noopener noreferrer">RankVed</a></span>
        </div>
      </div>
    </div>
  );
}
