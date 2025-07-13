import React from 'react';

const ChatWidget = ({ chatbotId }) => {
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'http://localhost:5173/chat-embed.js';
    script.onload = function() {
      window.ChatBotPro.init({ chatbotId });
    };
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'http://localhost:5173/chat-embed.css';
    document.head.appendChild(link);

    return () => {
      script.remove();
      link.remove();
    };
  }, [chatbotId]);

  return null;
};

export default ChatWidget;

// Usage:
// <ChatWidget chatbotId="acdd623b-1bb6-416c-8e66-a0ac5a659fa7" />
