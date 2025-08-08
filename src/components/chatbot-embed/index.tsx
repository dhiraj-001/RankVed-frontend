import { createRoot } from 'react-dom/client';
import ChatbotEmbed from './ChatbotEmbed';

interface ChatbotInitOptions {
  container: HTMLElement;
  config: any;
  domain: string;
  referer: string;
}

// Create Shadow DOM and render React app
function createChatbotInShadowDOM(options: ChatbotInitOptions) {
  const { container, config, domain, referer } = options;
  
  // Create shadow root
  const shadowRoot = container.attachShadow({ mode: 'closed' });
  
  // Create a wrapper div inside shadow DOM
  const wrapper = document.createElement('div');
  wrapper.id = 'rankved-chatbot-shadow-wrapper';
  shadowRoot.appendChild(wrapper);
  
  // Create React root and render
  const root = createRoot(wrapper);
  root.render(
    <ChatbotEmbed 
      config={config} 
      domain={domain} 
      referer={referer} 
    />
  );
  
  return {
    destroy: () => {
      root.unmount();
      shadowRoot.removeChild(wrapper);
    }
  };
}

// Global chatbot object
const RankVedChatbot = {
  init: createChatbotInShadowDOM,
  
  // Utility functions
  destroy: (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container && container.shadowRoot) {
      const wrapper = container.shadowRoot.getElementById('rankved-chatbot-shadow-wrapper');
      if (wrapper) {
        // This would need to be handled by storing the destroy function
        console.log('Chatbot destroyed');
      }
    }
  },
  
  // Configuration validation
  validateConfig: (config: any) => {
    const required = ['chatbotId', 'apiUrl'];
    const missing = required.filter(field => !config[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
    
    return true;
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  (window as any).RankVedChatbot = RankVedChatbot;
  console.log('🔧 RankVedChatbot exposed globally:', RankVedChatbot);
  console.log('🔧 Available methods:', Object.keys(RankVedChatbot));
  console.log('🔧 RankVedChatbot.init type:', typeof RankVedChatbot.init);
  console.log('🔧 RankVedChatbot.init function:', RankVedChatbot.init);
}

export default RankVedChatbot; 