(function () {
  'use strict';

  // Inject scoped animation styles
  function injectStyles() {
    if (document.getElementById('rankved-chat-anim-style')) return;
    const style = document.createElement('style');
    style.id = 'rankved-chat-anim-style';
    style.textContent = `
      @keyframes rankved-bubble-pop {
        0% { transform: scale(0.5); opacity: 0; }
        80% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes rankved-window-in {
        0% { transform: scale(0.8) translateY(40px); opacity: 0; }
        100% { transform: scale(1) translateY(0); opacity: 1; }
      }
      @keyframes rankved-window-out {
        0% { transform: scale(1) translateY(0); opacity: 1; }
        100% { transform: scale(0.8) translateY(40px); opacity: 0; }
      }
      @keyframes rankved-dot-bounce {
        0% { transform: translateY(0); }
        100% { transform: translateY(-6px); }
      }
      #rankved-chat-bubble[data-rankved-widget] {
        animation: rankved-bubble-pop 0.5s cubic-bezier(.5,1.8,.5,1) 0.1s both;
      }
      #rankved-chat-window[data-rankved-widget] {
        animation: rankved-window-in 0.35s cubic-bezier(.5,1.8,.5,1) 0s both;
      }
      #rankved-chat-window[data-rankved-closing] {
        animation: rankved-window-out 0.25s cubic-bezier(.5,1.8,.5,1) 0s both;
      }
    `;
    document.head.appendChild(style);
  }
  // Only get chatbotId and apiUrl from window.CHATBOT_CONFIG
  let config = {
    chatbotId: window.CHATBOT_CONFIG?.chatbotId,
    apiUrl: window.CHATBOT_CONFIG?.apiUrl
  };

  let isOpen = false;
  let bubble = null;
  let chatWindow = null;
  let configLoaded = false;
  async function fetchChatbotConfig() {
    if (!config.chatbotId) {
      console.warn('[RankVed Chat] chatbotId missing at fetchChatbotConfig. window.CHATBOT_CONFIG:', window.CHATBOT_CONFIG);
      return;
    }
    let baseUrl = (typeof window !== 'undefined' && window.VITE_API_URL) ? window.VITE_API_URL : (config.apiUrl || window.location.origin);
    try {
      const res = await fetch(`${baseUrl}/api/chatbots/${config.chatbotId}/public`);
      if (res.ok) {
        config = await res.json();
        // Ensure chatbotId is always present
        if (config.id && !config.chatbotId) {
          config.chatbotId = config.id;
        }
        // Ensure apiUrl is always set from window.CHATBOT_CONFIG if present
        if (window.CHATBOT_CONFIG && window.CHATBOT_CONFIG.apiUrl) {
          config.apiUrl = window.CHATBOT_CONFIG.apiUrl;
        }
        // --- Robustly parse questionFlow ---
        if (typeof config.questionFlow === 'string') {
          try {
            config.questionFlow = JSON.parse(config.questionFlow);
          } catch (e) {
            config.questionFlow = undefined;
          }
        }
        // If questionFlow is an array, wrap as object
        if (Array.isArray(config.questionFlow)) {
          config.questionFlow = { nodes: config.questionFlow };
        }
        // If questionFlow is an object but nodes is a string, parse it
        if (config.questionFlow && typeof config.questionFlow.nodes === 'string') {
          try {
            config.questionFlow.nodes = JSON.parse(config.questionFlow.nodes);
          } catch (e) {
            config.questionFlow.nodes = [];
          }
        }
        // Debug log for question flow
        // console.log('[RankVed Chat] After config fetch: questionFlowEnabled:', config.questionFlowEnabled, 'questionFlow:', config.questionFlow);
        // If no flow, add a default for testing
        if (!config.questionFlow || !Array.isArray(config.questionFlow.nodes) || config.questionFlow.nodes.length === 0) {
          config.questionFlowEnabled = true;
          config.questionFlow = {
            nodes: [
              { id: 'start', type: 'statement', question: 'This is a default flow. How can I help you?', nextId: 'end' },
              { id: 'end', type: 'statement', question: 'Thank you for using the chatbot!' }
            ]
          };
          console.log('[RankVed Chat] No question flow found. Injected default flow:', config.questionFlow);
        }
        configLoaded = true;
      } else {
        showError('Failed to load chatbot config.');
      }
    } catch (e) {
      showError('Failed to load chatbot config.');
    }
  }
  // Sound effect for open/close
  function playOpenCloseSound() {
    console.log(config.enableNotificationSound)
    if (!config.enableNotificationSound) return;
    try {
      const audio = new Audio('https://rank-ved-frontend-rfam.vercel.app/openclose.mp3');
      audio.currentTime = 0;
      audio.play();
    } catch (e) {
      console.log(e)
    }
  }

  // Fetch chatbot config from backend


  function showError(msg) {
    // Remove bubble if present
    if (bubble) bubble.remove();
    // Show error as a fixed banner
    const err = document.createElement('div');
    err.setAttribute('style', 'position:fixed;bottom:24px;right:24px;background:#ef4444;color:#fff;padding:16px 24px;border-radius:12px;z-index:2147483647;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,0.15);');
    err.textContent = msg;
    document.body.appendChild(err);
    setTimeout(() => err.remove(), 8000);
  }

  // Helper: Get appearance values from config with fallback (matching chat preview)
  function getAppearance() {
    const theme = config.chatWindowTheme || config.theme || 'light';
    const borderRadius = Number(config.borderRadius) || 12;
    const shadowStyle = config.shadowStyle || 'soft';
    const chatWindowStyle = config.chatWindowStyle || 'modern';
    let primaryColor = config.primaryColor || '#6366F1';
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(primaryColor)) primaryColor = '#6366F1';
    
    // Enhanced background colors based on theme and style (matching preview)
    let backgroundColor = theme === 'dark'
      ? 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)';
    
    // Style-specific backgrounds (matching preview exactly)
    if (chatWindowStyle === 'modern') {
      backgroundColor = theme === 'dark'
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)'
        : 'linear-gradient(135deg, rgb(252 243 255 / 90%) 0%, rgb(229 242 255 / 80%) 100%)';
    } else if (chatWindowStyle === 'classic') {
      backgroundColor = theme === 'dark' ? '#1e293b' : '#ffffff';
    } else if (chatWindowStyle === 'minimal') {
      backgroundColor = theme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    } else if (chatWindowStyle === 'floating') {
      backgroundColor = theme === 'dark' ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)';
    }
    
    // Enhanced shadow styles (matching preview exactly)
    let boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
    if (shadowStyle === 'none') boxShadow = 'none';
    else if (shadowStyle === 'soft') boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
    else if (shadowStyle === 'medium') boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    else if (shadowStyle === 'strong') boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
    
    const textColor = theme === 'dark' ? '#fff' : '#333';
    const headerBg = primaryColor;
    const headerText = '#fff';
    
    // Enhanced input backgrounds (matching preview)
    let inputBg = theme === 'dark' 
      ? 'linear-gradient(250deg, #0e1a50 0%, #18181b 100%)'
      : 'linear-gradient(170deg, #e7ebff -1%, #c7c5ff 100%)';
    
    if (chatWindowStyle === 'minimal') {
      inputBg = theme === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)';
    } else if (chatWindowStyle === 'floating') {
      inputBg = theme === 'dark' ? 'rgba(51, 65, 85, 0.9)' : 'rgba(255, 255, 255, 0.95)';
    }
    
    const inputText = theme === 'dark' ? '#fff' : '#333';
    const inputBorder = theme === 'dark' ? '#6a739f' : '#d7adec';
    
    // Enhanced message backgrounds (matching preview exactly)
    let msgBg = theme === 'dark'
    ? 'linear-gradient(90deg, #23232a 0%, #2d2d3a 100%)'
    : 'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 100%)';
    if (chatWindowStyle === 'minimal') {
      msgBg = theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(255, 255, 255, 0.8)';
    } else if (chatWindowStyle === 'floating') {
      msgBg = theme === 'dark' ? 'rgba(51, 65, 85, 0.7)' : 'rgba(255, 255, 255, 0.9)';
    }
    
    const msgText = theme === 'dark' ? '#fff' : '#333';
    const userMsgBg = primaryColor;
    const userMsgText = '#fff';
    
    return {
      theme, borderRadius, shadowStyle, primaryColor, backgroundColor, boxShadow, textColor,
      headerBg, headerText, inputBg, inputText, inputBorder, msgBg, msgText, userMsgBg, userMsgText,
      chatWindowStyle
    };
  }

  // Create chat bubble
  function createChatBubble() {
    const a = getAppearance();
    const bubble = document.createElement('div');
    bubble.setAttribute('id', 'rankved-chat-bubble');
    bubble.setAttribute('data-rankved-widget', 'true');
    bubble.setAttribute('style', `
      position: fixed; bottom: 16px; right: 16px; width: 48px; height: 48px; border-radius: ${a.borderRadius * 2}px;
      background: ${a.primaryColor}; box-shadow: ${a.boxShadow};
      display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2147483647;
      transition: box-shadow 0.2s; border: none; outline: none; font-family: inherit; margin: 0; padding: 0;
    `);
    // Prefer chatWidgetIcon for the bubble, fallback to chatBubbleIcon, then default
    const iconSrc = config.chatBubbleIcon || config.chatWidgetIcon || config.bubbleIcon;
    bubble.innerHTML = iconSrc ?
      `<img src="${iconSrc}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; pointer-events: none;" alt="Chat Icon">` :
      `<svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>`;
    bubble.title = config.chatWidgetName || config.name || config.title || 'ChatBot';
    bubble.onclick = function () {
      if (isOpen) {
        closeChat();
      } else {
        openChat();
      }
    };
    return bubble;
  }

  // Create chat window (strict, minimal, no iframe)
  function createChatWindow() {
    const a = getAppearance();
    const win = document.createElement('div');
    win.setAttribute('id', 'rankved-chat-window');
    win.setAttribute('data-rankved-widget', 'true');
    
    // Apply theme, style, and shadow attributes for CSS targeting
    win.setAttribute('data-theme', a.theme);
    win.setAttribute('data-style', config.chatWindowStyle || 'modern');
    win.setAttribute('data-shadow', a.shadowStyle);
    
    win.setAttribute('style', `
      position: fixed; bottom: 16px; right: 16px; width: 320px; height: 440px; max-height: 80vh;
      border-radius: ${a.borderRadius}px; z-index: 2147483646;
      display: flex; flex-direction: column; overflow: hidden; font-family: inherit;
      margin: 0; padding: 0; opacity: 1; transform: scale(1) translateY(0);
      color: ${a.textColor}; background: ${a.backgroundColor}; box-shadow: ${a.boxShadow};
      border: 1px solid ${a.inputBorder};
    `);
    // Prefer chatWidgetIcon for the header, fallback to chatWindowAvatar, then default SVG
    let headerIcon = config.chatWidgetIcon || config.chatWindowAvatar || config.chatBubbleIcon || config.bubbleIcon;
    let headerIconHTML = '';
    if (headerIcon) {
      headerIconHTML = `<img src="${headerIcon}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 2px 8px rgba(0,0,0,0.15);">`;
    } else {
      headerIconHTML = `<span style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 2px 8px rgba(0,0,0,0.15);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="7" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span>`;
    }
    // Online status
    const onlineStatus = `<span style="display: flex; align-items: center; gap: 4px; font-size: 12px; margin-left: 4px;"><span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 4px rgba(34, 197, 94, 0.5);"></span><span style="color: rgba(209, 250, 229, 0.9);">Online</span></span>`;
    win.innerHTML = `
      <div style="background: ${a.primaryColor}; color: ${a.headerText}; padding: 10px; display: flex; align-items: center; justify-content: space-between; border-radius: ${a.borderRadius}px ${a.borderRadius}px 0 0; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
        <div style="display: flex; align-items: center; gap: 8px; min-width: 0; position: relative; z-index: 2;">
          ${headerIconHTML}
          <div style="display: flex; flex-direction: column; gap:3px; min-width: 0;">
            <span style="font-size: 14px; font-weight: 600; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">${config.chatWidgetName || config.name || config.title || 'ChatBot'}</span>
            ${onlineStatus}
          </div>
        </div>
        <button id="rankved-close-btn" style="background: none; border: none; color: ${a.headerText}; font-size: 20px; cursor: pointer; position: relative; z-index: 2; transition: all 0.2s ease-in-out; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: 300;">×</button>
      </div>
      <div id="rankved-messages" style="flex: 1; overflow-y: auto; padding: 10px 8px 0 8px; color: ${a.msgText}; display: flex; flex-direction: column; gap: 8px; background: ${a.backgroundColor}; border-bottom-left-radius: ${a.borderRadius}px; border-bottom-right-radius: ${a.borderRadius}px; scroll-behavior: smooth; -webkit-overflow-scrolling: touch;">
        <!-- Welcome message removed; will be added by JS only -->
      </div>
      <div style="padding: 6px 8px 4px 8px; border-top: 2px solid ${a.inputBorder}; border-bottom-left-radius: ${a.borderRadius}px; border-bottom-right-radius: ${a.borderRadius}px; position: relative; overflow: hidden; background: ${a.inputBg}; box-shadow: ${a.theme === 'dark' ? '0 2px 8px rgba(30,41,59,0.12)' : '0 2px 8px rgba(100,116,139,0.08)'};">
        <div style="display: flex; gap: 6px; align-items: center; position: relative; z-index: 2;">
                      <input id="rankved-input" placeholder="${config.inputPlaceholder || config.placeholder || 'Type your message...'}" style="flex: 1; border: 1px solid ${a.inputBorder}; border-radius: 10px; padding: 4px 8px; font-size: 13px; outline: none; color: ${a.inputText}; height: 32px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.04); transition: all 0.2s ease-in-out; background: ${a.theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)'};">
                      <button id="rankved-send-btn" style="width: 32px; padding:0; height: 32px; border-radius: 10px; background: ${a.primaryColor}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease-in-out; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/></svg>
          </button>
        </div>
        <div id="rankved-suggestions" style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 6px;"></div>
        <div style="text-align: center; padding: 2px 0 0 0; font-size: 11px; color: ${a.theme === 'dark' ? '#94a3b8' : '#64748b'}; background: none; position: relative; z-index: 2;">
          ${config.poweredByText ? `<span>${config.poweredByLink ? `<a href="${config.poweredByLink}" target="_blank" style="color: ${a.primaryColor}; text-decoration: none; transition: all 0.2s ease-in-out;">${config.poweredByText}</a>` : config.poweredByText}</span>` : `Powered by <a href="https://rankved.com" target="_blank" style="color: ${a.primaryColor}; text-decoration: none; transition: all 0.2s ease-in-out;">RankVed</a>`}
        </div>
      </div>
    `;
    return win;
  }

  // Helper function for smooth scrolling
  function scrollToBottom(container) {
    if (!container) return;
    // Use requestAnimationFrame for smooth scrolling
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
    // Also try again after a small delay to ensure content is rendered
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 50);
  }

  // Add message to chat
  function addMessage(content, sender) {
    const a = getAppearance();
    const messagesContainer = document.getElementById('rankved-messages');
    if (!messagesContainer) return;
    const messageDiv = document.createElement('div');
    if (sender === 'user') {
      messageDiv.setAttribute('style', `margin-bottom: 3px; display: flex; justify-content: flex-end;`);
      const contentDiv = document.createElement('div');
      // Sharp bottom-right corner for user
      contentDiv.setAttribute('style', `max-width: 70%; padding: 5px 10px; border-radius: 14px 14px 4px 14px; font-size: 11px; background: ${a.userMsgBg}; color: ${a.userMsgText}; box-shadow: 0 2px 6px rgba(0,0,0,0.10); transition: all 0.2s ease-in-out;`);
      contentDiv.textContent = content;
      messageDiv.appendChild(contentDiv);
    } else {
      messageDiv.setAttribute('style', `margin-bottom: 3px; display: flex; justify-content: flex-start; align-items: flex-start; gap: 5px;`);
      const avatarDiv = document.createElement('div');
      let botIcon = config.chatWindowAvatar || config.chatWidgetIcon;
      if (botIcon) {
        avatarDiv.innerHTML = `<img src="${botIcon}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.2); box-shadow: 0 1px 3px rgba(0,0,0,0.1);">`;
      } else {
        avatarDiv.innerHTML = `<span style=\"display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: ${a.primaryColor}; border: 2px solid rgba(255,255,255,0.2); box-shadow: 0 1px 3px rgba(0,0,0,0.1);\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"11\" width=\"18\" height=\"7\" rx=\"2\"/><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"/></svg></span>`;
      }
      messageDiv.appendChild(avatarDiv);
      const contentDiv = document.createElement('div');
      // Sharp bottom-left corner for bot
      contentDiv.setAttribute('style', `max-width: 70%; padding: 5px 10px; border-radius: 14px 14px 14px 4px; font-size: 11px; background: ${a.msgBg}; color: ${a.msgText}; box-shadow: 0 1px 1px 0px rgb(0 0 0 / 30%); transition: all 0.2s ease-in-out;`);
      contentDiv.textContent = content;
      messageDiv.appendChild(contentDiv);
    }
    messagesContainer.appendChild(messageDiv);
    
    // Use helper function for consistent scroll behavior
    scrollToBottom(messagesContainer);
  }

  // Show suggestion buttons if present
  function showSuggestions() {
    const suggestions = config.suggestionButtons;
    const container = document.getElementById('rankved-suggestions');
    if (!container) return;
    container.innerHTML = '';
    if (Array.isArray(suggestions) && suggestions.length > 0) {
      suggestions.forEach((text) => {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.setAttribute('style', `background: ${getAppearance().primaryColor}; color: #fff; border: none; border-radius: 6px; padding: 6px 12px; font-size: 13px; cursor: pointer; margin: 0;`);
        btn.onclick = function () {
          addMessage(text, 'user');
          if (config.suggestionPersistence !== 'always_visible') btn.style.display = 'none';
        };
        container.appendChild(btn);
      });
    }
  }

  // --- Question Flow State ---
  let questionFlowState = {
    currentNodeId: null,
    history: [],
    userInputs: {},
    awaitingOpenEnded: null, // New state variable for open-ended node
  };

  function resetQuestionFlow() {
    questionFlowState = {
      currentNodeId: null,
      history: [],
      userInputs: {},
      awaitingOpenEnded: null,
    };
  }

  function renderQuestionNode(node) {
    const messagesContainer = document.getElementById('rankved-messages');
    if (!messagesContainer || !node) return;
    addMessage(node.question, 'bot');
    // Track flow history
    questionFlowState.history.push(node.id);
    // Remove any previous options/input
    const oldOptions = document.getElementById('rankved-flow-options');
    if (oldOptions) oldOptions.remove();
    const oldInput = document.getElementById('rankved-flow-input');
    if (oldInput) oldInput.remove();
    // Handle node types
    if (node.type === 'multiple-choice' && node.options && node.options.length > 0) {
      const optionsDiv = document.createElement('div');
      optionsDiv.id = 'rankved-flow-options';
      optionsDiv.style.margin = '4px 0';
      optionsDiv.style.display = 'flex';
      optionsDiv.style.flexDirection = 'column';
      optionsDiv.style.gap = '3px';
      node.options.forEach(option => {
        const btn = document.createElement('button');
        btn.textContent = option.text;
        btn.style.background = getAppearance().primaryColor;
        btn.style.color = '#fff';
        btn.style.border = 'none';
        btn.style.width = '60%';
        btn.style.alignSelf = 'flex-start';
        btn.style.borderRadius = '14px 14px 4px 14px';
        btn.style.padding = '6px 10px';
        btn.style.fontSize = '11px';
        btn.style.cursor = 'pointer';
        btn.onclick = function () {
          addMessage(option.text, 'user');
          // Track user input
          questionFlowState.userInputs[node.id] = option.text;
          questionFlowState.currentNodeId = node.id;
          if (option.action === 'collect-lead') {
            if (config.leadCollectionEnabled) {
              addMessage('Thank you! Please provide your contact information so we can help you better.', 'bot');
              optionsDiv.remove();
              renderLeadForm();
            } else {
              addMessage('Is there anything we can help you with?', 'bot');
              optionsDiv.remove();
            }
            return;
          }
          if (option.action === 'end-chat') {
            addMessage('Thank you for using our service! Have a great day!', 'bot');
            optionsDiv.remove();
            return;
          }
          if (option.nextId) {
            optionsDiv.remove();
            const nextNode = config.questionFlow.nodes.find(n => n.id === option.nextId);
            if (nextNode) {
              questionFlowState.currentNodeId = nextNode.id;
              setTimeout(() => renderQuestionNode(nextNode), 500);
            }
          }
        };
        optionsDiv.appendChild(btn);
      });
      messagesContainer.appendChild(optionsDiv);
      scrollToBottom(messagesContainer);
    } else if (node.type === 'open-ended') {
      // Instead of rendering a custom input, set a flag to use the main chat input
      questionFlowState.awaitingOpenEnded = node;
      // Optionally, visually indicate to the user to answer below (could highlight input, etc.)
    } else if (node.type === 'contact-form' && config.leadCollectionEnabled) {
      const inputDiv = document.createElement('div');
      inputDiv.id = 'rankved-flow-input';
      inputDiv.style.margin = '8px 0';
      inputDiv.style.display = 'flex';
      inputDiv.style.flexDirection = 'column';
      inputDiv.style.gap = '6px';
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.placeholder = 'Your Name';
      nameInput.style.setProperty('padding', '6px 12px', 'important');
      nameInput.style.setProperty('border-radius', '6px', 'important');
      nameInput.style.setProperty('border', '1px solid #e2e8f0', 'important');
      nameInput.style.setProperty('font-size', '11px', 'important');
      nameInput.style.setProperty('background', '#fff', 'important');
      nameInput.style.setProperty('color', '#222', 'important');
      nameInput.style.setProperty('outline', 'none', 'important');
      nameInput.style.setProperty('box-shadow', '0 1px 2px rgba(0,0,0,0.04)', 'important');
      nameInput.style.setProperty('margin', '0', 'important');
      nameInput.style.setProperty('width', '90%', 'important');
      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.placeholder = 'Your Email';
      emailInput.style.setProperty('padding', '6px 12px', 'important');
      emailInput.style.setProperty('border-radius', '6px', 'important');
      emailInput.style.setProperty('border', '1px solid #e2e8f0', 'important');
      emailInput.style.setProperty('font-size', '11px', 'important');
      emailInput.style.setProperty('background', '#fff', 'important');
      emailInput.style.setProperty('color', '#222', 'important');
      emailInput.style.setProperty('outline', 'none', 'important');
      emailInput.style.setProperty('box-shadow', '0 1px 2px rgba(0,0,0,0.04)', 'important');
      emailInput.style.setProperty('margin', '0', 'important');
      emailInput.style.setProperty('width', '90%', 'important');
      const phoneInput = document.createElement('input');
      phoneInput.type = 'tel';
      phoneInput.placeholder = 'Your Mobile Number';
      phoneInput.style.setProperty('padding', '6px 12px', 'important');
      phoneInput.style.setProperty('border-radius', '6px', 'important');
      phoneInput.style.setProperty('border', '1px solid #e2e8f0', 'important');
      phoneInput.style.setProperty('font-size', '11px', 'important');
      phoneInput.style.setProperty('background', '#fff', 'important');
      phoneInput.style.setProperty('color', '#222', 'important');
      phoneInput.style.setProperty('outline', 'none', 'important');
      phoneInput.style.setProperty('box-shadow', '0 1px 2px rgba(0,0,0,0.04)', 'important');
      phoneInput.style.setProperty('margin', '0', 'important');
      phoneInput.style.setProperty('width', '90%', 'important');
      // Add consent checkbox
      const consentDiv = document.createElement('div');
      consentDiv.style.setProperty('display', 'flex', 'important');
      consentDiv.style.setProperty('align-items', 'center', 'important');
      consentDiv.style.setProperty('gap', '8px', 'important');
      consentDiv.style.setProperty('margin', '0', 'important');
      consentDiv.style.setProperty('padding', '0', 'important');
      const consentCheckbox = document.createElement('input');
      consentCheckbox.type = 'checkbox';
      consentCheckbox.id = 'rankved-consent-checkbox';
      const consentLabel = document.createElement('label');
      consentLabel.htmlFor = 'rankved-consent-checkbox';
      consentLabel.textContent = 'I consent to be contacted.';
      consentLabel.style.setProperty('font-size', '11px', 'important');
      consentLabel.style.setProperty('color', '#222', 'important');
      consentLabel.style.setProperty('margin', '0', 'important');
      consentLabel.style.setProperty('padding', '0', 'important');
      consentDiv.appendChild(consentCheckbox);
      consentDiv.appendChild(consentLabel);
      const sendBtn = document.createElement('button');
      sendBtn.textContent = 'Send';
      sendBtn.style.setProperty('background', getAppearance().primaryColor, 'important');
      sendBtn.style.setProperty('color', '#fff', 'important');
      sendBtn.style.setProperty('border', 'none', 'important');
      sendBtn.style.setProperty('border-radius', '10px', 'important');
      sendBtn.style.setProperty('padding', '6px 10px', 'important');
      sendBtn.style.setProperty('font-size', '14px', 'important');
      sendBtn.style.setProperty('cursor', 'pointer', 'important');
      sendBtn.style.setProperty('margin', '0', 'important');
      sendBtn.style.setProperty('width', '100%', 'important');
      sendBtn.onclick = async function () {
        if (!nameInput.value.trim() || !emailInput.value.trim() || !phoneInput.value.trim() || !consentCheckbox.checked) return;
        addMessage(`Name: ${nameInput.value}, Email: ${emailInput.value}, Phone: ${phoneInput.value}, Consent: Yes`, 'user');
        sendBtn.disabled = true;
        // --- Send lead data to backend (public endpoint) ---
        try {
          let apiUrl =
            (typeof window !== 'undefined' && window.VITE_API_URL) ? window.VITE_API_URL
              : (config.apiUrl || (window.CHATBOT_CONFIG && window.CHATBOT_CONFIG.apiUrl) || window.location.origin);
          const chatbotId = config.chatbotId || (window.CHATBOT_CONFIG && window.CHATBOT_CONFIG.chatbotId);
          if (!chatbotId) {
            addMessage('Chatbot ID is missing. Please refresh the page.', 'bot');
            return;
          }
          // Build context from questionFlowState (add more if needed)
          const context = { questionFlowState };
          const res = await fetch(apiUrl + '/api/chat/' + chatbotId + '/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: nameInput.value,
              email: emailInput.value,
              phone: phoneInput.value,
              consentGiven: consentCheckbox.checked,
              source: 'chat_widget',
              conversationContext: context // <-- send context here
            })
          });
          if (res.ok) {
            addMessage('Thank you! Our team will contact you soon.', 'bot');
          } else {
            addMessage('Failed to submit your info. Please try again later.', 'bot');
          }
        } catch (e) {
          addMessage('Failed to submit your info. Please try again later.', 'bot');
        }
      };
      inputDiv.appendChild(nameInput);
      inputDiv.appendChild(emailInput);
      inputDiv.appendChild(phoneInput);
      inputDiv.appendChild(consentDiv);
      inputDiv.appendChild(sendBtn);
      messagesContainer.appendChild(inputDiv);
      scrollToBottom(messagesContainer);
    }
    if (node.type === 'statement' && node.nextId) {
      setTimeout(() => {
        const nextNode = config.questionFlow.nodes.find(n => n.id === node.nextId);
        if (nextNode) {
          questionFlowState.currentNodeId = nextNode.id;
          renderQuestionNode(nextNode);
        }
      }, 900); // 900ms delay for smoothness
    }
  }

  // Open chat window with animation
  async function openChat() {
    // console.log("hello")
    playOpenCloseSound();
    if (isOpen) return;
    if (!configLoaded) {
      await fetchChatbotConfig();
      if (!configLoaded) return; // If still not loaded, abort
    }
    chatWindow = createChatWindow();
    document.body.appendChild(chatWindow);
    if (bubble) bubble.style.display = 'none';

    // Hide bubble when chat is open
    isOpen = true;
    // --- Show question flow if it exists, otherwise show welcome message ---
    // console.log('[RankVed Chat] openChat: questionFlowEnabled:', config.questionFlowEnabled, 'questionFlow:', config.questionFlow, bubble.style);
    // console.log()
    if (config.questionFlowEnabled && config.questionFlow && Array.isArray(config.questionFlow.nodes) && config.questionFlow.nodes.length > 0) {
      resetQuestionFlow();
      const startNode = config.questionFlow.nodes.find(n => n.id === 'start') || config.questionFlow.nodes[0];
      if (startNode) {
        questionFlowState.currentNodeId = startNode.id;
        setTimeout(() => renderQuestionNode(startNode), 500);
      }
    } else {
      addMessage(config.welcomeMessage || 'Hello! How can I help you today?', 'bot');
      showSuggestions();
    }
    chatWindow.querySelector('#rankved-close-btn').onclick = () => {
      closeChat();
      if (bubble) bubble.style.display = 'flex'; // Show bubble when chat is closed
    };
    chatWindow.querySelector('#rankved-send-btn').onclick = sendMessage;
    chatWindow.querySelector('#rankved-input').onkeydown = function (e) {
      if (e.key === 'Enter') sendMessage();
    };
  }

  // Close chat window with animation
  function closeChat() {
    playOpenCloseSound();
    if (chatWindow) {
      chatWindow.setAttribute('data-rankved-closing', 'true');
      setTimeout(() => {
        chatWindow.remove();
        chatWindow = null;
        isOpen = false;
        if (bubble) bubble.style.display = 'flex';
      }, 250);
    }
  }

  function showLoadingMessage() {
    const messagesContainer = document.getElementById('rankved-messages');
    if (!messagesContainer) return;
    // Remove any existing loading message
    const oldLoading = document.getElementById('rankved-loading-message');
    if (oldLoading) oldLoading.remove();
    // Add new loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'rankved-loading-message';
    loadingDiv.setAttribute('style', 'margin-bottom: 14px; display: flex; justify-content: flex-start; align-items: flex-start; gap: 8px;');
    loadingDiv.innerHTML = `
      <div style="width: 28px; height: 28px;"></div>
      <div style="max-width: 80%; padding: 10px 16px; border-radius: 12px; font-size: 14px; background: #f3f4f6; color: #333; box-shadow: 0 1px 2px rgba(0,0,0,0.08);">
        <span class="rankved-typing-dots" style="display: inline-block;">
          <span style="display:inline-block;width:6px;height:6px;background:#6366F1;border-radius:50%;margin-right:2px;animation:rankved-dot-bounce 1s infinite alternate;"></span>
          <span style="display:inline-block;width:6px;height:6px;background:#6366F1;border-radius:50%;margin-right:2px;animation:rankved-dot-bounce 1s 0.2s infinite alternate;"></span>
          <span style="display:inline-block;width:6px;height:6px;background:#6366F1;border-radius:50%;animation:rankved-dot-bounce 1s 0.4s infinite alternate;"></span>
        </span>
      </div>
    `;
    messagesContainer.appendChild(loadingDiv);
    scrollToBottom(messagesContainer);
  }

  function removeLoadingMessage() {
    const oldLoading = document.getElementById('rankved-loading-message');
    if (oldLoading) oldLoading.remove();
  }

  // Send message to backend
  async function sendMessage() {
    const input = chatWindow.querySelector('#rankved-input');
    const text = input.value.trim();
    if (!text) return;
    if (!config.chatbotId) {
      console.error('[RankVed Chat] chatbotId is missing at sendMessage. window.CHATBOT_CONFIG:', window.CHATBOT_CONFIG, 'config:', config);
      addMessage('Chatbot ID is missing. Please refresh the page.', 'bot');
      return;
    }
    // If waiting for open-ended node answer, handle it here
    if (questionFlowState.awaitingOpenEnded) {
      const node = questionFlowState.awaitingOpenEnded;
      addMessage(text, 'user');
      questionFlowState.userInputs[node.id] = text;
      questionFlowState.currentNodeId = node.id;
      input.value = '';
      questionFlowState.awaitingOpenEnded = null;
      showLoadingMessage();
      // Send to backend for AI response
      let context = {
        messageCount: (questionFlowState.history?.length || 0) + 1,
        manualMessageCount: (questionFlowState.history?.length || 0) + 1,
        isFlowBased: true,
        usingSuggestions: false,
        flowState: questionFlowState,
      };
      try {
        const res = await fetch(`${config.apiUrl || ''}/api/chat/${config.chatbotId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, context })
        });
        removeLoadingMessage();
        if (res.ok) {
          const data = await res.json();
          addMessage(data.message || '...', 'bot');
          // After AI response, show follow-up options if aiHandling is set
          if (node.aiHandling) {
            setTimeout(() => {
              // Show follow-up options
              const followUpDiv = document.createElement('div');
              followUpDiv.id = 'rankved-flow-options';
              followUpDiv.style.margin = '8px 0';
              followUpDiv.style.display = 'flex';
              followUpDiv.style.flexDirection = 'column';
              followUpDiv.style.gap = '6px';
              [
                { text: 'Tell me more', nextId: node.nextId },
                { text: 'Contact support', action: 'collect-lead' },
                { text: 'End chat', action: 'end-chat' }
              ].forEach(opt => {
                const btn = document.createElement('button');
                btn.textContent = opt.text;
                btn.style.background = getAppearance().primaryColor;
                btn.style.color = '#fff';
                btn.style.border = 'none';
                btn.style.borderRadius = '6px';
                btn.style.padding = '8px 12px';
                btn.style.fontSize = '14px';
                btn.style.cursor = 'pointer';
                btn.onclick = function () {
                  addMessage(opt.text, 'user');
                  questionFlowState.userInputs[node.id + '_followup'] = opt.text;
                  questionFlowState.currentNodeId = node.id;
                  if (opt.action === 'collect-lead') {
                    addMessage('Thank you! Please provide your contact information so we can help you better.', 'bot');
                    followUpDiv.remove();
                    renderLeadForm();
                    return;
                  }
                  if (opt.action === 'end-chat') {
                    addMessage('Thank you for using our service! Have a great day!', 'bot');
                    followUpDiv.remove();
                    return;
                  }
                  if (opt.nextId) {
                    followUpDiv.remove();
                    const nextNode = config.questionFlow.nodes.find(n => n.id === opt.nextId);
                    if (nextNode) {
                      questionFlowState.currentNodeId = nextNode.id;
                      setTimeout(() => renderQuestionNode(nextNode), 500);
                    }
                  }
                };
                followUpDiv.appendChild(btn);
              });
              const messagesContainer = document.getElementById('rankved-messages');
              messagesContainer.appendChild(followUpDiv);
              scrollToBottom(messagesContainer);
            }, 500);
          } else if (node.nextId) {
            const nextNode = config.questionFlow.nodes.find(n => n.id === node.nextId);
            if (nextNode) {
              questionFlowState.currentNodeId = nextNode.id;
              setTimeout(() => renderQuestionNode(nextNode), 500);
            }
          }
        } else {
          addMessage('Sorry, there was a problem. Please try again.', 'bot');
        }
      } catch (e) {
        removeLoadingMessage();
        addMessage('Sorry, there was a problem. Please try again.', 'bot');
      }
      return;
    }
    addMessage(text, 'user');
    input.value = '';
    showLoadingMessage(); // Show loading indicator
    // Build context for backend
    let context = {
      messageCount: (questionFlowState.history?.length || 0) + 1,
      manualMessageCount: (questionFlowState.history?.length || 0) + 1,
      isFlowBased: !!(config.questionFlowEnabled && config.questionFlow && Array.isArray(config.questionFlow.nodes) && config.questionFlow.nodes.length > 0),
      usingSuggestions: false,
      flowState: questionFlowState,
    };
    try {
      const res = await fetch(`${config.apiUrl || ''}/api/chat/${config.chatbotId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context })
      });
      removeLoadingMessage(); // Remove loading indicator
      if (res.ok) {
        const data = await res.json();
        if ((data.type === 'form' || data.shouldCollectLead) && config.leadCollectionEnabled) {
          renderLeadForm();
        } else {
          addMessage(data.message || '...', 'bot');
        }
      } else {
        addMessage('Sorry, there was a problem. Please try again.', 'bot');
      }
    } catch (e) {
      removeLoadingMessage(); // Remove loading indicator on error
      addMessage('Sorry, there was a problem. Please try again.', 'bot');
    }
  }

  // Render lead collection form (when backend says to collect lead)
  function renderLeadForm() {
    const messagesContainer = document.getElementById('rankved-messages');
    if (!messagesContainer) return;
    // Remove any previous input
    const oldInput = document.getElementById('rankved-flow-input');
    if (oldInput) oldInput.remove();
    const inputDiv = document.createElement('div');
    inputDiv.id = 'rankved-flow-input';
    inputDiv.style.margin = '8px 0';
    inputDiv.style.display = 'flex';
    inputDiv.style.flexDirection = 'column';
    inputDiv.style.gap = '6px';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Your Name';
    nameInput.style.setProperty('padding', '8px 12px', 'important');
    nameInput.style.setProperty('border-radius', '6px', 'important');
    nameInput.style.setProperty('border', '1px solid #e2e8f0', 'important');
    nameInput.style.setProperty('font-size', '14px', 'important');
    nameInput.style.setProperty('background', '#fff', 'important');
    nameInput.style.setProperty('color', '#222', 'important');
    nameInput.style.setProperty('outline', 'none', 'important');
    nameInput.style.setProperty('box-shadow', '0 1px 2px rgba(0,0,0,0.04)', 'important');
    nameInput.style.setProperty('margin', '0', 'important');
    nameInput.style.setProperty('width', '100%', 'important');
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'Your Email';
    emailInput.style.setProperty('padding', '8px 12px', 'important');
    emailInput.style.setProperty('border-radius', '6px', 'important');
    emailInput.style.setProperty('border', '1px solid #e2e8f0', 'important');
    emailInput.style.setProperty('font-size', '14px', 'important');
    emailInput.style.setProperty('background', '#fff', 'important');
    emailInput.style.setProperty('color', '#222', 'important');
    emailInput.style.setProperty('outline', 'none', 'important');
    emailInput.style.setProperty('box-shadow', '0 1px 2px rgba(0,0,0,0.04)', 'important');
    emailInput.style.setProperty('margin', '0', 'important');
    emailInput.style.setProperty('width', '100%', 'important');
    const phoneInput = document.createElement('input');
    phoneInput.type = 'tel';
    phoneInput.placeholder = 'Your Mobile Number';
    phoneInput.style.setProperty('padding', '8px 12px', 'important');
    phoneInput.style.setProperty('border-radius', '6px', 'important');
    phoneInput.style.setProperty('border', '1px solid #e2e8f0', 'important');
    phoneInput.style.setProperty('font-size', '14px', 'important');
    phoneInput.style.setProperty('background', '#fff', 'important');
    phoneInput.style.setProperty('color', '#222', 'important');
    phoneInput.style.setProperty('outline', 'none', 'important');
    phoneInput.style.setProperty('box-shadow', '0 1px 2px rgba(0,0,0,0.04)', 'important');
    phoneInput.style.setProperty('margin', '0', 'important');
    phoneInput.style.setProperty('width', '100%', 'important');
    const consentDiv = document.createElement('div');
    consentDiv.style.setProperty('display', 'flex', 'important');
    consentDiv.style.setProperty('align-items', 'center', 'important');
    consentDiv.style.setProperty('gap', '8px', 'important');
    consentDiv.style.setProperty('margin', '0', 'important');
    consentDiv.style.setProperty('padding', '0', 'important');
    const consentCheckbox = document.createElement('input');
    consentCheckbox.type = 'checkbox';
    consentCheckbox.id = 'rankved-consent-checkbox';
    const consentLabel = document.createElement('label');
    consentLabel.htmlFor = 'rankved-consent-checkbox';
    consentLabel.textContent = 'I consent to be contacted.';
    consentLabel.style.setProperty('font-size', '13px', 'important');
    consentLabel.style.setProperty('color', '#222', 'important');
    consentLabel.style.setProperty('margin', '0', 'important');
    consentLabel.style.setProperty('padding', '0', 'important');
    consentDiv.appendChild(consentCheckbox);
    consentDiv.appendChild(consentLabel);
    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Send';
    sendBtn.style.setProperty('background', getAppearance().primaryColor, 'important');
    sendBtn.style.setProperty('color', '#fff', 'important');
    sendBtn.style.setProperty('border', 'none', 'important');
    sendBtn.style.setProperty('border-radius', '6px', 'important');
    sendBtn.style.setProperty('padding', '8px 16px', 'important');
    sendBtn.style.setProperty('font-size', '14px', 'important');
    sendBtn.style.setProperty('cursor', 'pointer', 'important');
    sendBtn.style.setProperty('margin', '0', 'important');
    sendBtn.style.setProperty('width', '100%', 'important');
    sendBtn.onclick = async function () {
      if (!nameInput.value.trim() || !emailInput.value.trim() || !phoneInput.value.trim() || !consentCheckbox.checked) return;
      addMessage(`Name: ${nameInput.value}, Email: ${emailInput.value}, Phone: ${phoneInput.value}, Consent: Yes`, 'user');
      sendBtn.disabled = true;
      try {
        let apiUrl = (typeof window !== 'undefined' && window.VITE_API_URL) ? window.VITE_API_URL : (config.apiUrl || (window.CHATBOT_CONFIG && window.CHATBOT_CONFIG.apiUrl) || window.location.origin);
        const chatbotId = config.chatbotId || (window.CHATBOT_CONFIG && window.CHATBOT_CONFIG.chatbotId);
        if (!chatbotId) {
          addMessage('Chatbot ID is missing. Please refresh the page.', 'bot');
          return;
        }
        // Build context from questionFlowState
        const context = { questionFlowState };
        const res = await fetch(apiUrl + '/api/chat/' + chatbotId + '/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            consentGiven: consentCheckbox.checked,
            source: 'chat_widget',
            conversationContext: context
          })
        });
        if (res.ok) {
          addMessage('Thank you! Our team will contact you soon.', 'bot');
        } else {
          addMessage('Failed to submit your info. Please try again later.', 'bot');
        }
      } catch (e) {
        addMessage('Failed to submit your info. Please try again later.', 'bot');
      }
    };
    inputDiv.appendChild(nameInput);
    inputDiv.appendChild(emailInput);
    inputDiv.appendChild(phoneInput);
    inputDiv.appendChild(consentDiv);
    inputDiv.appendChild(sendBtn);
    messagesContainer.appendChild(inputDiv);
    scrollToBottom(messagesContainer);
  }

  // Initialize
  async function init() {
    injectStyles();
    await fetchChatbotConfig(); // Wait for config to load before rendering bubble
    // If question flow is enabled and present, preload the first node as a preview (optional)
    if (config.questionFlowEnabled && config.questionFlow && Array.isArray(config.questionFlow.nodes) && config.questionFlow.nodes.length > 0) {
      resetQuestionFlow();
      const startNode = config.questionFlow.nodes.find(n => n.id === 'start') || config.questionFlow.nodes[0];
      if (startNode) {
        questionFlowState.currentNodeId = startNode.id;
        // Optionally, show a preview or indicator here
        // e.g., addMessage('Ready for a guided conversation!', 'bot');
      }
    } else {
      if (!config.questionFlowEnabled) console.log('Question flow not enabled');
      if (!config.questionFlow) console.log('No question flow data');
    }
    bubble = createChatBubble();
    document.body.appendChild(bubble);
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose a global re-initialization function for SPA/React usage
  window.initRankVedChat = function () {
    // Remove existing bubble and chat window if present
    if (bubble && bubble.parentNode) bubble.parentNode.removeChild(bubble);
    if (chatWindow && chatWindow.parentNode) chatWindow.parentNode.removeChild(chatWindow);
    isOpen = false;
    bubble = null;
    chatWindow = null;
    configLoaded = false;
    // Re-initialize
    init();
  };

})();