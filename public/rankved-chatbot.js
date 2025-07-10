(function() {
  'use strict';
  
  // Prevent multiple initializations
  if (window.RankVedChatbot) return;
  
  // Configuration - get from window or use defaults
  const config = window.CHATBOT_CONFIG || {};
  const chatbotId = config.chatbotId || 'demo';
  const apiUrl = config.apiUrl || window.location.origin;
  
  console.log('RankVed Config:', config);
  
  // State
  let isOpen = false;
  let bubble = null;
  let chatWindow = null;
  let messages = [];
  
  // Create chat bubble with proper styling
  function createChatBubble() {
    const bubble = document.createElement('div');
    bubble.id = 'rankved-chat-bubble';
    bubble.className = 'rankved-chat-bubble';
    
    // Inject CSS styles
    const style = document.createElement('style');
    style.textContent = `
      .rankved-chat-bubble {
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        width: 60px !important;
        height: 60px !important;
        border-radius: 50% !important;
        background: #007bff !important;
        box-shadow: 0 4px 12px rgba(0,123,255,0.4) !important;
        cursor: pointer !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.3s ease !important;
        border: none !important;
        outline: none !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      
      .rankved-chat-bubble:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 6px 20px rgba(0,123,255,0.6) !important;
      }
      
      .rankved-chat-bubble svg {
        width: 24px !important;
        height: 24px !important;
        fill: white !important;
      }
      
      .rankved-chat-window {
        position: fixed !important;
        bottom: 90px !important;
        right: 20px !important;
        width: 380px !important;
        height: 600px !important;
        max-height: 80vh !important;
        border-radius: 16px !important;
        background: white !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
        z-index: 2147483646 !important;
        display: none !important;
        flex-direction: column !important;
        overflow: hidden !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        border: 1px solid #e1e5e9 !important;
      }
      
      .rankved-chat-header {
        background: #007bff !important;
        color: white !important;
        padding: 20px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
      }
      
      .rankved-chat-header h3 {
        margin: 0 !important;
        font-size: 16px !important;
        font-weight: 600 !important;
      }
      
      .rankved-close-btn {
        background: none !important;
        border: none !important;
        color: white !important;
        font-size: 24px !important;
        cursor: pointer !important;
        padding: 0 !important;
        width: 30px !important;
        height: 30px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 4px !important;
      }
      
      .rankved-close-btn:hover {
        background: rgba(255,255,255,0.1) !important;
      }
      
      .rankved-messages {
        flex: 1 !important;
        overflow-y: auto !important;
        padding: 20px !important;
        background: #f8f9fa !important;
      }
      
      .rankved-message {
        margin-bottom: 16px !important;
        display: flex !important;
      }
      
      .rankved-message.user {
        justify-content: flex-end !important;
      }
      
      .rankved-message.bot {
        justify-content: flex-start !important;
      }
      
      .rankved-message-content {
        max-width: 80% !important;
        padding: 12px 16px !important;
        border-radius: 18px !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        word-wrap: break-word !important;
      }
      
      .rankved-message.user .rankved-message-content {
        background: #007bff !important;
        color: white !important;
      }
      
      .rankved-message.bot .rankved-message-content {
        background: white !important;
        color: #333 !important;
        border: 1px solid #e1e5e9 !important;
      }
      
      .rankved-input-area {
        padding: 20px !important;
        border-top: 1px solid #e1e5e9 !important;
        background: white !important;
      }
      
      .rankved-input-container {
        display: flex !important;
        gap: 8px !important;
        align-items: flex-end !important;
      }
      
      .rankved-input {
        flex: 1 !important;
        border: 1px solid #e1e5e9 !important;
        border-radius: 25px !important;
        padding: 12px 16px !important;
        font-size: 14px !important;
        outline: none !important;
        resize: none !important;
        max-height: 100px !important;
        min-height: 20px !important;
        font-family: inherit !important;
      }
      
      .rankved-input:focus {
        border-color: #007bff !important;
      }
      
      .rankved-send-btn {
        width: 44px !important;
        height: 44px !important;
        border-radius: 50% !important;
        background: #007bff !important;
        border: none !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-shrink: 0 !important;
      }
      
      .rankved-send-btn:hover {
        background: #0056b3 !important;
      }
      
      .rankved-send-btn svg {
        width: 20px !important;
        height: 20px !important;
        fill: white !important;
      }
      
      .rankved-powered-by {
        text-align: center !important;
        padding: 8px !important;
        font-size: 11px !important;
        color: #666 !important;
        background: #f8f9fa !important;
      }
      
      .rankved-powered-by a {
        color: #007bff !important;
        text-decoration: none !important;
      }
      
      @media (max-width: 480px) {
        .rankved-chat-window {
          width: calc(100vw - 40px) !important;
          height: calc(100vh - 120px) !important;
          bottom: 80px !important;
          right: 20px !important;
          left: 20px !important;
        }
        
        .rankved-chat-bubble {
          bottom: 15px !important;
          right: 15px !important;
          width: 55px !important;
          height: 55px !important;
        }
      }
    `;
    
    if (!document.querySelector('#rankved-chat-styles')) {
      style.id = 'rankved-chat-styles';
      document.head.appendChild(style);
    }
    
    // Chat icon
    bubble.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
    `;
    
    bubble.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleChat();
    });
    
    return bubble;
  }
  
  // Create chat window
  function createChatWindow() {
    const window = document.createElement('div');
    window.id = 'rankved-chat-window';
    window.className = 'rankved-chat-window';
    
    window.innerHTML = `
      <div class="rankved-chat-header">
        <h3>${config.name || 'Support Chat'}</h3>
        <button class="rankved-close-btn" onclick="window.RankVedChatbot.close()">×</button>
      </div>
      <div class="rankved-messages" id="rankved-messages">
        <div class="rankved-message bot">
          <div class="rankved-message-content">
            ${config.welcomeMessage || 'Hello! How can I help you today?'}
          </div>
        </div>
      </div>
      <div class="rankved-input-area">
        <div class="rankved-input-container">
          <textarea 
            class="rankved-input" 
            id="rankved-input"
            placeholder="${config.placeholder || 'Type your message...'}"
            rows="1"
          ></textarea>
          <button class="rankved-send-btn" onclick="window.RankVedChatbot.sendMessage()">
            <svg viewBox="0 0 24 24">
              <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
            </svg>
          </button>
        </div>
        <div class="rankved-powered-by">
          Powered by <a href="${config.poweredByLink || 'https://rankved.com'}" target="_blank">RankVed</a>
        </div>
      </div>
    `;
    
    return window;
  }
  
  // Toggle chat window
  function toggleChat() {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }
  
  // Open chat
  function openChat() {
    if (!chatWindow || !bubble) return;
    
    isOpen = true;
    chatWindow.style.display = 'flex';
    bubble.style.display = 'none';
    
    // Focus input
    setTimeout(() => {
      const input = document.getElementById('rankved-input');
      if (input) input.focus();
    }, 100);
  }
  
  // Close chat
  function closeChat() {
    if (!chatWindow || !bubble) return;
    
    isOpen = false;
    chatWindow.style.display = 'none';
    bubble.style.display = 'flex';
  }
  
  // Add message to chat
  function addMessage(content, sender) {
    const messagesContainer = document.getElementById('rankved-messages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `rankved-message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'rankved-message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    messages.push({ content, sender, timestamp: new Date() });
  }
  
  // Send message
  function sendMessage() {
    const input = document.getElementById('rankved-input');
    if (!input || !input.value.trim()) return;
    
    const message = input.value.trim();
    addMessage(message, 'user');
    input.value = '';
    
    // Auto-resize textarea
    input.style.height = 'auto';
    
    // Show typing indicator briefly then respond
    setTimeout(() => {
      addMessage('Thank you for your message! Our team will get back to you soon.', 'bot');
    }, 800);
  }
  
  // Handle Enter key
  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }
  
  // Auto-resize textarea
  function autoResize() {
    const input = document.getElementById('rankved-input');
    if (input) {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    }
  }
  
  // Initialize chatbot
  function init() {
    // Remove existing elements
    const existing = document.querySelectorAll('#rankved-chat-bubble, #rankved-chat-window, #rankved-chat-styles');
    existing.forEach(el => el.remove());
    
    // Create elements
    bubble = createChatBubble();
    chatWindow = createChatWindow();
    
    // Add to DOM
    document.body.appendChild(bubble);
    document.body.appendChild(chatWindow);
    
    // Setup input handlers
    const input = document.getElementById('rankved-input');
    if (input) {
      input.addEventListener('keypress', handleKeyPress);
      input.addEventListener('input', autoResize);
    }
    
    console.log('RankVed Chatbot initialized successfully');
  }
  
  // Public API
  window.RankVedChatbot = {
    open: openChat,
    close: closeChat,
    toggle: toggleChat,
    sendMessage: sendMessage,
    addMessage: addMessage,
    isOpen: () => isOpen
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();