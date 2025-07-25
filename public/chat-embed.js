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
        console.log('[RankVed Chat] Config loaded:', config);
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
    let backgroundColor = theme === 'dark' ? '#111' : '#fff';
    
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
        <div style="display: flex; align-items: center; gap: 4px;">
          <button 
            id="rankved-reset-btn" 
            title="Reset chat" 
            style="
              background: none;
              border: none;
              color: #fff;
              font-size: 16px;
              cursor: pointer;
              position: relative;
              z-index: 2;
              transition: background 0.2s, color 0.2s;
              border-radius: 50%;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 2px;
              padding: 0;
              outline: none;
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw bpHeaderContentActionsIcons" aria-label="Restart Conversation Button" tabindex="0" role="button"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
          </button>
          <button id="rankved-close-btn" style="background: none; border: none; color: ${a.headerText}; font-size: 20px; cursor: pointer; position: relative; z-index: 2; transition: all 0.2s ease-in-out; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: 300;">×</button>
        </div>
      </div>
      <div id="rankved-messages" style="flex: 1; overflow-y: auto; padding: 10px 8px 0 8px; color: ${a.msgText}; display: flex; flex-direction: column; gap: 8px; background: ${a.backgroundColor}; border-bottom-left-radius: ${a.borderRadius}px; border-bottom-right-radius: ${a.borderRadius}px; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; padding-bottom: 110px;">
        <!-- Welcome message removed; will be added by JS only -->
      </div>
      <div id="rankved-input-container" style="position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; display: flex; align-items: center; flex-direction: column; justify-content: center; padding: 8px; background: ${a.backgroundColor}; box-shadow: none; margin: 0px 10px 0 10px;">
        <div style="display: flex; align-items: center; width: 100%; background: ${a.theme === 'dark' ? '#23232a' : '#fff'}; border-radius: 25px; border: 1px solid ${a.inputBorder}; box-shadow: 0 1px 4px rgba(0,0,0,0.04); padding: 2px 4px;">
          <input id="rankved-input" placeholder="${config.inputPlaceholder || config.placeholder || 'Type your message...'}" style="flex: 1; border: none; border-radius: 14px; padding: 7px 10px; font-size: 12px; outline: none; color: ${a.inputText}; background: transparent; height: 32px; box-shadow: none; transition: all 0.2s ease-in-out;" />
          <button id="rankved-send-btn" style="width: 36px; height: 36px; margin-left: 4px; border-radius: 50%; background: ${a.primaryColor}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/></svg>
          </button>
        </div>
      </div>
    `;
    // Add powered by text inside the input bar container
    const inputBar = win.querySelector('div[style*="position: absolute"]');
    if (inputBar) {
      const poweredByDiv = document.createElement('div');
      poweredByDiv.setAttribute('style', `
        width: 100%;
        text-align: center;
        padding: 2px 0 0 0;
        font-size: 11px;
        color: ${a.theme === 'dark' ? '#fff' : '#222'};
        background: none;
        pointer-events: auto;
      `);
      poweredByDiv.innerHTML =
        config.poweredByText
          ? `<span>${config.poweredByLink ? `<a href="${config.poweredByLink}" target="_blank" style="color: ${a.primaryColor}; text-decoration: none; transition: all 0.2s ease-in-out; pointer-events: auto;">${config.poweredByText}</a>` : config.poweredByText}</span>`
          : `Powered by <a href="https://rankved.com" target="_blank" style="color: ${a.primaryColor}; text-decoration: none; transition: all 0.2s ease-in-out; pointer-events: auto;">RankVed</a>`;
      inputBar.appendChild(poweredByDiv);
    }
    setTimeout(() => {
      const resetBtn = win.querySelector('#rankved-reset-btn');
      if (resetBtn) {
        resetBtn.onclick = function() {
          // sessionStorage.removeItem('rankved_chat_history');
          const messagesDiv = win.querySelector('#rankved-messages');
          if (messagesDiv) messagesDiv.innerHTML = '';
          chatHistory = [];
          latestFollowUpButtons = initialFollowUpButtons;
          latestCtaButton = initialCtaButton;
          addMessage(initialBotMessage || config.welcomeMessage || 'Hello! How can I help you today?', 'bot');
          showSuggestions();
        };
      }
    }, 0);
    // Inject mobile-specific styles for close button and font size
    const mobileStyleId = 'rankved-chat-mobile-style';
    if (!document.getElementById(mobileStyleId)) {
      const style = document.createElement('style');
      style.id = mobileStyleId;
      style.textContent = `
        @media (max-width: 600px) {
          #rankved-chat-window[data-rankved-widget] {
            font-size: 16px !important;
          }
          #rankved-chat-window[data-rankved-widget] #rankved-close-btn {
            width: 44px !important;
            height: 44px !important;
            font-size: 32px !important;
          }
          #rankved-chat-window[data-rankved-widget] #rankved-reset-btn {
            width: 36px !important;
            height: 36px !important;
            font-size: 22px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
    return win;
  }

  // Helper function for smooth scrolling
  function scrollToBottom(container) {
    if (!container) return;
    // On mobile, add extra offset for input bar
    const isMobile = window.innerWidth <= 600;
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
      if (isMobile) {
        // Try to ensure last message is visible above input bar
        const lastMsg = container.lastElementChild;
        if (lastMsg) {
          lastMsg.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }
    });
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
      if (isMobile) {
        const lastMsg = container.lastElementChild;
        if (lastMsg) {
          lastMsg.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }
    }, 50);
  }

  // Add message to chat
  function addMessage(content, sender) {
    const messageId = Date.now().toString();
    console.log(`[${messageId}] 📝 Adding message to UI:`, {
      sender,
      contentLength: content.length,
      contentPreview: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      timestamp: new Date().toISOString()
    });
    
    const a = getAppearance();
    const messagesContainer = document.getElementById('rankved-messages');
    if (!messagesContainer) {
      console.error(`[${messageId}] ❌ Messages container not found`);
      return;
    }
    const messageDiv = document.createElement('div');
    if (sender === 'user') {
      messageDiv.setAttribute('style', `margin-bottom: 3px; display: flex; justify-content: flex-end;`);
      const contentDiv = document.createElement('div');
      // Sharp bottom-right corner for user
      contentDiv.setAttribute('style', `max-width: 80%; padding: 8px 10px; border-radius: 14px 14px 4px 14px; background: ${a.userMsgBg}; color: ${a.userMsgText}; box-shadow: 0 2px 6px rgba(0,0,0,0.10); transition: all 0.2s ease-in-out; word-break: break-word;`);
      contentDiv.textContent = content;
      messageDiv.appendChild(contentDiv);
    } else {
      messageDiv.setAttribute('style', `margin-bottom: 7px; display: flex; flex-direction: row; align-items: flex-start; gap: 8px;`);
      // Avatar div
      const avatarDiv = document.createElement('div');
      let botIcon = config.chatWindowAvatar || config.chatWidgetIcon;
      if (botIcon) {
        avatarDiv.innerHTML = `<img src="${botIcon}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.2); box-shadow: 0 1px 3px rgba(0,0,0,0.1);">`;
      } else {
        avatarDiv.innerHTML = `<span style=\"display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: ${a.primaryColor}; border: 2px solid rgba(255,255,255,0.2); box-shadow: 0 1px 3px rgba(0,0,0,0.1);\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"11\" width=\"18\" height=\"7\" rx=\"2\"/><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"/></svg></span>`;
      }
      messageDiv.appendChild(avatarDiv);
      // Message and options container
      const msgOptDiv = document.createElement('div');
      msgOptDiv.setAttribute('style', 'display: flex; flex-direction: row;flex-wrap:wrap; align-items: flex-start;');
      // Message bubble
      // --- Markdown-like formatting for bot messages ---
      let formatted = content
        .replace(/\n\n/g, '<br><br>') // double newline to double break
        .replace(/\n/g, '<br>') // single newline to break
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #111;">$1</strong>') // bold
        .replace(/^- (.*)$/gm, '<li>$1</li>'); // bullet points
      // If any <li> found, wrap in <ul>
      if (/<li>/.test(formatted)) {
        formatted = '<ul style="margin: 0 0 0 1em; padding: 0; list-style: disc inside;">' + formatted.replace(/(<br>)*(<li>)/g, '$2') + '</ul>';
      }
      const contentDiv = document.createElement('div');
      contentDiv.setAttribute('style', `max-width: 80%; padding: 8px 10px; border-radius: 14px 14px 14px 1px; background: ${a.msgBg}; color: ${a.msgText}; box-shadow: 0 1px 1px 0px rgb(0 0 0 / 30%); transition: all 0.2s ease-in-out; margin-bottom: 8px; word-break: break-word;`);
      contentDiv.innerHTML = formatted;
      msgOptDiv.appendChild(contentDiv);
      // Render follow-up buttons below the message bubble if present
      if (latestFollowUpButtons && latestFollowUpButtons.length > 0) {
        latestFollowUpButtons.forEach((btnObj) => {
          const text = btnObj.text || btnObj;
          const payload = btnObj.payload || text;
          const btn = document.createElement('button');
          // Glass effect and secondary color
          const secondary = getAppearance().secondaryColor || '#A7C7E7';
          btn.textContent = text;
          btn.setAttribute('style', `
            background: ${hexToGlass(secondary, 0.7)};
            color: ${getAppearance().primaryColor};
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            backdrop-filter: blur(8px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            padding: 3px 8px;
            cursor: pointer;
            margin: 0 8px 8px 0;
            transition: background 0.2s;
          `);
          btn.onclick = function () {
            addMessage(text, 'user');
            sendMessageStateless(payload, { suppressUserMessage: true });
            if (config.suggestionPersistence !== 'always_visible') btn.style.display = 'none';
          };
          msgOptDiv.appendChild(btn);
        });
      }
      // Render CTA button below the suggestion buttons if present
      if (latestCtaButton && latestCtaButton.text && latestCtaButton.link) {
        const ctaBtnWrapper = document.createElement('div');
        ctaBtnWrapper.setAttribute('style', 'width: 100%; display: block; margin-top: 10px;');
        // Use <a> for the CTA button to ensure link is applied
        const ctaLink = document.createElement('a');
        ctaLink.href = latestCtaButton.link;
        ctaLink.target = '_blank';
        ctaLink.rel = 'noopener noreferrer';
        ctaLink.setAttribute('style', `
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        `);
        const ctaBtn = document.createElement('button');
        ctaBtn.innerHTML = `
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <span style="color: ${getAppearance().primaryColor};">${latestCtaButton.text}</span>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline;vertical-align:middle;"><path d="M7 13L13 7M13 7H7M13 7V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        `;
        ctaBtn.setAttribute('style', `
          margin-top: 0;
          background: ${hexToGlass(getAppearance().primaryColor, 0.12)};
          color: ${getAppearance().primaryColor};
          border: 1.5px solid ${getAppearance().primaryColor};
          border-radius: 8px;
          padding: 5px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          backdrop-filter: blur(8px);
          transition: background 0.2s, color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        `);
        ctaLink.appendChild(ctaBtn);
        ctaBtnWrapper.appendChild(ctaLink);
        msgOptDiv.appendChild(ctaBtnWrapper);
        latestCtaButton = null;
      }
      messageDiv.appendChild(msgOptDiv);
    }
    messagesContainer.appendChild(messageDiv);
    
    console.log(`[${messageId}] ✅ Message added to DOM:`, {
      sender,
      contentLength: content.length,
      messagesContainerChildren: messagesContainer.children.length
    });
    
    // Use helper function for consistent scroll behavior
    scrollToBottom(messagesContainer);

    // Render follow-up buttons below the message bubble if present
    chatHistory.push({ role: sender, content });
    // Save chat history to sessionStorage after every message
    // try {
    //   sessionStorage.setItem('rankved_chat_history', JSON.stringify(chatHistory));
    // } catch (e) {}
  }

  // Show follow-up buttons from latest intent-detect response
  function showSuggestions() {
    const suggestions = latestFollowUpButtons;
    const container = document.getElementById('rankved-suggestions');
    if (!container) return;
    container.innerHTML = '';
    console.log('[RankVed Chat] Rendering follow-up suggestions:', suggestions);
    if (Array.isArray(suggestions) && suggestions.length > 0) {
      suggestions.forEach((btnObj) => {
        const text = btnObj.text || btnObj;
        const payload = btnObj.payload || text;
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.setAttribute('style', `background: ${getAppearance().primaryColor}; color: #fff; border: none; border-radius: 6px; padding: 6px 12px; font-size: 13px; cursor: pointer; margin: 0;`);
        btn.onclick = function () {
          addMessage(text, 'user');
          console.log('payload', text);
          sendMessageStateless(payload,{ suppressUserMessage: true });
          if (config.suggestionPersistence !== 'always_visible') btn.style.display = 'none';
        };
        container.appendChild(btn);
      });
    }
  }

  // --- New Stateless, Context-Aware Chat Logic ---
  let chatHistory = [];
  let awaitingContactInfo = null;
  let latestFollowUpButtons = [];
  let latestCtaButton = null;
  let loadingMessageDiv = null;

  function isValidEmail(text) {
    return /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(text);
  }
  function isCancelPhrase(text) {
    const cancelPhrases = [
      "never mind", "no thanks", "not now", "cancel", "don't collect info", "no thank you", "skip", "leave it", "forget it", "stop asking", "i don't want to continue"
    ];
    return cancelPhrases.some(phrase => text.toLowerCase().includes(phrase));
  }

  async function sendMessageStateless(userInput, options = {}) {
    if (typeof userInput !== 'string') {
      userInput = String(userInput.text || userInput.payload || '');
    }
    if (!userInput.trim()) return;
    // Only show the user's message if not suppressed (for auto hello)
    if (!options.suppressUserMessage) {
      addMessage(userInput, 'user');
      chatHistory.push({ role: 'user', content: userInput });
    }

    // Show loading indicator
    showLoadingIndicator();

    // Phase 1: Contact Info Collection (frontend logic)
    if (awaitingContactInfo) {
      if (awaitingContactInfo.field === 'email' && isValidEmail(userInput)) {
        awaitingContactInfo = null;
        addMessage("Thank you! We've received your email. You can ask another question or use the contact options below.", 'bot');
        chatHistory.push({ role: 'bot', content: "Thank you! We've received your email. You can ask another question or use the contact options below." });
        return;
      }
      // For all other cases (including cancellation), send to backend for intent detection
      try {
        const history = chatHistory.slice(-4);
        const res = await fetch((config.apiUrl || window.location.origin) + '/api/intent-detect/' + encodeURIComponent(config.chatbotId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userInput, history }),
        });
        if (res.ok) {
          const data = await res.json();
          const bot = data.intent;
          console.log("bot", bot)
          // Update follow-up buttons and CTA from response BEFORE rendering message
          latestFollowUpButtons = bot.follow_up_buttons || [];
          latestCtaButton = bot.cta_button || null;
          addMessage(bot.message_text, 'bot');
          chatHistory.push({ role: 'bot', content: bot.message_text });
          showSuggestions();
          if (bot.action_collect_contact_info && bot.requested_contact_field) {
            awaitingContactInfo = { field: bot.requested_contact_field };
          } else {
            awaitingContactInfo = null;
          }
        } else {
          addMessage('Sorry, I could not connect to the server.', 'bot');
          chatHistory.push({ role: 'bot', content: 'Sorry, I could not connect to the server.' });
          latestFollowUpButtons = [];
          latestCtaButton = null;
          showSuggestions();
        }
      } catch {
        addMessage('Sorry, I could not connect to the server.', 'bot');
        chatHistory.push({ role: 'bot', content: 'Sorry, I could not connect to the server.' });
        latestFollowUpButtons = [];
        latestCtaButton = null;
        showSuggestions();
      }
      return;
    }

    // Normal message flow
    try {
      const history = chatHistory.slice(-4);
      const res = await fetch((config.apiUrl || window.location.origin) + '/api/intent-detect/' + encodeURIComponent(config.chatbotId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput, history }),
      });
      if (res.ok) {
        const data = await res.json();
        const bot = data.intent;
        console.log("bot", bot)
        removeLoadingIndicator();
        // Update follow-up buttons and CTA from response BEFORE rendering message
        latestFollowUpButtons = bot.follow_up_buttons || [];
        latestCtaButton = bot.cta_button || null;
        addMessage(bot.message_text, 'bot');
        chatHistory.push({ role: 'bot', content: bot.message_text });
        showSuggestions();
        if (bot.action_collect_contact_info && bot.requested_contact_field) {
          awaitingContactInfo = { field: bot.requested_contact_field };
        } else {
          awaitingContactInfo = null;
        }
      } else {
        removeLoadingIndicator();
        addMessage('Sorry, I could not connect to the server.', 'bot');
        chatHistory.push({ role: 'bot', content: 'Sorry, I could not connect to the server.' });
        latestFollowUpButtons = [];
        latestCtaButton = null;
        showSuggestions();
      }
    } catch {
      removeLoadingIndicator();
      addMessage('Sorry, I could not connect to the server.', 'bot');
      chatHistory.push({ role: 'bot', content: 'Sorry, I could not connect to the server.' });
      latestFollowUpButtons = [];
      latestCtaButton = null;
      showSuggestions();
    }
  }

  // Store the initial bot message and suggestions before chat window is opened
  let initialBotMessage = null;
  let initialFollowUpButtons = [];
  let initialCtaButton = null;

  // On initial load, fetch the bot's hello message (but don't render)
  async function preloadInitialBotMessage() {
    try {
      const res = await fetch((config.apiUrl || window.location.origin) + '/api/intent-detect/' + encodeURIComponent(config.chatbotId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'hello', history: [] }),
      });
      if (res.ok) {
        const data = await res.json();
        const bot = data.intent;
        initialBotMessage = bot.message_text;
        initialFollowUpButtons = bot.follow_up_buttons || [];
        initialCtaButton = bot.cta_button || null;
      } else {
        initialBotMessage = 'Hello! How can I help you today?';
        initialFollowUpButtons = [];
        initialCtaButton = null;
      }
    } catch {
      initialBotMessage = 'Hello! How can I help you today?';
      initialFollowUpButtons = [];
      initialCtaButton = null;
    }
  }

  // On chat open, show the preloaded initial bot message if no session
  async function openChat() {
    playOpenCloseSound();
    if (isOpen) return;
    if (!configLoaded) {
      await fetchChatbotConfig();
      if (!configLoaded) return; // If still not loaded, abort
    }
    chatWindow = createChatWindow();
    document.body.appendChild(chatWindow);
    if (bubble) bubble.style.display = 'none';
    isOpen = true;
    // Restore chat history from sessionStorage if available
    let restored = false;
    // try {
    //   const saved = sessionStorage.getItem('rankved_chat_history');
    //   if (saved) {
    //     chatHistory = JSON.parse(saved);
    //     chatHistory.forEach(msg => addMessage(msg.content, msg.role));
    //     restored = true;
    //   }
    // } catch (e) {}
    if (!restored) {
      // Always send 'hello' to backend and print the response
      console.log('[RankVed Chat] Sending automatic "hello" message to backend on chat open.');
      sendMessageStateless('hello', { suppressUserMessage: true });
    }
    chatWindow.querySelector('#rankved-close-btn').onclick = () => {
      closeChat();
      if (bubble) bubble.style.display = 'flex'; // Show bubble when chat is closed
    };
    // Fix: Send button should send the input value
    const sendBtn = chatWindow.querySelector('#rankved-send-btn');
    const inputEl = chatWindow.querySelector('#rankved-input');
    if (sendBtn && inputEl) {
      sendBtn.onclick = function() {
        sendMessageStateless(inputEl.value);
        inputEl.value = '';
      };
    }
    chatWindow.querySelector('#rankved-input').onkeydown = function (e) {
      if (e.key === 'Enter') {
        sendMessageStateless(this.value);
        this.value = '';
      }
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
        <span class="rankved-typing-wave" style="display: inline-block;">
          <span class="wave-dot" style="display:inline-block;width:5px;height:5px;background:#6366F1;border-radius:50%;margin-right:2px;animation:rankved-dot-wave 1.2s infinite;animation-delay:0s;"></span>
          <span class="wave-dot" style="display:inline-block;width:5px;height:5px;background:#6366F1;border-radius:50%;margin-right:2px;animation:rankved-dot-wave 1.2s infinite;animation-delay:0.2s;"></span>
          <span class="wave-dot" style="display:inline-block;width:5px;height:5px;background:#6366F1;border-radius:50%;animation:rankved-dot-wave 1.2s infinite;animation-delay:0.4s;"></span>
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

  // Show loading indicator as a temporary bot message
  function showLoadingIndicator() {
    removeLoadingIndicator();
    const messagesContainer = document.getElementById('rankved-messages');
    if (!messagesContainer) return;
    loadingMessageDiv = document.createElement('div');
    loadingMessageDiv.setAttribute('style', 'margin-bottom: 7px; display: flex; flex-direction: row; align-items: flex-start; gap: 8px;');
    const avatarDiv = document.createElement('div');
    let botIcon = config.chatWindowAvatar || config.chatWidgetIcon;
    if (botIcon) {
      avatarDiv.innerHTML = `<img src="${botIcon}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.2); box-shadow: 0 1px 3px rgba(0,0,0,0.1);">`;
    } else {
      avatarDiv.innerHTML = `<span style=\"display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: ${getAppearance().primaryColor}; border: 2px solid rgba(255,255,255,0.2); box-shadow: 0 1px 3px rgba(0,0,0,0.1);\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"11\" width=\"18\" height=\"7\" rx=\"2\"/><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"/></svg></span>`;
    }
    loadingMessageDiv.appendChild(avatarDiv);
    const loadingBubble = document.createElement('div');
    loadingBubble.setAttribute('style', `max-width: 70%; padding: 4px 8px; border-radius: 14px 14px 14px 4px; font-size: 11px; background: #f3f4f6; color: #888; box-shadow: 0 1px 1px 0px rgb(0 0 0 / 10%); margin-bottom: 8px; display: flex; align-items: center; min-height: 20px;`);
    loadingBubble.innerHTML = `<span class="rankved-typing-wave" style="display: inline-block;">
      <span class="wave-dot" style="display:inline-block;width:7px;height:7px;background:${getAppearance().primaryColor};border-radius:50%;margin-right:2px;animation:rankved-dot-wave 1.2s infinite;animation-delay:0s;"></span>
      <span class="wave-dot" style="display:inline-block;width:7px;height:7px;background:${getAppearance().primaryColor};border-radius:50%;margin-right:2px;animation:rankved-dot-wave 1.2s infinite;animation-delay:0.2s;"></span>
      <span class="wave-dot" style="display:inline-block;width:7px;height:7px;background:${getAppearance().primaryColor};border-radius:50%;animation:rankved-dot-wave 1.2s infinite;animation-delay:0.4s;"></span>
    </span>`;
    loadingMessageDiv.appendChild(loadingBubble);
    messagesContainer.appendChild(loadingMessageDiv);
    scrollToBottom(messagesContainer);
  }

  // Remove loading indicator
  function removeLoadingIndicator() {
    if (loadingMessageDiv && loadingMessageDiv.parentElement) {
      loadingMessageDiv.parentElement.removeChild(loadingMessageDiv);
      loadingMessageDiv = null;
    }
  }

  // Initialize
  async function init() {
    injectStyles();
    await fetchChatbotConfig(); // Wait for config to load before rendering bubble
    await preloadInitialBotMessage(); // Preload the initial bot message
    bubble = createChatBubble();
    playOpenCloseSound(); // Play sound when bubble loads
    console.log("init");
    setTimeout(() => {
      document.body.appendChild(bubble);
    }, 1000); // 1 second delay
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

  // Add a helper function to convert hex to rgba for glass effect
  function hexToGlass(hex, alpha) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

})();