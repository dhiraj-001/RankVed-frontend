(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.ChatBotProLoaded) {
    return;
  }
  window.ChatBotProLoaded = true;

  // Global ChatBotPro object
  window.ChatBotPro = window.ChatBotPro || {};

  // Default configuration
  let config = {
    chatbotId: null,
    primaryColor: '#6366F1',
    position: 'bottom-right',
    apiUrl: window.location.origin
  };

  // State variables
  let isOpen = false;
  let chatContainer = null;
  let chatBubble = null;
  let iframe = null;

  // Initialize the chat widget
  function init(options) {
    config = { ...config, ...options };
    
    if (!config.chatbotId) {
      console.error('ChatBotPro: chatbotId is required');
      return;
    }

    // Remove any existing widgets
    cleanup();
    
    // Create and setup the widget
    createChatBubble();
    createChatContainer();
    setupEventListeners();
    
    console.log('ChatBot Pro: Widget initialized successfully');
  }

  // Clean up existing widgets
  function cleanup() {
    const existingBubble = document.getElementById('chatbot-bubble');
    const existingContainer = document.getElementById('chatbot-container');
    if (existingBubble) existingBubble.remove();
    if (existingContainer) existingContainer.remove();
  }

  // Create the chat bubble
  function createChatBubble() {
    chatBubble = document.createElement('button');
    chatBubble.id = 'chatbot-bubble';
    chatBubble.type = 'button';
    chatBubble.setAttribute('aria-label', 'Open chat');
    
    // Apply styles
    const bottomPos = config.position.includes('bottom') ? 'bottom' : 'top';
    const rightPos = config.position.includes('right') ? 'right' : 'left';
    
    Object.assign(chatBubble.style, {
      position: 'fixed',
      zIndex: '2147483647',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'auto',
      outline: 'none',
      backgroundColor: config.primaryColor
    });
    
    chatBubble.style[bottomPos] = '20px';
    chatBubble.style[rightPos] = '20px';

    // Use custom bubble icon if available, otherwise default chat icon
    if (config.chatBubbleIcon && config.chatBubbleIcon.trim()) {
      chatBubble.innerHTML = `<img src="${config.chatBubbleIcon}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" alt="Chat" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="display: none;">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>`;
    } else {
      chatBubble.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      `;
    }

    // Add click handler
    chatBubble.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleChat();
    });

    // Add hover effects
    chatBubble.addEventListener('mouseenter', () => {
      chatBubble.style.transform = 'scale(1.1)';
    });

    chatBubble.addEventListener('mouseleave', () => {
      chatBubble.style.transform = 'scale(1)';
    });

    document.body.appendChild(chatBubble);
  }

  // Create the chat container
  function createChatContainer() {
    chatContainer = document.createElement('div');
    chatContainer.id = 'chatbot-container';
    
    const bottomPos = config.position.includes('bottom') ? 'bottom' : 'top';
    const rightPos = config.position.includes('right') ? 'right' : 'left';
    
    // Apply styles for desktop
    Object.assign(chatContainer.style, {
      position: 'fixed',
      zIndex: '2147483646',
      width: '400px',
      height: '600px',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      display: 'none',
      pointerEvents: 'auto',
      overflow: 'hidden',
      backgroundColor: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    });
    
    // Position the container in the same place as the bubble
    chatContainer.style[bottomPos] = '20px';
    chatContainer.style[rightPos] = '20px';
    
    // Mobile responsive styles
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      Object.assign(chatContainer.style, {
        width: 'calc(100vw - 20px)',
        height: 'calc(100vh - 40px)',
        top: '20px',
        left: '10px',
        right: '10px',
        bottom: '20px',
        borderRadius: '12px'
      });
    }

    // Create iframe
    iframe = document.createElement('iframe');
    iframe.src = `${config.apiUrl}/chat/${config.chatbotId}`;
    iframe.allow = 'clipboard-write; microphone; camera';
    
    Object.assign(iframe.style, {
      width: '100%',
      height: '100%',
      border: 'none',
      borderRadius: 'inherit',
      backgroundColor: 'white'
    });

    iframe.onload = () => {
      console.log('ChatBot Pro: Chat interface loaded');
    };

    iframe.onerror = () => {
      console.error('ChatBot Pro: Failed to load chat interface');
    };

    chatContainer.appendChild(iframe);
    document.body.appendChild(chatContainer);
    
    // Handle window resize for mobile responsiveness
    window.addEventListener('resize', () => {
      const isMobileNow = window.innerWidth <= 768;
      if (isMobileNow) {
        Object.assign(chatContainer.style, {
          width: 'calc(100vw - 20px)',
          height: 'calc(100vh - 40px)',
          top: '20px',
          left: '10px',
          right: '10px',
          bottom: '20px'
        });
      } else {
        Object.assign(chatContainer.style, {
          width: '400px',
          height: '600px',
          top: 'auto',
          left: 'auto',
          right: 'auto',
          bottom: 'auto'
        });
        chatContainer.style[bottomPos] = '20px';
        chatContainer.style[rightPos] = '20px';
      }
    });
  }

  // Setup event listeners
  function setupEventListeners() {
    // Handle clicks outside the chat
    document.addEventListener('click', function(e) {
      if (isOpen && 
          chatContainer && 
          !chatContainer.contains(e.target) && 
          e.target !== chatBubble && 
          !chatBubble.contains(e.target)) {
        closeChat();
      }
    });

    // Handle messages from iframe
    window.addEventListener('message', function(e) {
      if (e.origin !== config.apiUrl) return;
      
      if (e.data.type === 'CLOSE_CHAT') {
        closeChat();
      }
    });

    // Handle ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        closeChat();
      }
    });
  }

  // Toggle chat open/closed
  function toggleChat() {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  // Open chat
  function openChat() {
    if (!chatContainer) return;
    
    isOpen = true;
    
    // Hide the bubble completely when chat opens
    chatBubble.style.display = 'none';
    
    // Show chat container
    chatContainer.style.display = 'block';
    
    // Animation
    chatContainer.style.opacity = '0';
    chatContainer.style.transform = 'scale(0.95) translateY(10px)';
    
    requestAnimationFrame(() => {
      chatContainer.style.transition = 'all 0.3s ease';
      chatContainer.style.opacity = '1';
      chatContainer.style.transform = 'scale(1) translateY(0)';
    });
  }

  // Close chat
  function closeChat() {
    if (!chatContainer) return;
    
    isOpen = false;
    
    chatContainer.style.transition = 'all 0.3s ease';
    chatContainer.style.opacity = '0';
    chatContainer.style.transform = 'scale(0.95) translateY(10px)';
    
    setTimeout(() => {
      chatContainer.style.display = 'none';
      // Show the bubble again when chat closes
      chatBubble.style.display = 'flex';
    }, 300);
  }

  // Expose public API
  window.ChatBotPro = {
    init: init,
    open: openChat,
    close: closeChat,
    toggle: toggleChat
  };

  console.log('ChatBot Pro: Script loaded successfully');
})();