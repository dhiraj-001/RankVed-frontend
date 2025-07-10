(function() {
  'use strict';
  
  // Prevent multiple initializations
  if (window.rankvedSimpleChat) return;
  window.rankvedSimpleChat = true;
  
  // Get configuration
  const config = window.CHATBOT_CONFIG || {};
  
  console.log('RankVed Simple Chat initializing...');
  
  // Create chat bubble
  function createChatBubble() {
    console.log('Creating chat bubble...');
    
    const bubble = document.createElement('div');
    bubble.id = 'rankved-chat-bubble';
    
    // Force all styles inline for maximum compatibility
    bubble.setAttribute('style', `
      position: fixed !important;
      bottom: 25px !important;
      right: 25px !important;
      width: 60px !important;
      height: 60px !important;
      background: ${config.primaryColor || '#3B82F6'} !important;
      border-radius: 50% !important;
      cursor: pointer !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25) !important;
      z-index: 999999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: transform 0.2s ease !important;
      border: none !important;
      outline: none !important;
    `);
    
    // Add chat icon
    bubble.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: white;">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    `;
    
    // Add click handler
    bubble.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleChat();
    });
    
    // Add hover effect
    bubble.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1)';
    });
    
    bubble.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
    
    console.log('Chat bubble created successfully');
    return bubble;
  }
  
  // Create chat window
  function createChatWindow() {
    const chatWindow = document.createElement('div');
    chatWindow.id = 'rankved-chat-window';
    
    chatWindow.setAttribute('style', `
      position: fixed !important;
      bottom: 100px !important;
      right: 25px !important;
      width: 350px !important;
      height: 500px !important;
      background: white !important;
      border-radius: 12px !important;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
      z-index: 999998 !important;
      display: none !important;
      flex-direction: column !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
      border: 1px solid #e5e7eb !important;
    `);
    
    chatWindow.innerHTML = `
      <div style="background: ${config.primaryColor || '#3B82F6'}; color: white; padding: 16px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-weight: 600; font-size: 16px;">${config.name || 'Support Chat'}</div>
        <button id="close-chat" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 4px; border-radius: 4px;">×</button>
      </div>
      
      <div id="chat-messages" style="flex: 1; padding: 16px; overflow-y: auto; background: #f9fafb;">
        <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; font-size: 14px; border: 1px solid #e5e7eb;">
          ${config.welcomeMessage || 'Hello! How can I help you today?'}
        </div>
      </div>
      
      <div style="padding: 16px; border-top: 1px solid #e5e7eb; background: white; border-radius: 0 0 12px 12px;">
        <div style="display: flex; gap: 8px;">
          <input type="text" id="chat-input" placeholder="${config.placeholder || 'Type a message...'}" style="flex: 1; padding: 10px; border: 1px solid #d1d5db; border-radius: 20px; outline: none; font-size: 14px;">
          <button id="send-message" style="background: ${config.primaryColor || '#3B82F6'}; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m3 3 3 9-3 9 19-9Z"></path>
              <path d="m6 12 13 0"></path>
            </svg>
          </button>
        </div>
        <div style="text-align: center; margin-top: 8px; font-size: 11px; color: #6b7280;">
          Powered by <a href="https://rankved.com" target="_blank" style="color: #6b7280; text-decoration: none;">RankVed</a>
        </div>
      </div>
    `;
    
    return chatWindow;
  }
  
  // Toggle chat
  function toggleChat() {
    console.log('Toggle chat clicked');
    const chatWindow = document.getElementById('rankved-chat-window');
    const bubble = document.getElementById('rankved-chat-bubble');
    
    if (chatWindow && bubble) {
      if (chatWindow.style.display === 'none') {
        chatWindow.style.display = 'flex';
        bubble.style.display = 'none';
        
        // Focus input
        setTimeout(() => {
          const input = document.getElementById('chat-input');
          if (input) input.focus();
        }, 100);
      } else {
        chatWindow.style.display = 'none';
        bubble.style.display = 'flex';
      }
    }
  }
  
  // Send message
  function sendMessage() {
    const input = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');
    
    if (input && input.value.trim() && messagesContainer) {
      const message = input.value.trim();
      
      // Add user message
      const userMsg = document.createElement('div');
      userMsg.setAttribute('style', `
        background: ${config.primaryColor || '#3B82F6'};
        color: white;
        padding: 10px 14px;
        border-radius: 18px;
        margin: 8px 0 8px auto;
        max-width: 80%;
        font-size: 14px;
        word-wrap: break-word;
      `);
      userMsg.textContent = message;
      messagesContainer.appendChild(userMsg);
      
      input.value = '';
      
      // Auto scroll
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      // Bot response
      setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.setAttribute('style', `
          background: white;
          color: #374151;
          padding: 10px 14px;
          border-radius: 18px;
          margin: 8px auto 8px 0;
          max-width: 80%;
          font-size: 14px;
          border: 1px solid #e5e7eb;
          word-wrap: break-word;
        `);
        botMsg.textContent = 'Thank you for your message! How else can I help you?';
        messagesContainer.appendChild(botMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 500);
    }
  }
  
  // Initialize widget
  function initWidget() {
    console.log('Creating widget elements...');
    
    // Remove existing elements
    const existing = document.querySelectorAll('#rankved-chat-bubble, #rankved-chat-window');
    existing.forEach(el => el.remove());
    
    // Create new elements
    const bubble = createChatBubble();
    const chatWindow = createChatWindow();
    
    // Add to DOM
    document.body.appendChild(bubble);
    document.body.appendChild(chatWindow);
    
    // Setup event listeners
    const closeBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-message');
    const input = document.getElementById('chat-input');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', toggleChat);
    }
    
    if (sendBtn) {
      sendBtn.addEventListener('click', sendMessage);
    }
    
    if (input) {
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendMessage();
        }
      });
    }
    
    console.log('Widget initialized successfully');
  }
  
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    setTimeout(initWidget, 100);
  }
  
})();