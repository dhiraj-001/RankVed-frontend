import React from 'react';

const ChatWidget = ({ chatbotId }) => {
  React.useEffect(() => {
    // Set the chatbot configuration
    window.RankVedChatbotConfig = {
      chatbotId: chatbotId
    };

    // Load the chatbot loader script
    const script = document.createElement('script');
    script.src = '/chatbot-loader.js';
    script.onload = function() {
      console.log('✅ Chatbot loader loaded for ID:', chatbotId);
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
      // Clean up the global config
      delete window.RankVedChatbotConfig;
    };
  }, [chatbotId]);

  return null;
};

export default ChatWidget;

// Usage:
// <ChatWidget chatbotId="69e4c724-2aa1-447c-8d4b-52812d77ba08" />
