(function() {
  'use strict';

  // Get configuration from global variable
  const config = window.CHATBOT_CONFIG || {};
  
  // State variables
  let messages = [];
  let isLoading = false;
  let isOpen = false;
  let messageCount = 0;
  let manualMessageCount = 0;
  let suggestionsShown = false;
  let suggestionTimeout = null;
  let conversationContext = {
    isFlowBased: false,
    usingSuggestions: false,
    leadCollected: false
  };

  // Styling utility functions
  function getShadowStyle(shadowType) {
    switch(shadowType) {
      case 'none': return 'box-shadow: none;';
      case 'soft': return 'box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);';
      case 'medium': return 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);';
      case 'strong': return 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);';
      default: return 'box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);';
    }
  }

  function getThemeStyles(theme) {
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      return {
        background: 'background: #1e293b;',
        text: 'color: #f1f5f9;',
        messageBackground: 'background: #334155;',
        inputBackground: 'background: #475569; color: #f1f5f9; border-color: #64748b;',
        botMessage: 'background: #475569; color: #f1f5f9;'
      };
    }
    
    return {
      background: 'background: white;',
      text: 'color: #0f172a;',
      messageBackground: 'background: #f8fafc;',
      inputBackground: 'background: white; color: #0f172a; border-color: #e2e8f0;',
      botMessage: 'background: #f1f5f9; color: #475569;'
    };
  }

  function getWindowStyle(style) {
    switch(style) {
      case 'classic':
        return { border: 'border: 2px solid #e2e8f0;' };
      case 'minimal':
        return { border: 'border: 1px solid #f1f5f9;' };
      case 'floating':
        return { border: 'border: none;' };
      case 'modern':
      default:
        return { border: 'border: 1px solid #e2e8f0;' };
    }
  }

  // Initialize the chat widget
  async function init() {
    // Inject style for font sizes and paddings to match chat-embed
    if (!document.getElementById('rankved-iframe-style')) {
      const style = document.createElement('style');
      style.id = 'rankved-iframe-style';
      style.textContent = `
        .rankved-msg-bubble { font-size: 13px !important; }
        .rankved-suggestion-btn, .rankved-cta-btn {
          font-size: 13px !important;
          padding: 8px 14px !important;
          border-radius: 12px !important;
        }
        @media (max-width: 600px) {
          .rankved-msg-bubble { font-size: 15px !important; }
          .rankved-suggestion-btn, .rankved-cta-btn {
            font-size: 15px !important;
            padding: 10px 18px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
    // Fetch chatbot configuration from server
    try {
      const response = await fetch(`${config.apiUrl}/api/chatbots/${config.chatbotId}/public`);
      if (response.ok) {
        const chatbotData = await response.json();
        // Merge server config with client config
        Object.assign(config, {
          welcomeMessage: chatbotData.welcomeMessage || config.welcomeMessage,
          placeholder: chatbotData.placeholder || config.placeholder,
          primaryColor: chatbotData.primaryColor || config.primaryColor,
          chatWindowAvatar: chatbotData.chatWindowAvatar,
          chatBubbleIcon: chatbotData.chatBubbleIcon,
          suggestionButtons: chatbotData.suggestionButtons,
          suggestionTiming: chatbotData.suggestionTiming,
          suggestionPersistence: chatbotData.suggestionPersistence,
          suggestionTimeout: chatbotData.suggestionTimeout,
          leadCollectionEnabled: chatbotData.leadCollectionEnabled,
          leadCollectionAfterMessages: chatbotData.leadCollectionAfterMessages,
          leadCollectionMessage: chatbotData.leadCollectionMessage,
          theme: chatbotData.theme,
          windowStyle: chatbotData.windowStyle,
          borderRadius: chatbotData.borderRadius,
          shadowStyle: chatbotData.shadowStyle,
          questionFlow: chatbotData.questionFlow,
          questionFlowEnabled: chatbotData.questionFlowEnabled
        });
      }
    } catch (error) {
      console.error('Error fetching chatbot config:', error);
    }

    // Create chat widget container
    let container = document.getElementById('chat-widget');
    if (!container) {
      container = document.createElement('div');
      container.id = 'chat-widget';
      // Responsive positioning
      const isMobile = window.innerWidth <= 768;
      container.style.cssText = `
        position: fixed;
        bottom: ${isMobile ? '10px' : '20px'};
        right: ${isMobile ? '10px' : '20px'};
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      document.body.appendChild(container);
    }

    // Create chat interface
    createChatInterface(container);
    
    // Check if question flow is enabled
    if (config.questionFlow && config.questionFlowEnabled) {
      // Send welcome message from flow
      const welcomeMsg = config.questionFlow.welcome || config.welcomeMessage;
      if (welcomeMsg) {
        setTimeout(() => {
          addMessage(welcomeMsg, 'bot');
          // Show first question flow node
          if (config.questionFlow.nodes && config.questionFlow.nodes.length > 0) {
            const startNode = config.questionFlow.nodes.find(node => node.id === 'start') || config.questionFlow.nodes[0];
            showQuestionNode(startNode);
          }
        }, 500);
      }
    } else {
      // Original behavior - send welcome message and show suggestions
      if (config.welcomeMessage) {
        setTimeout(() => {
          addMessage(config.welcomeMessage, 'bot');
          showSuggestedQuestions('after_welcome');
        }, 500);
      } else {
        showSuggestedQuestions('initial');
      }
    }
  }

  // Create the chat interface HTML
  function createChatInterface(container) {
    const avatarIcon = config.chatWindowAvatar || config.chatBubbleIcon;
    
    // Apply modern styling options
    const borderRadius = config.borderRadius || 16;
    const shadowStyle = getShadowStyle(config.shadowStyle || 'soft');
    const theme = getThemeStyles(config.chatWindowTheme || 'light');
    const windowStyle = getWindowStyle(config.chatWindowStyle || 'modern');
    
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 450px; max-height: 70vh; width: 350px; ${theme.background}; border-radius: ${borderRadius}px; overflow: hidden; ${shadowStyle}; ${windowStyle.border};">
        <!-- Header -->
        <div style="background: ${config.primaryColor || '#6366F1'}; color: white; padding: 16px; display: flex; align-items: center; justify-content: space-between; border-radius: ${borderRadius}px ${borderRadius}px 0 0;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden;">
              ${avatarIcon && avatarIcon.trim() ? 
                `<img src="${avatarIcon}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" alt="Avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="display: none;">
                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                   <circle cx="12" cy="7" r="4"></circle>
                 </svg>` : 
                `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                   <circle cx="12" cy="7" r="4"></circle>
                 </svg>`
              }
            </div>
            <div>
              <div style="font-size: 16px; font-weight: 600; margin: 0;">${config.name || 'Support Bot'}</div>
              <div style="font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 4px; margin-top: 2px;">
                <span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block;"></span>
                Online
              </div>
            </div>
          </div>
          <button onclick="parent.postMessage({type: 'CLOSE_CHAT'}, '*')" style="background: none; border: none; color: white; cursor: pointer; font-size: 24px; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">×</button>
        </div>
        
        <!-- Messages Container -->
        <div id="messages-container" style="flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #f8fafc;">
        </div>
        
        <!-- Suggested Questions -->
        <div id="suggestions-container" style="display: none; padding: 12px 16px; border-top: 1px solid #e5e7eb; background: #f8fafc;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Quick questions:</div>
          <div id="suggestions-list" style="display: flex; flex-wrap: wrap; gap: 6px;"></div>
        </div>

        <!-- Input Area -->
        <div style="padding: 16px; border-top: 1px solid #e5e7eb; background: white;">
          <div style="display: flex; gap: 8px; align-items: flex-end;">
            <input 
              id="message-input" 
              type="text" 
              placeholder="${config.placeholder || 'Type your message...'}"
              style="flex: 1; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 24px; outline: none; font-size: 14px; resize: none; font-family: inherit;"
            >
            <button 
              id="send-button"
              style="background: ${config.primaryColor || '#6366F1'}; color: white; border: none; border-radius: 50%; width: 44px; height: 44px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s ease;"
              onmouseover="this.style.opacity='0.9'; this.style.transform='scale(1.05)'"
              onmouseout="this.style.opacity='1'; this.style.transform='scale(1)'"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 3 3 9-3 9 19-9Z"></path>
                <path d="m6 12 13 0"></path>
              </svg>
            </button>
          </div>
          ${config.poweredByText && config.poweredByText.trim() ? `
            <div style="text-align: center; margin-top: 8px;">
              ${config.poweredByLink && config.poweredByLink.trim() ? 
                `<a href="${config.poweredByLink}" target="_blank" style="color: #1d4ed8; text-decoration: none; font-size: 11px; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${config.poweredByText}</a>` :
                `<span style="color: #6b7280; font-size: 11px;">${config.poweredByText}</span>`
              }
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Setup event listeners
    setupEventListeners();
  }

  // Setup event listeners
  function setupEventListeners() {
    const input = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    // Send message on button click
    sendButton.addEventListener('click', handleSendMessage);

    // Send message on Enter key
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  // Handle sending a message
  async function handleSendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message || isLoading) return;

    // Add user message to chat
    addMessage(message, 'user');
    input.value = '';
    messageCount++;
    
    // Track manual messages (not from suggestions)
    if (!conversationContext.usingSuggestions) {
      manualMessageCount++;
    }
    
    // Reset suggestion flag for next message
    conversationContext.usingSuggestions = false;

    // Show suggestions after first message if configured
    if (messageCount === 1) {
      showSuggestedQuestions('after_first_message');
    }

    // Show loading state
    setLoading(true);
    addTypingIndicator();

    try {
      // Send message to API with context
      const response = await fetch(`${config.apiUrl}/api/chat/${config.chatbotId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message, 
          context: {
            ...conversationContext,
            messageCount: messageCount,
            manualMessageCount: manualMessageCount
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Remove typing indicator
      removeTypingIndicator();
      
      // Check if we should show lead collection form
      if (data.type === 'form' || data.shouldCollectLead) {
        addLeadForm(data.message || data.response || 'To help you better, may I have your contact information?');
        conversationContext.leadCollected = true;
      } else {
        addMessage(data.message || data.response || 'I\'m here to help!', 'bot');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      removeTypingIndicator();
      addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    } finally {
      setLoading(false);
    }
  }

  // Add a message to the chat
  function addMessage(content, sender) {
    const messagesContainer = document.getElementById('messages-container');
    const messageDiv = document.createElement('div');
    
    const isBot = sender === 'bot';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.style.cssText = `
      display: flex;
      ${isBot ? 'justify-content: flex-start' : 'justify-content: flex-end'};
      margin-bottom: 12px;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    `;
    
    const botAvatar = config.chatWindowAvatar || config.chatBubbleIcon;
    
    messageDiv.innerHTML = `
      <div style="display: flex; gap: 8px; align-items: flex-start; ${isBot ? '' : 'flex-direction: row-reverse;'}">
        ${isBot ? `
          <div style="width: 32px; height: 32px; border-radius: 50%; background: ${config.primaryColor || '#6366F1'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${botAvatar && botAvatar.trim() ? 
              `<img src="${botAvatar}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" alt="Bot" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="display: none;">
                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                 <circle cx="12" cy="7" r="4"></circle>
               </svg>` : 
              `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                 <circle cx="12" cy="7" r="4"></circle>
               </svg>`
            }
          </div>
        ` : ''}
        <div class="rankved-msg-bubble" style="
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          ${isBot 
            ? `background: white; color: #374151; border-bottom-left-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;` 
            : `background: ${config.primaryColor || '#6366F1'}; color: white; border-bottom-right-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);`
          }
          line-height: 1.4;
          word-wrap: break-word;
          position: relative;
        ">
          <div style="white-space: pre-wrap;">${content.replace(/\n/g, '<br>')}</div>
          <div style="font-size: 11px; opacity: 0.7; margin-top: 4px;">${timestamp}</div>
        </div>
      </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // Animate message appearance
    requestAnimationFrame(() => {
      messageDiv.style.opacity = '1';
      messageDiv.style.transform = 'translateY(0)';
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Add typing indicator
  function addTypingIndicator() {
    const messagesContainer = document.getElementById('messages-container');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    
    typingDiv.style.cssText = `
      display: flex;
      justify-content: flex-start;
      margin-bottom: 8px;
    `;
    
    typingDiv.innerHTML = `
      <div style="
        padding: 12px 16px;
        border-radius: 16px;
        border-bottom-left-radius: 4px;
        background: #f3f4f6;
        color: #374151;
        font-size: 14px;
      ">
        <div style="display: flex; gap: 4px; align-items: center;">
          <span>Typing</span>
          <div style="display: flex; gap: 2px;">
            <div style="width: 4px; height: 4px; background: #9ca3af; border-radius: 50%; animation: typing 1.4s infinite ease-in-out;"></div>
            <div style="width: 4px; height: 4px; background: #9ca3af; border-radius: 50%; animation: typing 1.4s infinite ease-in-out 0.2s;"></div>
            <div style="width: 4px; height: 4px; background: #9ca3af; border-radius: 50%; animation: typing 1.4s infinite ease-in-out 0.4s;"></div>
          </div>
        </div>
      </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add typing animation CSS
    if (!document.getElementById('typing-styles')) {
      const style = document.createElement('style');
      style.id = 'typing-styles';
      style.textContent = `
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-10px); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Remove typing indicator
  function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  // Set loading state
  function setLoading(loading) {
    isLoading = loading;
    const sendButton = document.getElementById('send-button');
    const input = document.getElementById('message-input');
    
    if (sendButton) {
      sendButton.disabled = loading;
      sendButton.textContent = loading ? 'Sending...' : 'Send';
      sendButton.style.opacity = loading ? '0.6' : '1';
    }
    
    if (input) {
      input.disabled = loading;
    }
  }

  // Show suggested questions based on timing configuration
  // Show question flow node
  function showQuestionNode(node) {
    if (!node) return;
    
    const messagesContainer = document.querySelector('#chat-messages');
    if (!messagesContainer) return;
    
    // Add the question as a bot message
    setTimeout(() => {
      addMessage(node.question, 'bot');
      
      // Handle different node types
      if (node.type === 'multiple-choice' && node.options) {
        // Create option buttons
        const optionsHtml = node.options.map(option => 
          `<button onclick="handleFlowOption('${option.nextId}', '${option.text.replace(/'/g, "\\'")}', '${node.id}')" 
                   style="display: block; width: 100%; margin: 4px 0; padding: 8px 12px; 
                          background: white; border: 1px solid #e2e8f0; border-radius: 6px; 
                          cursor: pointer; text-align: left; transition: all 0.2s; font-size: 14px;"
                   onmouseover="this.style.backgroundColor='#f8fafc'; this.style.borderColor='${config.primaryColor || '#6366F1'}'"
                   onmouseout="this.style.backgroundColor='white'; this.style.borderColor='#e2e8f0'">
            ${option.text}
           </button>`
        ).join('');
        
        // Add options to chat
        const optionsDiv = document.createElement('div');
        optionsDiv.innerHTML = `
          <div class="question-options" style="margin: 8px 0; padding: 8px;">
            ${optionsHtml}
          </div>
        `;
        messagesContainer.appendChild(optionsDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
      } else if (node.type === 'contact-form') {
        // Show lead collection form
        setTimeout(() => {
          addLeadForm("Please share your contact details:");
        }, 800);
      }
    }, 600);
  }
  
  // Handle flow option selection
  window.handleFlowOption = function(nextId, optionText, currentNodeId) {
    // Add user's choice as a message
    addMessage(optionText, 'user');
    
    // Remove option buttons
    const optionsDiv = document.querySelector('.question-options');
    if (optionsDiv && optionsDiv.parentElement) {
      optionsDiv.parentElement.remove();
    }
    
    // Find and show next node
    if (nextId && config.questionFlow && config.questionFlow.nodes) {
      const nextNode = config.questionFlow.nodes.find(node => node.id === nextId);
      if (nextNode) {
        showQuestionNode(nextNode);
      }
    }
  };

  function showSuggestedQuestions(trigger = 'manual') {
    if (!config.suggestionButtons || suggestionsShown) return;
    
    // Check if we should show suggestions based on timing configuration
    const timing = config.suggestionTiming || 'initial';
    if (timing === 'manual' || (timing !== trigger && trigger !== 'manual')) return;
    
    try {
      const suggestions = JSON.parse(config.suggestionButtons);
      if (!suggestions || suggestions.length === 0) return;
      
      const container = document.getElementById('suggestions-container');
      const list = document.getElementById('suggestions-list');
      
      if (!container || !list) return;
      
      list.innerHTML = '';
      suggestions.forEach(suggestion => {
        const button = document.createElement('button');
        button.textContent = suggestion;
        button.className = 'rankved-suggestion-btn';
        button.style.cssText = `
          background: white;
          border: 1px solid #d1d5db;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        `;
        
        button.addEventListener('mouseenter', () => {
          button.style.background = '#f3f4f6';
        });
        
        button.addEventListener('mouseleave', () => {
          button.style.background = 'white';
        });
        
        button.addEventListener('click', () => {
          const input = document.getElementById('message-input');
          input.value = suggestion;
          conversationContext.usingSuggestions = true;
          handleSendMessage();
          handleSuggestionClick();
        });
        
        list.appendChild(button);
      });
      
      container.style.display = 'block';
      suggestionsShown = true;
      
      // Handle timeout behavior
      const persistence = config.suggestionPersistence || 'until_clicked';
      if (persistence === 'hide_after_timeout') {
        const timeout = config.suggestionTimeout || 30000;
        suggestionTimeout = setTimeout(() => {
          hideSuggestedQuestions();
        }, timeout);
      }
    } catch (error) {
      console.error('Error parsing suggestion buttons:', error);
    }
  }

  // Hide suggested questions
  function hideSuggestedQuestions() {
    const container = document.getElementById('suggestions-container');
    if (container) {
      container.style.display = 'none';
    }
    if (suggestionTimeout) {
      clearTimeout(suggestionTimeout);
      suggestionTimeout = null;
    }
  }

  // Handle suggestion click behavior
  function handleSuggestionClick() {
    const persistence = config.suggestionPersistence || 'until_clicked';
    if (persistence === 'until_clicked') {
      hideSuggestedQuestions();
    }
  }

  // Add a lead collection form
  function addLeadForm(message) {
    const messagesContainer = document.getElementById('messages-container');
    const formDiv = document.createElement('div');
    
    formDiv.style.cssText = `
      display: flex;
      justify-content: flex-start;
      margin-bottom: 12px;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    `;
    
    const botAvatar = config.chatWindowAvatar || config.chatBubbleIcon;
    
    formDiv.innerHTML = `
      <div style="display: flex; gap: 8px; align-items: flex-start;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${config.primaryColor || '#6366F1'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          ${botAvatar && botAvatar.trim() ? 
            `<img src="${botAvatar}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" alt="Bot" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="display: none;">
               <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
               <circle cx="12" cy="7" r="4"></circle>
             </svg>` : 
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
               <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
               <circle cx="12" cy="7" r="4"></circle>
             </svg>`
          }
        </div>
        <div style="
          max-width: 80%;
          padding: 16px;
          border-radius: 18px;
          background: white;
          color: #374151;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
          font-size: 14px;
          line-height: 1.4;
        ">
          <div style="margin-bottom: 12px; white-space: pre-wrap;">${message}</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <input 
              id="lead-name" 
              type="text" 
              placeholder="Your name" 
              style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; outline: none;"
            >
            <input 
              id="lead-phone" 
              type="tel" 
              placeholder="Phone number" 
              style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; outline: none;"
            >
            <input 
              id="lead-email" 
              type="email" 
              placeholder="Email address (optional)" 
              style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; outline: none;"
            >
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <input type="checkbox" id="lead-consent" style="margin: 0;">
              <label for="lead-consent" style="font-size: 12px; color: #6b7280;">I agree to be contacted</label>
            </div>
            <button 
              id="submit-lead" 
              style="
                background: ${config.primaryColor || '#6366F1'}; 
                color: white; 
                border: none; 
                padding: 10px 16px; 
                border-radius: 8px; 
                font-size: 13px; 
                cursor: pointer; 
                margin-top: 8px;
                opacity: 0.5;
              "
              disabled
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    `;
    
    messagesContainer.appendChild(formDiv);
    
    // Animate form appearance
    requestAnimationFrame(() => {
      formDiv.style.opacity = '1';
      formDiv.style.transform = 'translateY(0)';
    });
    
    // Setup form validation
    const nameInput = formDiv.querySelector('#lead-name');
    const phoneInput = formDiv.querySelector('#lead-phone');
    const emailInput = formDiv.querySelector('#lead-email');
    const consentInput = formDiv.querySelector('#lead-consent');
    const submitButton = formDiv.querySelector('#submit-lead');
    
    function validateForm() {
      const isValid = nameInput.value.trim() && phoneInput.value.trim() && consentInput.checked;
      submitButton.disabled = !isValid;
      submitButton.style.opacity = isValid ? '1' : '0.5';
    }
    
    nameInput.addEventListener('input', validateForm);
    phoneInput.addEventListener('input', validateForm);
    consentInput.addEventListener('change', validateForm);
    
    submitButton.addEventListener('click', async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/chat/${config.chatbotId}/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            email: emailInput.value.trim() || null,
            source: 'chat_widget'
          })
        });
        
        if (response.ok) {
          // Replace form with thank you message
          formDiv.innerHTML = `
            <div style="display: flex; gap: 8px; align-items: flex-start;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: ${config.primaryColor || '#6366F1'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
              </div>
              <div style="
                max-width: 80%;
                padding: 12px 16px;
                border-radius: 18px;
                background: #dcfce7;
                color: #166534;
                border-bottom-left-radius: 4px;
                font-size: 14px;
                line-height: 1.4;
              ">
                Thank you! We'll be in touch soon.
              </div>
            </div>
          `;
        }
      } catch (error) {
        console.error('Error submitting lead:', error);
      }
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Expose global interface
  window.ChatBotWidget = {
    init: function(userConfig) {
      // Merge user config with defaults
      Object.assign(config, {
        chatbotId: userConfig.chatbotId,
        primaryColor: userConfig.primaryColor || '#6366F1',
        position: userConfig.position || 'bottom-right',
        apiUrl: window.location.origin,
        welcomeMessage: 'Hello! How can I help you today?',
        placeholder: 'Type your message...'
      }, userConfig);
      
      // Initialize when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    }
  };

})();