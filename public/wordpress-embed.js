(function() {
  'use strict';
  
  // WordPress environment detection
  function isWordPress() {
    return !!(window.wp || document.querySelector('meta[name="generator"][content*="WordPress"]') || 
              document.querySelector('link[href*="wp-content"]') || document.querySelector('script[src*="wp-"]'));
  }
  
  // Get optimal z-index for WordPress
  function getOptimalZIndex() {
    let maxZ = 999999;
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      const z = parseInt(window.getComputedStyle(el).zIndex);
      if (z && z > maxZ) maxZ = z;
    });
    return Math.max(maxZ + 100, 2147483647);
  }
  
  // Configuration from embed code
  let config = window.CHATBOT_CONFIG || {};
  console.log('WordPress Chatbot Config:', config);
  
  let isOpen = false;
  let bubble = null;
  let chatWindow = null;
  const optimalZIndex = getOptimalZIndex();
  
  // Create chat bubble with WordPress-specific styling
  function createChatBubble() {
    const bubble = document.createElement('div');
    bubble.setAttribute('id', 'rankved-chat-bubble');
    bubble.setAttribute('data-rankved-widget', 'true');
    
    // Inline styles to prevent WordPress theme conflicts
    const bubbleStyles = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      width: 60px !important;
      height: 60px !important;
      border-radius: 50% !important;
      background: ${config.primaryColor || '#007bff'} !important;
      box-shadow: 0 4px 12px rgba(0,123,255,0.4) !important;
      cursor: pointer !important;
      z-index: ${optimalZIndex} !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.3s ease !important;
      border: none !important;
      outline: none !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      margin: 0 !important;
      padding: 0 !important;
      transform: scale(1) !important;
    `;
    
    bubble.setAttribute('style', bubbleStyles);
    
    // Set bubble content - prioritize chatBubbleIcon, then bubbleIcon, then default
    const iconSrc = config.chatBubbleIcon || config.bubbleIcon;
    bubble.innerHTML = iconSrc ? 
      `<img src="${iconSrc}" style="width: 28px !important; height: 28px !important; border-radius: 50% !important; object-fit: cover !important; pointer-events: none !important;" alt="Chat Icon">` :
      `<svg width="24" height="24" viewBox="0 0 24 24" fill="white" style="pointer-events: none !important;">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>`;
    
    function handleBubbleClick(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openChat();
      return false;
    }
    
    bubble.addEventListener('click', handleBubbleClick, true);
    bubble.addEventListener('touchstart', handleBubbleClick, true);
    
    return bubble;
  }
  
  // Create chat window
  function createChatWindow() {
    const window = document.createElement('div');
    window.setAttribute('id', 'rankved-chat-window');
    window.setAttribute('data-rankved-widget', 'true');
    
    // Dynamic styling based on configuration
    const borderRadius = config.borderRadius || 16;
    const shadowStyle = config.shadowStyle || 'soft';
    const theme = config.chatWindowTheme || 'light';
    
    let boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
    if (shadowStyle === 'minimal') {
      boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    } else if (shadowStyle === 'strong') {
      boxShadow = '0 20px 60px rgba(0,0,0,0.25)';
    }
    
    const backgroundColor = theme === 'dark' ? '#1a1a1a' : 'white';
    const borderColor = theme === 'dark' ? '#333' : '#e1e5e9';
    
    const windowStyles = `
      position: fixed !important;
      bottom: 90px !important;
      right: 20px !important;
      width: 380px !important;
      height: 600px !important;
      max-height: 80vh !important;
      border-radius: 8px !important;
      background: white !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      z-index: ${optimalZIndex - 1} !important;
      display: none !important;
      flex-direction: column !important;
      overflow: hidden !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      border: 1px solid ${borderColor} !important;
      margin: 0 !important;
      padding: 0 !important;
    `;
    
    window.setAttribute('style', windowStyles);
    
    window.innerHTML = `
      <div style="background: ${config.primaryColor || '#6366F1'} !important; color: white !important; padding: 12px !important; display: flex !important; align-items: center !important; justify-content: space-between !important; border-radius: 8px 8px 0 0 !important;">
        <div style="display: flex !important; align-items: center !important; gap: 8px !important;">
          ${config.chatWidgetIcon || config.chatWindowAvatar ? `<img src="${config.chatWidgetIcon || config.chatWindowAvatar}" style="width: 24px !important; height: 24px !important; border-radius: 50% !important; object-fit: cover !important;" alt="Bot Avatar">` : `<div style="width: 24px !important; height: 24px !important; border-radius: 50% !important; background: rgba(255,255,255,0.2) !important; display: flex !important; align-items: center !important; justify-content: center !important;"><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12,2A2,2 0 0,1 14,4C14,5.5 13.14,6.77 11.9,6.96L11.5,11.5C15.5,10.5 16,8 16,8H17A1,1 0 0,1 18,9V16A2,2 0 0,1 16,18H8A2,2 0 0,1 6,16V9A1,1 0 0,1 7,8H8C8,8 8.5,10.5 12.5,11.5L12.1,6.96C10.86,6.77 10,5.5 10,4A2,2 0 0,1 12,2Z"/></svg></div>`}
          <div>
            <p style="margin: 0 !important; font-size: 14px !important; font-weight: 600 !important; line-height: 1.2 !important;">${config.chatWidgetName || config.title || 'Support Bot'}</p>
            <div style="display: flex !important; align-items: center !important; gap: 4px !important; margin-top: 2px !important;">
              <div style="width: 6px !important; height: 6px !important; background: #10B981 !important; border-radius: 50% !important;"></div>
              <span style="font-size: 12px !important; opacity: 0.9 !important;">Online</span>
            </div>
          </div>
        </div>
        <button id="rankved-close-btn" style="background: none !important; border: none !important; color: white !important; font-size: 18px !important; cursor: pointer !important; padding: 4px !important; width: 24px !important; height: 24px !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 4px !important; opacity: 0.8 !important;">×</button>
      </div>
      <div id="rankved-messages" style="flex: 1 !important; overflow-y: auto !important; padding: 12px !important; background: #f8f9fa !important; height: 400px !important;">
        <div style="margin-bottom: 12px !important; display: flex !important; justify-content: flex-start !important; align-items: flex-start !important; gap: 8px !important;">
          ${config.chatWidgetIcon || config.chatWindowAvatar ? `<img src="${config.chatWidgetIcon || config.chatWindowAvatar}" style="width: 24px !important; height: 24px !important; border-radius: 50% !important; flex-shrink: 0 !important; object-fit: cover !important;" alt="Bot Avatar">` : `<div style="width: 24px !important; height: 24px !important; border-radius: 50% !important; background: ${config.primaryColor || '#6366F1'} !important; flex-shrink: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important;"><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12,2A2,2 0 0,1 14,4C14,5.5 13.14,6.77 11.9,6.96L11.5,11.5C15.5,10.5 16,8 16,8H17A1,1 0 0,1 18,9V16A2,2 0 0,1 16,18H8A2,2 0 0,1 6,16V9A1,1 0 0,1 7,8H8C8,8 8.5,10.5 12.5,11.5L12.1,6.96C10.86,6.77 10,5.5 10,4A2,2 0 0,1 12,2Z"/></svg></div>`}
          <div style="max-width: 80% !important; padding: 8px 12px !important; border-radius: 8px !important; font-size: 14px !important; line-height: 1.4 !important; word-wrap: break-word !important; background: white !important; color: #333 !important; box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;">
            ${config.welcomeMessage || 'Hello! How can I help you today?'}
          </div>
        </div>
        <div id="rankved-question-flow-container"></div>
      </div>
      <div style="padding: 12px !important; border-top: 1px solid #e2e8f0 !important; background: white !important;">
        <!-- Question Suggestions Hints -->
        <div id="rankved-question-hints" style="display: none !important; margin-bottom: 8px !important;">
          <div style="font-size: 12px !important; color: #666 !important; margin-bottom: 6px !important;">💡 Quick questions:</div>
          <div id="rankved-hints-container" style="display: flex !important; flex-wrap: wrap !important; gap: 6px !important;">
            <!-- Hints will be populated here -->
          </div>
        </div>
        <div style="display: flex !important; gap: 8px !important; align-items: center !important;">
          <input id="rankved-input" placeholder="${config.inputPlaceholder || 'Type your message...'}" style="flex: 1 !important; border: 1px solid #e2e8f0 !important; border-radius: 6px !important; padding: 8px 12px !important; font-size: 14px !important; outline: none !important; font-family: inherit !important; background: white !important; color: #333 !important; height: 32px !important;">
          <button id="rankved-send-btn" style="width: 32px !important; height: 32px !important; border-radius: 6px !important; background: ${config.primaryColor || '#6366F1'} !important; border: none !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style="width: 18px !important; height: 18px !important; flex-shrink: 0 !important;">
              <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
            </svg>
          </button>
        </div>
        <div style="text-align: center !important; padding: 8px !important; font-size: 11px !important; color: ${theme === 'dark' ? '#aaa' : '#666'} !important; background: ${theme === 'dark' ? '#2a2a2a' : '#f8f9fa'} !important;">
          Powered by <a href="https://rankved.com" target="_blank" style="color: ${config.primaryColor || '#007bff'} !important; text-decoration: none !important;">RankVed</a>
        </div>
      </div>
    `;
    
    return window;
  }
  
  // Add message to chat
  function addMessage(content, sender, options = null) {
    const messagesContainer = document.getElementById('rankved-messages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    const isUser = sender === 'user';
    
    if (isUser) {
      // User message - right aligned
      messageDiv.setAttribute('style', `margin-bottom: 16px !important; display: flex !important; justify-content: flex-end !important;`);
      
      const contentDiv = document.createElement('div');
      contentDiv.setAttribute('style', `max-width: 80% !important; padding: 12px 16px !important; border-radius: 18px !important; font-size: 14px !important; line-height: 1.4 !important; word-wrap: break-word !important; background: ${config.primaryColor || '#007bff'} !important; color: white !important;`);
      contentDiv.textContent = content;
      messageDiv.appendChild(contentDiv);
    } else {
      // Bot message - left aligned with avatar
      messageDiv.setAttribute('style', `margin-bottom: 16px !important; display: flex !important; justify-content: flex-start !important; align-items: flex-start !important; gap: 8px !important;`);
      
      // Add bot avatar
      const avatarDiv = document.createElement('div');
      if (config.chatWidgetIcon || config.chatWindowAvatar) {
        avatarDiv.innerHTML = `<img src="${config.chatWidgetIcon || config.chatWindowAvatar}" style="width: 32px !important; height: 32px !important; border-radius: 50% !important; flex-shrink: 0 !important; object-fit: cover !important;" alt="Bot Avatar">`;
      } else {
        avatarDiv.innerHTML = `<div style="width: 32px !important; height: 32px !important; border-radius: 50% !important; background: ${config.primaryColor || '#007bff'} !important; flex-shrink: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important;"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12,2A2,2 0 0,1 14,4C14,5.5 13.14,6.77 11.9,6.96L11.5,11.5C15.5,10.5 16,8 16,8H17A1,1 0 0,1 18,9V16A2,2 0 0,1 16,18H8A2,2 0 0,1 6,16V9A1,1 0 0,1 7,8H8C8,8 8.5,10.5 12.5,11.5L12.1,6.96C10.86,6.77 10,5.5 10,4A2,2 0 0,1 12,2Z"/></svg></div>`;
      }
      
      const contentDiv = document.createElement('div');
      contentDiv.setAttribute('style', `max-width: 80% !important; padding: 12px 16px !important; border-radius: 18px !important; font-size: 14px !important; line-height: 1.4 !important; word-wrap: break-word !important; background: white !important; color: #333 !important; border: 1px solid #e1e5e9 !important;`);
      contentDiv.textContent = content;
      
      messageDiv.appendChild(avatarDiv);
      messageDiv.appendChild(contentDiv);
    }
    
    if (options && options.length > 0) {
      const optionsContainer = document.createElement('div');
      optionsContainer.setAttribute('style', `margin-top: 8px !important; margin-left: ${isUser ? '0' : '40px'} !important;`);
      
      options.forEach(option => {
        const optionBtn = document.createElement('button');
        optionBtn.textContent = option.text;
        optionBtn.setAttribute('style', `display: block !important; width: 100% !important; margin: 4px 0 !important; padding: 8px 12px !important; border: 1px solid ${config.primaryColor || '#007bff'} !important; background: white !important; color: ${config.primaryColor || '#007bff'} !important; border-radius: 20px !important; cursor: pointer !important; font-size: 13px !important;`);
        optionBtn.addEventListener('click', () => handleOptionClick(option));
        optionsContainer.appendChild(optionBtn);
      });
      
      messageDiv.appendChild(optionsContainer);
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  function handleOptionClick(option) {
    addMessage(option.text, 'user');
    
    // Handle question flow navigation
    if (option.nextId && config.questionFlow) {
      const nextNode = config.questionFlow.find(node => node.id === option.nextId);
      if (nextNode) {
        setTimeout(() => {
          addMessage(nextNode.question, 'bot', nextNode.options);
        }, 800);
        return;
      }
    }
    
    if (option.action === 'lead_form') {
      showLeadForm();
    } else {
      setTimeout(() => {
        addMessage('Thank you for your selection. How else can I help you?', 'bot');
      }, 500);
    }
  }
  
  function showLeadForm() {
    const messagesContainer = document.getElementById('rankved-messages');
    if (!messagesContainer) return;
    
    const formDiv = document.createElement('div');
    formDiv.setAttribute('style', `margin-bottom: 16px !important; display: flex !important; justify-content: flex-start !important;`);
    
    formDiv.innerHTML = `
      <div style="max-width: 80% !important; padding: 16px !important; border-radius: 18px !important; background: white !important; border: 1px solid #e1e5e9 !important;">
        <p style="margin: 0 0 12px 0 !important; font-size: 14px !important; color: #333 !important;">Please share your contact information:</p>
        <input type="text" id="lead-name" placeholder="Your Name" style="width: 100% !important; margin-bottom: 8px !important; padding: 8px 12px !important; border: 1px solid #ddd !important; border-radius: 4px !important; font-size: 14px !important;">
        <input type="email" id="lead-email" placeholder="Your Email" style="width: 100% !important; margin-bottom: 8px !important; padding: 8px 12px !important; border: 1px solid #ddd !important; border-radius: 4px !important; font-size: 14px !important;">
        <input type="tel" id="lead-phone" placeholder="Your Phone (Optional)" style="width: 100% !important; margin-bottom: 12px !important; padding: 8px 12px !important; border: 1px solid #ddd !important; border-radius: 4px !important; font-size: 14px !important;">
        <button onclick="submitLead()" style="background: ${config.primaryColor || '#007bff'} !important; color: white !important; border: none !important; padding: 8px 16px !important; border-radius: 4px !important; cursor: pointer !important; font-size: 14px !important;">Submit</button>
      </div>
    `;
    
    messagesContainer.appendChild(formDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  function submitLead() {
    const name = document.getElementById('lead-name')?.value;
    const email = document.getElementById('lead-email')?.value;
    const phone = document.getElementById('lead-phone')?.value;
    
    if (!name || !email) {
      alert('Please fill in your name and email.');
      return;
    }
    
    // Submit lead data
    fetch(`${config.apiUrl || window.location.origin}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatbotId: config.chatbotId,
        name,
        email,
        phone,
        source: 'chat_widget'
      })
    }).then(() => {
      addMessage('Thank you! We\'ll be in touch soon.', 'bot');
    }).catch(() => {
      addMessage('Thank you for your information!', 'bot');
    });
  }
  
  // Open chat
  function openChat() {
    if (!chatWindow || !bubble) return;
    
    isOpen = true;
    chatWindow.style.display = 'flex';
    bubble.style.display = 'none';
    
    // Start question flow after welcome message (if enabled)
    startQuestionFlow();
    
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

  // Start question flow after welcome message
  function startQuestionFlow() {
    if (!config.questionFlowEnabled || !config.questionFlow) return;
    
    // Find the start node or first node
    const startNode = config.questionFlow.find(node => node.id === 'start') || config.questionFlow[0];
    
    if (!startNode || !startNode.question) return;
    
    // Add a small delay to make it feel more natural
    setTimeout(() => {
      // Add the first question as a bot message
      addMessage(startNode.question, 'bot', startNode.options);
    }, 1000);
  }

  // Show question suggestions as hints
  function showQuestionSuggestions() {
    if (!config.questionFlowEnabled || !config.questionFlow) return;
    
    const hintsContainer = document.getElementById('rankved-hints-container');
    const hintsSection = document.getElementById('rankved-question-hints');
    
    if (!hintsContainer || !hintsSection) return;
    
    // Find the start node or first node with questions
    const startNode = config.questionFlow.find(node => node.id === 'start') || config.questionFlow[0];
    
    if (!startNode || !startNode.options || startNode.options.length === 0) return;
    
    // Clear existing hints
    hintsContainer.innerHTML = '';
    
    // Create hint buttons for each option
    startNode.options.forEach((option, index) => {
      if (option.text && option.text.trim()) {
        const hintBtn = document.createElement('button');
        hintBtn.textContent = option.text;
        hintBtn.setAttribute('style', `
          background: ${config.primaryColor || '#007bff'}20 !important;
          border: 1px solid ${config.primaryColor || '#007bff'}40 !important;
          color: ${config.primaryColor || '#007bff'} !important;
          padding: 6px 12px !important;
          border-radius: 16px !important;
          font-size: 12px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          white-space: nowrap !important;
          max-width: 150px !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        `);
        
        hintBtn.addEventListener('click', () => handleHintClick(option.text));
        hintBtn.addEventListener('mouseenter', () => {
          hintBtn.style.background = `${config.primaryColor || '#007bff'}30 !important`;
        });
        hintBtn.addEventListener('mouseleave', () => {
          hintBtn.style.background = `${config.primaryColor || '#007bff'}20 !important`;
        });
        
        hintsContainer.appendChild(hintBtn);
      }
    });
    
    // Show hints section if we have hints
    if (hintsContainer.children.length > 0) {
      hintsSection.style.display = 'block';
    }
  }
  
  // Handle hint click
  function handleHintClick(hintText) {
    const input = document.getElementById('rankved-input');
    if (input) {
      input.value = hintText;
      sendMessage();
    }
  }
  
  // Send message
  async function sendMessage() {
    const input = document.getElementById('rankved-input');
    if (!input || !input.value.trim()) return;
    
    const message = input.value.trim();
    addMessage(message, 'user');
    input.value = '';
    
    // Auto-resize
    input.style.height = 'auto';
    
    try {
      const response = await fetch(`${config.apiUrl || window.location.origin}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          chatbotId: config.chatbotId,
          sessionId: 'web-' + Date.now()
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTimeout(() => {
          addMessage(data.response || 'Thank you for your message!', 'bot');
        }, 800);
      } else {
        setTimeout(() => {
          addMessage('Thank you for your message! Our team will get back to you soon.', 'bot');
        }, 800);
      }
    } catch (error) {
      setTimeout(() => {
        addMessage('Thank you for your message! Our team will get back to you soon.', 'bot');
      }, 800);
    }
  }
  
  // Refresh chat bubble icon
  function refreshBubbleIcon() {
    if (!bubble) return;
    
    const iconSrc = config.chatBubbleIcon || config.bubbleIcon;
    bubble.innerHTML = iconSrc ? 
      `<img src="${iconSrc}" style="width: 28px !important; height: 28px !important; border-radius: 50% !important; object-fit: cover !important; pointer-events: none !important;" alt="Chat Icon">` :
      `<svg width="24" height="24" viewBox="0 0 24 24" fill="white" style="pointer-events: none !important;">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>`;
  }

  // Fetch chatbot configuration from API
  async function fetchChatbotConfig() {
    if (!config.chatbotId) return config;
    
    try {
      const apiUrl = config.apiUrl || window.location.origin;
      const response = await fetch(`${apiUrl}/api/chatbots/${config.chatbotId}/public`);
      if (response.ok) {
        const chatbotData = await response.json();
        // Merge API data with embed config
        const oldConfig = { ...config };
        config = { ...config, ...chatbotData };
        console.log('Updated config with API data:', config);
        
        // Refresh bubble icon if it changed
        if (oldConfig.chatBubbleIcon !== config.chatBubbleIcon) {
          refreshBubbleIcon();
        }
      }
    } catch (error) {
      console.log('Could not fetch chatbot config, using embed config');
    }
    
    return config;
  }

  // Check domain restrictions
  function checkDomainRestrictions() {
    if (config.domainRestrictionsEnabled && config.allowedDomains) {
      const currentDomain = window.location.hostname;
      const allowedDomains = Array.isArray(config.allowedDomains) 
        ? config.allowedDomains 
        : JSON.parse(config.allowedDomains || '[]');
      
      if (allowedDomains.length > 0) {
        const isAllowed = allowedDomains.some(domain => {
          // Remove protocol and www. for comparison
          const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').trim();
          return currentDomain === cleanDomain || currentDomain.endsWith('.' + cleanDomain);
        });
        
        if (!isAllowed) {
          console.warn('RankVed Widget: Domain not allowed', currentDomain, allowedDomains);
          return false;
        }
      }
    }
    return true;
  }

  // Initialize widget
  async function init() {
    // Wait for WordPress to be fully loaded
    if (isWordPress() && !document.body) {
      setTimeout(init, 100);
      return;
    }
    
    console.log('Initializing RankVed WordPress Widget...');
    
    // Fetch complete chatbot configuration
    await fetchChatbotConfig();
    
    // Check domain restrictions
    if (!checkDomainRestrictions()) {
      console.log('RankVed Widget: Domain restrictions prevent loading');
      return;
    }
    
    // Remove any existing widgets
    const existing = document.querySelectorAll('[data-rankved-widget]');
    existing.forEach(el => el.remove());
    
    // Create widget elements
    bubble = createChatBubble();
    chatWindow = createChatWindow();
    
    // Add to DOM
    document.body.appendChild(bubble);
    document.body.appendChild(chatWindow);
    
    // Setup event listeners
    const closeBtn = document.getElementById('rankved-close-btn');
    const sendBtn = document.getElementById('rankved-send-btn');
    const input = document.getElementById('rankved-input');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', closeChat);
    }
    
    if (sendBtn) {
      sendBtn.addEventListener('click', sendMessage);
    }
    
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
      
      input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 100) + 'px';
      });
    }
    
    // Make functions globally available for inline onclick handlers
    window.submitLead = submitLead;
    
    // Start periodic config refresh to update bubble icon (faster refresh for better UX)
    setInterval(async () => {
      await fetchChatbotConfig();
    }, 5000); // Check every 5 seconds for immediate updates
    
    console.log('RankVed WordPress Widget initialized successfully');
  }
  
  // WordPress-compatible initialization
  function createWidget() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      document.addEventListener('load', init);
      // WordPress-specific fallback
      if (window.jQuery) {
        window.jQuery(document).ready(init);
      }
      setTimeout(init, 2000); // Final fallback
    } else {
      init();
    }
  }
  
  // Setup event listeners and handle resize
  function setupEventListeners() {
    // Handle window resize for mobile
    function handleResize() {
      if (chatWindow && window.innerWidth <= 480) {
        chatWindow.style.width = 'calc(100vw - 40px)';
        chatWindow.style.height = 'calc(100vh - 120px)';
        chatWindow.style.left = '20px';
        chatWindow.style.right = '20px';
      } else if (chatWindow) {
        chatWindow.style.width = '380px';
        chatWindow.style.height = '600px';
        chatWindow.style.left = 'auto';
        chatWindow.style.right = '20px';
      }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
  }
  
  // Start initialization
  createWidget();
  setupEventListeners();
  
})();