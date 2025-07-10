(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.rankvedChatInitialized) return;
  window.rankvedChatInitialized = true;

  // Get configuration
  const config = window.CHATBOT_CONFIG || {};
  
  // State
  let chatOpen = false;
  let messages = [];
  let currentFlow = null;
  let currentNodeId = null;

  // WordPress z-index detection
  function getMaxZIndex() {
    let maxZ = 999999;
    
    // Check WordPress admin bar
    const adminBar = document.getElementById('wpadminbar');
    if (adminBar) {
      const adminZ = parseInt(window.getComputedStyle(adminBar).zIndex) || 99999;
      maxZ = Math.max(maxZ, adminZ + 1);
    }
    
    // Check for other high z-index elements
    const elements = document.querySelectorAll('*');
    for (let el of elements) {
      const z = parseInt(window.getComputedStyle(el).zIndex) || 0;
      if (z > 0 && z < 999999) {
        maxZ = Math.max(maxZ, z + 1);
      }
    }
    
    return Math.max(maxZ, 999999);
  }

  // Create chat bubble
  function createChatBubble() {
    const bubble = document.createElement('div');
    bubble.id = 'rankved-chat-bubble';
    
    const isMobile = window.innerWidth <= 768;
    const zIndex = getMaxZIndex();
    
    // Enhanced positioning and styling
    bubble.style.cssText = `
      position: fixed !important;
      bottom: ${isMobile ? '20px' : '30px'} !important;
      right: ${isMobile ? '20px' : '30px'} !important;
      z-index: ${zIndex} !important;
      width: ${isMobile ? '60px' : '70px'} !important;
      height: ${isMobile ? '60px' : '70px'} !important;
      background: ${config.primaryColor || '#3B82F6'} !important;
      border-radius: 50% !important;
      cursor: pointer !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.3s ease !important;
      border: none !important;
      outline: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      user-select: none !important;
      -webkit-tap-highlight-color: transparent !important;
      touch-action: manipulation !important;
    `;
    
    // Chat icon
    bubble.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
    
    // Multiple event listeners for maximum compatibility
    function handleClick(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      if (!chatOpen) {
        openChat();
      } else {
        closeChat();
      }
      
      return false;
    }
    
    // Add multiple event types
    bubble.addEventListener('click', handleClick, { capture: true, passive: false });
    bubble.addEventListener('touchend', handleClick, { capture: true, passive: false });
    bubble.addEventListener('mouseup', handleClick, { capture: true, passive: false });
    
    // Hover effects
    bubble.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1) !important';
      this.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3) !important';
    });
    
    bubble.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1) !important';
      this.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2) !important';
    });
    
    return bubble;
  }

  // Create chat window
  function createChatWindow() {
    const chatWindow = document.createElement('div');
    chatWindow.id = 'rankved-chat-window';
    
    const isMobile = window.innerWidth <= 768;
    const zIndex = getMaxZIndex() + 1;
    
    chatWindow.style.cssText = `
      position: fixed !important;
      bottom: ${isMobile ? '90px' : '110px'} !important;
      right: ${isMobile ? '20px' : '30px'} !important;
      z-index: ${zIndex} !important;
      width: ${isMobile ? 'calc(100vw - 40px)' : '400px'} !important;
      height: ${isMobile ? 'calc(100vh - 120px)' : '600px'} !important;
      max-height: 80vh !important;
      background: white !important;
      border-radius: 20px !important;
      box-shadow: 0 25px 50px rgba(0,0,0,0.15) !important;
      border: 1px solid rgba(0,0,0,0.1) !important;
      display: none !important;
      flex-direction: column !important;
      overflow: hidden !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      transform: translateY(20px) scale(0.95) !important;
      opacity: 0 !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    `;
    
    chatWindow.innerHTML = `
      <div style="background: ${config.primaryColor || '#3B82F6'} !important; color: white !important; padding: 20px !important; display: flex !important; align-items: center !important; justify-content: space-between !important; border-radius: 20px 20px 0 0 !important;">
        <div style="display: flex !important; align-items: center !important; gap: 12px !important;">
          <div style="width: 40px !important; height: 40px !important; border-radius: 50% !important; background: rgba(255,255,255,0.2) !important; display: flex !important; align-items: center !important; justify-content: center !important;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div>
            <div style="font-size: 16px !important; font-weight: 600 !important;">${config.name || 'Chat Support'}</div>
            <div style="font-size: 12px !important; opacity: 0.9 !important; display: flex !important; align-items: center !important; gap: 4px !important;">
              <span style="width: 8px !important; height: 8px !important; background: #10b981 !important; border-radius: 50% !important;"></span>
              Online
            </div>
          </div>
        </div>
        <button id="close-chat-btn" style="background: none !important; border: none !important; color: white !important; cursor: pointer !important; font-size: 24px !important; padding: 8px !important; border-radius: 6px !important; width: 40px !important; height: 40px !important; display: flex !important; align-items: center !important; justify-content: center !important;">×</button>
      </div>
      
      <div id="chat-messages" style="flex: 1 !important; overflow-y: auto !important; padding: 20px !important; background: #f8fafc !important; min-height: 0 !important;"></div>
      
      <div style="padding: 20px !important; border-top: 1px solid #e5e7eb !important; background: white !important;">
        <div style="display: flex !important; gap: 12px !important; align-items: center !important;">
          <input id="chat-input" type="text" placeholder="${config.placeholder || 'Type a message...'}" style="flex: 1 !important; padding: 12px 16px !important; border: 1px solid #d1d5db !important; border-radius: 25px !important; outline: none !important; font-size: 14px !important;">
          <button id="send-chat-btn" style="background: ${config.primaryColor || '#3B82F6'} !important; color: white !important; border: none !important; border-radius: 50% !important; width: 45px !important; height: 45px !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m3 3 3 9-3 9 19-9Z"></path>
              <path d="m6 12 13 0"></path>
            </svg>
          </button>
        </div>
        <div style="text-align: center !important; margin-top: 12px !important;">
          <a href="https://rankved.com" target="_blank" style="color: #6b7280 !important; text-decoration: none !important; font-size: 11px !important;">Powered by RankVed</a>
        </div>
      </div>
    `;
    
    return chatWindow;
  }

  // Add message to chat
  function addMessage(content, sender, options = null) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      display: flex !important;
      ${sender === 'user' ? 'justify-content: flex-end' : 'justify-content: flex-start'} !important;
      margin-bottom: 16px !important;
    `;
    
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      max-width: 80% !important;
      padding: 12px 16px !important;
      border-radius: 18px !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
      ${sender === 'user' ? 
        `background: ${config.primaryColor || '#3B82F6'} !important; color: white !important;` :
        'background: white !important; color: #374151 !important; border: 1px solid #e5e7eb !important;'
      }
    `;
    
    bubble.textContent = content;
    
    // Add options if provided
    if (options && options.length > 0) {
      const optionsContainer = document.createElement('div');
      optionsContainer.style.cssText = `
        margin-top: 12px !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
      `;
      
      options.forEach(option => {
        const btn = document.createElement('button');
        btn.style.cssText = `
          background: #f3f4f6 !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          padding: 10px 16px !important;
          font-size: 13px !important;
          cursor: pointer !important;
          transition: background-color 0.2s !important;
          text-align: left !important;
          color: #374151 !important;
        `;
        
        btn.textContent = option.text;
        btn.onclick = () => handleOptionClick(option);
        
        btn.onmouseover = function() { this.style.background = '#e5e7eb !important'; };
        btn.onmouseout = function() { this.style.background = '#f3f4f6 !important'; };
        
        optionsContainer.appendChild(btn);
      });
      
      bubble.appendChild(optionsContainer);
    }
    
    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Handle option clicks
  function handleOptionClick(option) {
    addMessage(option.text, 'user');
    
    if (option.action === 'collect-lead') {
      setTimeout(() => {
        addMessage('Please share your contact information so we can help you better.', 'bot');
        showLeadForm();
      }, 500);
    } else if (option.nextId && currentFlow) {
      const nextNode = currentFlow.nodes?.find(n => n.id === option.nextId);
      if (nextNode) {
        setTimeout(() => {
          addMessage(nextNode.question, 'bot', nextNode.options);
          currentNodeId = nextNode.id;
        }, 500);
      }
    }
  }

  // Show lead collection form
  function showLeadForm() {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    const formDiv = document.createElement('div');
    formDiv.style.cssText = `
      background: white !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 12px !important;
      padding: 16px !important;
      margin: 16px 0 !important;
    `;
    
    formDiv.innerHTML = `
      <div style="font-weight: 600 !important; margin-bottom: 12px !important;">Contact Information</div>
      <input type="text" id="lead-name" placeholder="Full Name" style="width: 100% !important; padding: 10px !important; border: 1px solid #d1d5db !important; border-radius: 6px !important; margin-bottom: 8px !important; font-size: 14px !important;">
      <input type="email" id="lead-email" placeholder="Email Address" style="width: 100% !important; padding: 10px !important; border: 1px solid #d1d5db !important; border-radius: 6px !important; margin-bottom: 8px !important; font-size: 14px !important;">
      <input type="tel" id="lead-phone" placeholder="Phone Number" style="width: 100% !important; padding: 10px !important; border: 1px solid #d1d5db !important; border-radius: 6px !important; margin-bottom: 12px !important; font-size: 14px !important;">
      <button id="submit-lead-btn" style="background: ${config.primaryColor || '#3B82F6'} !important; color: white !important; border: none !important; border-radius: 6px !important; padding: 12px 20px !important; cursor: pointer !important; font-weight: 600 !important; width: 100% !important;">Submit</button>
    `;
    
    messagesContainer.appendChild(formDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    document.getElementById('submit-lead-btn').onclick = submitLead;
  }

  // Submit lead
  function submitLead() {
    const name = document.getElementById('lead-name').value;
    const email = document.getElementById('lead-email').value;
    const phone = document.getElementById('lead-phone').value;
    
    if (name && email) {
      fetch(`${config.apiUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: config.chatbotId,
          name, email, phone,
          source: 'chat_widget'
        })
      }).then(() => {
        addMessage('Thank you! We will contact you soon.', 'bot');
      }).catch(() => {
        addMessage('Thank you for your information!', 'bot');
      });
    }
  }

  // Open chat
  function openChat() {
    const chatWindow = document.getElementById('rankved-chat-window');
    const bubble = document.getElementById('rankved-chat-bubble');
    
    if (chatWindow && bubble) {
      chatOpen = true;
      bubble.style.display = 'none';
      chatWindow.style.display = 'flex';
      
      setTimeout(() => {
        chatWindow.style.transform = 'translateY(0) scale(1)';
        chatWindow.style.opacity = '1';
      }, 10);
      
      // Send welcome message
      if (messages.length === 0) {
        setTimeout(() => {
          if (config.questionFlow && config.questionFlow.nodes) {
            currentFlow = config.questionFlow;
            const startNode = config.questionFlow.nodes.find(n => n.id === 'start') || config.questionFlow.nodes[0];
            if (startNode) {
              addMessage(startNode.question, 'bot', startNode.options);
              currentNodeId = startNode.id;
            }
          } else if (config.welcomeMessage) {
            addMessage(config.welcomeMessage, 'bot');
          } else {
            addMessage('Hello! How can I help you today?', 'bot');
          }
          messages.push({ content: 'initial', sender: 'bot' });
        }, 300);
      }
      
      // Focus input
      setTimeout(() => {
        const input = document.getElementById('chat-input');
        if (input) input.focus();
      }, 500);
    }
  }

  // Close chat
  function closeChat() {
    const chatWindow = document.getElementById('rankved-chat-window');
    const bubble = document.getElementById('rankved-chat-bubble');
    
    if (chatWindow && bubble) {
      chatOpen = false;
      chatWindow.style.transform = 'translateY(20px) scale(0.95)';
      chatWindow.style.opacity = '0';
      
      setTimeout(() => {
        chatWindow.style.display = 'none';
        bubble.style.display = 'flex';
      }, 300);
    }
  }

  // Send message
  function sendMessage() {
    const input = document.getElementById('chat-input');
    if (!input || !input.value.trim()) return;
    
    const message = input.value.trim();
    addMessage(message, 'user');
    input.value = '';
    
    // Simple response logic
    setTimeout(() => {
      addMessage('Thank you for your message. How else can I help you?', 'bot');
    }, 500);
  }

  // Initialize widget
  function initWidget() {
    console.log('Initializing RankVed widget...');
    
    // Skip API call for now, use provided config
    console.log('Using config:', config);

    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createWidget);
    } else {
      // Small delay to ensure DOM is ready
      setTimeout(createWidget, 100);
    }
  }

  // Create widget elements
  function createWidget() {
    console.log('Creating widget elements...');
    
    // Remove existing widgets
    const existing = document.querySelectorAll('#rankved-chat-bubble, #rankved-chat-window');
    existing.forEach(el => el.remove());

    // Create elements
    const bubble = createChatBubble();
    const chatWindow = createChatWindow();
    
    console.log('Chat bubble created:', bubble);
    console.log('Chat window created:', chatWindow);
    
    // Add to DOM
    document.body.appendChild(bubble);
    document.body.appendChild(chatWindow);
    
    console.log('Elements added to DOM');
    
    // Setup event listeners
    const closeBtn = document.getElementById('close-chat-btn');
    const sendBtn = document.getElementById('send-chat-btn');
    const input = document.getElementById('chat-input');
    
    if (closeBtn) closeBtn.onclick = closeChat;
    if (sendBtn) sendBtn.onclick = sendMessage;
    if (input) {
      input.onkeypress = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendMessage();
        }
      };
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
      const isMobile = window.innerWidth <= 768;
      
      if (bubble) {
        bubble.style.bottom = isMobile ? '20px' : '30px';
        bubble.style.right = isMobile ? '20px' : '30px';
        bubble.style.width = isMobile ? '60px' : '70px';
        bubble.style.height = isMobile ? '60px' : '70px';
      }
      
      if (chatWindow) {
        chatWindow.style.bottom = isMobile ? '90px' : '110px';
        chatWindow.style.right = isMobile ? '20px' : '30px';
        chatWindow.style.width = isMobile ? 'calc(100vw - 40px)' : '400px';
        chatWindow.style.height = isMobile ? 'calc(100vh - 120px)' : '600px';
      }
    });
  }

  // Start initialization
  initWidget();
})();