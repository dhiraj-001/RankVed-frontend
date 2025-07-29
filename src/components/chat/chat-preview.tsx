import {  MessageCircle } from 'lucide-react';
import './chat-preview.css';

interface ChatPreviewProps {
  chatbot?: any; // Accepts Chatbot or preview object with appearance props
}

export function ChatPreview({ chatbot }: ChatPreviewProps) {
  // Real-time appearance properties
  const primaryColor = chatbot?.primaryColor || '#6366F1';
  const secondaryColor = chatbot?.secondaryColor || '#797cf6d4';
  const title = chatbot?.chatWidgetName || chatbot?.name || 'Support Bot';
  const welcomeMessage = chatbot?.welcomeMessage || 'Hello! How can I help you today?';
  const inputPlaceholder = chatbot?.inputPlaceholder || 'Type your message...';
  const borderRadius = chatbot?.borderRadius || 16;
  const shadowStyle = chatbot?.shadowStyle || 'soft';
  const chatWindowTheme = chatbot?.chatWindowTheme || 'light';
  const chatWindowAvatar = chatbot?.chatWindowAvatar;
  const chatWidgetIcon = chatbot?.chatWidgetIcon;
  const suggestionButtons = Array.isArray(chatbot?.suggestionButtons) ? chatbot.suggestionButtons : [];
  const poweredByText = chatbot?.poweredByText || 'Powered by RankVed';
  
  // Demo CTA button for preview
  const demoCtaButton = {
    text: 'Explore EduExpress',
    link: 'https://example.com'
  };

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
    let primaryColorValue = primaryColor;
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(primaryColorValue)) primaryColorValue = '#6366F1';
    
    // Background colors based on theme
    const backgroundColor = theme === 'dark' ? '#1f2937' : '#fafafa';
    const boxShadow = getBoxShadow(shadowStyleValue);
    const textColor = theme === 'dark' ? '#f9fafb' : '#374151';
    const headerBg = primaryColorValue;
    const headerText = '#fff';
    
    // Input styling
    const inputBg = theme === 'dark' ? '#374151' : 'white';
    const inputText = theme === 'dark' ? '#f9fafb' : '#374151';
    const inputBorder = theme === 'dark' ? '#4b5563' : '#e5e7eb';
    
    // Message styling
    const msgBg = theme === 'dark' ? '#374151' : '#ededed';
    const msgText = theme === 'dark' ? '#f9fafb' : '#374151';
    const userMsgBg = primaryColorValue;
    const userMsgText = '#fff';
    
    return {
      theme, borderRadius, shadowStyle: shadowStyleValue, primaryColor: primaryColorValue, 
      backgroundColor, boxShadow, textColor, headerBg, headerText, inputBg, inputText, 
      inputBorder, msgBg, msgText, userMsgBg, userMsgText
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
    <div className="relative border-0 rounded-3xl p-0 flex justify-center items-center min-h-[600px] shadow-xl overflow-hidden" style={{ background: previewBg, borderRadius: borderRadius }}>
      {/* Chat Window - Matching ChatbotEmbed.tsx */}
      <div
        className="w-full max-w-md mx-auto relative z-10"
        style={{
          background: appearance.backgroundColor,
          boxShadow: appearance.boxShadow,
          border: 'none',
          borderRadius: `${borderRadius}px`,
          minHeight: 600,
          maxHeight: 600,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
        }}
        data-rankved-widget="true"
      >
        {/* Header - Matching ChatbotEmbed.tsx */}
        <div
          className="flex items-center justify-between px-5 py-5"
          style={{
            background: appearance.primaryColor,
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
            color: '#fff',
            minHeight: 80,
            fontWeight: 500,
            letterSpacing: '0.02em',
            padding: '20px'
          }}
        >
          <div className="flex items-center gap-2">
            {chatWidgetIcon ? (
              <img
                src={chatWidgetIcon}
                alt="Widget Icon"
                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : chatWindowAvatar ? (
              <img
                src={chatWindowAvatar}
                alt="Avatar"
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
              />
            ) : null}
            <span style={{ fontWeight: '600' }}>{title}</span>
              </div>
          <div className="flex items-center gap-2">
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages - Matching ChatbotEmbed.tsx */}
        <div 
          className="flex-1 overflow-y-auto"
          style={{
            background: appearance.backgroundColor,
            minHeight: 300,
            maxHeight: 'none',
            padding: '20px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {/* Bot Welcome Message */}
          <div className="flex items-start gap-2 mb-2">
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: appearance.primaryColor,
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                flexShrink: 0
              }}
            >
              {chatWindowAvatar ? (
                <img
                  src={chatWindowAvatar}
                  alt="Bot Avatar"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <MessageCircle size={16} />
              )}
            </div>
            <div 
              className="max-w-[80%] px-4 py-3 rounded-2xl"
              style={{
                background: appearance.msgBg,
                color: appearance.msgText,
                borderRadius: '18px 18px 18px 4px',
                boxShadow: '2px 2px 2px 0px #f0f0f02b',
                fontSize: '12px',
                fontWeight: '400',
                lineHeight: '1.2',
                letterSpacing: '0.01em',
                wordWrap: 'break-word',
                position: 'relative'
              }}
            >
              {welcomeMessage}
            </div>
          </div>

          {/* Follow-up Buttons - Matching ChatbotEmbed.tsx */}
          {Array.isArray(suggestionButtons) && suggestionButtons.length > 0 && (
            <div className="flex flex-wrap gap-2 ml-12 mb-2" style={{ marginTop: '12px', marginBottom: '8px' }}>
              {suggestionButtons.slice(0, 3).map((button: string, index: number) => (
            <button
                  key={index}
                  className="rounded-full transition-all duration-200"
                  style={{
                    background: secondaryColor,
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    minHeight: '24px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px 10px'
                  }}
                >
                  {button}
                </button>
              ))}
            </div>
          )}

          {/* CTA Button - Matching ChatbotEmbed.tsx */}
          <div className="flex flex-wrap gap-2 ml-12 mb-2" style={{ marginTop: '5px', marginBottom: '8px' }}>
            <a
              href={demoCtaButton.link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full transition-all duration-200 flex items-center gap-1"
              style={{
                background: 'white',
                color: primaryColor,
                border: `2px solid ${secondaryColor}`,
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                minHeight: '20px',
                padding: '2px 8px'
              }}
            >
              {demoCtaButton.text}
              <span style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '4px' }}>↗</span>
            </a>
          </div>

          {/* Demo user message bubble */}
          <div className="flex items-end gap-2 justify-end mb-2">
            <div 
              className="max-w-[75%] px-4 py-3 rounded-2xl"
              style={{
                background: appearance.userMsgBg,
                color: appearance.userMsgText,
                borderRadius: '18px 18px 4px 18px',
                marginLeft: 'auto',
                fontSize: '12px',
                fontWeight: '400',
                lineHeight: '1.2',
                letterSpacing: '0.01em',
                wordWrap: 'break-word',
                position: 'relative'
              }}
            >
              Hi! Can you tell me about admission requirements?
            </div>
          </div>

          {/* Second Bot Message with Follow-up and CTA */}
          <div className="flex items-start gap-2 mb-2">
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: appearance.primaryColor,
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                flexShrink: 0
              }}
            >
              {chatWindowAvatar ? (
                <img
                  src={chatWindowAvatar}
                  alt="Bot Avatar"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <MessageCircle size={16} />
              )}
            </div>
            <div 
              className="max-w-[80%] px-4 py-3 rounded-2xl"
              style={{
                background: appearance.msgBg,
                color: appearance.msgText,
                borderRadius: '18px 18px 18px 4px',
                boxShadow: '2px 2px 2px 0px #f0f0f02b',
                fontSize: '12px',
                fontWeight: '400',
                lineHeight: '1.2',
                letterSpacing: '0.01em',
                wordWrap: 'break-word',
                position: 'relative'
              }}
            >
              Sure! Here are the admission requirements for our programs. You'll need to submit your transcripts, letters of recommendation, and complete an application form.
            </div>
          </div>

          {/* Follow-up Buttons for Second Message */}
          <div className="flex flex-wrap gap-2 ml-12 mb-2" style={{ marginTop: '12px', marginBottom: '8px' }}>
            <button
              className="rounded-full transition-all duration-200"
              style={{
                background: secondaryColor,
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                minHeight: '24px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 10px'
              }}
            >
              Application Process
            </button>
            <button
              className="rounded-full transition-all duration-200"
              style={{
                background: secondaryColor,
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                minHeight: '24px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 10px'
              }}
            >
              Deadlines
            </button>
            <button
              className="rounded-full transition-all duration-200"
              style={{
                background: secondaryColor,
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                minHeight: '24px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 10px'
              }}
            >
              Financial Aid
            </button>
          </div>

          {/* CTA Button for Second Message */}
          <div className="flex flex-wrap gap-2 ml-12 mb-2" style={{ marginTop: '5px', marginBottom: '8px' }}>
            <a
              href="#"
              className="rounded-full transition-all duration-200 flex items-center gap-1"
              style={{
                background: 'white',
                color: primaryColor,
                border: `2px solid ${secondaryColor}`,
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                minHeight: '20px',
                padding: '2px 8px'
              }}
            >
              Apply Now
              <span style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '4px' }}>↗</span>
            </a>
          </div>
        </div>

        {/* Input Bar - Matching ChatbotEmbed.tsx */}
        <div className="px-5 pb-3 pt-0" style={{ padding: '0px 20px 10px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'transparent', position: 'relative' }}>
          <div className="relative w-full flex items-center mb-1" style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
            <input
              className="w-full border rounded-full outline-none"
              placeholder={inputPlaceholder}
              disabled
              style={{
                width: '100%',
                padding: '12px 50px 12px 16px',
                border: `1px solid ${appearance.inputBorder}`,
                borderRadius: '25px',
                outline: 'none',
                fontSize: '13px',
                background: appearance.inputBg,
                color: appearance.inputText,
                boxShadow: '0 4px 6px -3px rgb(0 0 0 / 10%)'
              }}
            />
            <button 
              className="absolute right-2 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '38px',
                height: '38px',
                background: appearance.primaryColor,
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
          {/* Powered by */}
          <div className="text-center" style={{ marginTop: '3px' }}>
            <span 
              className="text-xs"
              style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}
            >
              {poweredByText}
            </span>
        </div>
        </div>
      </div>
    </div>
  );
}
