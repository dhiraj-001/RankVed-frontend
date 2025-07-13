(function() {
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

  // Sound effect for open/close
  function playOpenCloseSound() {
    try {
      const audio = new Audio('https://rank-ved-frontend-rfam.vercel.app/openclose.mp3');
      audio.currentTime = 0;
      audio.play();
    } catch (e) {
      console.log(e)
    }
  }

  // Fetch chatbot config from backend
  async function fetchChatbotConfig() {
    if (!config.chatbotId) return;
    // Use VITE_API_URI from env if available, else config.apiUrl, else window.location.origin
    let baseUrl = (typeof window !== 'undefined' && window.VITE_API_URL) ? window.VITE_API_URL : (config.apiUrl || window.location.origin);
    try {
      const res = await fetch(`${baseUrl}/api/chatbots/${config.chatbotId}/public`);
      if (res.ok) {
        config = await res.json();
        configLoaded = true;
      } else {
        showError('Failed to load chatbot config.');
      }
    } catch (e) {
      showError('Failed to load chatbot config.');
    }
  }

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

  // Helper: Get appearance values from config with fallback
  function getAppearance() {
    const theme = config.chatWindowTheme || config.theme || 'light';
    const borderRadius = Number(config.borderRadius) || 12;
    const shadowStyle = config.shadowStyle || 'soft';
    let primaryColor = config.primaryColor || '#6366F1';
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(primaryColor)) primaryColor = '#6366F1';
    const backgroundColor = theme === 'dark' ? '#18181b' : '#fff';
    let boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
    if (shadowStyle === 'minimal') boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    if (shadowStyle === 'strong') boxShadow = '0 20px 60px rgba(0,0,0,0.25)';
    const textColor = theme === 'dark' ? '#fff' : '#333';
    const headerBg = primaryColor;
    const headerText = '#fff';
    const inputBg = theme === 'dark' ? '#23232a' : '#fff';
    const inputText = theme === 'dark' ? '#fff' : '#333';
    const inputBorder = theme === 'dark' ? '#333' : '#e2e8f0';
    const msgBg = theme === 'dark' ? '#23232a' : '#fff';
    const msgText = theme === 'dark' ? '#fff' : '#333';
    const userMsgBg = primaryColor;
    const userMsgText = '#fff';
    return {
      theme, borderRadius, shadowStyle, primaryColor, backgroundColor, boxShadow, textColor,
      headerBg, headerText, inputBg, inputText, inputBorder, msgBg, msgText, userMsgBg, userMsgText
    };
  }

  // Create chat bubble
  function createChatBubble() {
    const a = getAppearance();
    const bubble = document.createElement('div');
    bubble.setAttribute('id', 'rankved-chat-bubble');
    bubble.setAttribute('data-rankved-widget', 'true');
    bubble.setAttribute('style', `
      position: fixed; bottom: 24px; right: 24px; width: 60px; height: 60px; border-radius: ${a.borderRadius * 2}px;
      background: ${a.primaryColor}; box-shadow: ${a.boxShadow};
      display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2147483647;
      transition: box-shadow 0.2s; border: none; outline: none; font-family: inherit; margin: 0; padding: 0;
    `);
    // Prefer chatWidgetIcon for the bubble, fallback to chatBubbleIcon, then default
    const iconSrc = config.chatWidgetIcon || config.chatBubbleIcon || config.bubbleIcon;
    bubble.innerHTML = iconSrc ?
      `<img src="${iconSrc}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; pointer-events: none;" alt="Chat Icon">` :
      `<svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>`;
    bubble.title = config.chatWidgetName || config.name || config.title || 'ChatBot';
    bubble.onclick = openChat;
    return bubble;
  }

  // Create chat window (strict, minimal, no iframe)
  function createChatWindow() {
    const a = getAppearance();
    const win = document.createElement('div');
    win.setAttribute('id', 'rankved-chat-window');
    win.setAttribute('data-rankved-widget', 'true');
    win.setAttribute('style', `
      position: fixed; bottom: 100px; right: 24px; width: 380px; height: 600px; max-height: 80vh;
      border-radius: ${a.borderRadius}px; background: ${a.backgroundColor}; box-shadow: ${a.boxShadow}; z-index: 2147483646;
      display: flex; flex-direction: column; overflow: hidden; font-family: inherit; border: 1px solid ${a.inputBorder};
      margin: 0; padding: 0; opacity: 1; transform: scale(1) translateY(0);
      color: ${a.textColor};
    `);
    // Prefer chatWidgetIcon for the header, fallback to chatWindowAvatar, then default SVG
    let headerIcon = config.chatWidgetIcon || config.chatWindowAvatar;
    let headerIconHTML = '';
    if (headerIcon) {
      headerIconHTML = `<img src="${headerIcon}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; background: #fff2; border: 2px solid #fff3;">`;
    } else {
      headerIconHTML = `<span style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: #fff2; border: 2px solid #fff3;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="7" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span>`;
    }
    // Online status
    const onlineStatus = `<span style="display: flex; align-items: center; gap: 4px; font-size: 12px; margin-left: 4px;"><span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 4px #22c55e88;"></span><span style="color: #d1fae5;">Online</span></span>`;
    win.innerHTML = `
      <div style="background: ${a.primaryColor}; color: ${a.headerText}; padding: 14px; display: flex; align-items: center; justify-content: space-between; border-radius: ${a.borderRadius}px ${a.borderRadius}px 0 0;">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
          ${headerIconHTML}
          <div style="display: flex; flex-direction: column; min-width: 0;">
            <span style="font-size: 16px; font-weight: 600; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${config.chatWidgetName || config.name || config.title || 'ChatBot'}</span>
            ${onlineStatus}
          </div>
        </div>
        <button id="rankved-close-btn" style="background: none; border: none; color: ${a.headerText}; font-size: 22px; cursor: pointer;">×</button>
      </div>
      <div id="rankved-messages" style="flex: 1; overflow-y: auto; padding: 18px 14px 0 14px; background: ${a.msgBg}; color: ${a.msgText}; display: flex; flex-direction: column; gap: 14px; border-bottom-left-radius: ${a.borderRadius}px; border-bottom-right-radius: ${a.borderRadius}px;">
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          ${headerIconHTML.replace('32px', '28px').replace('32px', '28px')}
          <div style="background: ${a.msgBg}; color: ${a.msgText}; border-radius: 18px; padding: 10px 16px; font-size: 15px; box-shadow: 0 1px 2px rgba(0,0,0,0.08);">${config.welcomeMessage || 'Hello! How can I help you today?'}</div>
        </div>
        <div style="display: flex; justify-content: flex-end; align-items: flex-end; gap: 10px;">
          <div style="background: ${a.primaryColor}; color: #fff; border-radius: 18px; padding: 10px 16px; font-size: 15px; box-shadow: 0 1px 2px rgba(0,0,0,0.08);">I need help with my account</div>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          ${headerIconHTML.replace('32px', '28px').replace('32px', '28px')}
          <div style="background: ${a.msgBg}; color: ${a.msgText}; border-radius: 18px; padding: 10px 16px; font-size: 15px; box-shadow: 0 1px 2px rgba(0,0,0,0.08);">I'd be happy to help! What specific issue are you experiencing?</div>
        </div>
      </div>
      <div style="padding: 14px 14px 10px 14px; border-top: 1px solid ${a.inputBorder}; background: ${a.inputBg}; border-bottom-left-radius: ${a.borderRadius}px; border-bottom-right-radius: ${a.borderRadius}px;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <input id="rankved-input" placeholder="${config.inputPlaceholder || config.placeholder || 'Type your message...'}" style="flex: 1; border: 1px solid ${a.inputBorder}; border-radius: 12px; padding: 10px 14px; font-size: 15px; outline: none; background: ${a.inputBg}; color: ${a.inputText}; height: 38px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
          <button id="rankved-send-btn" style="width: 38px; height: 38px; border-radius: 12px; background: ${a.primaryColor}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/></svg>
          </button>
        </div>
        <div id="rankved-suggestions" style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px;"></div>
        <div style="text-align: center; padding: 8px 0 0 0; font-size: 12px; color: ${a.theme === 'dark' ? '#aaa' : '#666'}; background: none;">
          ${config.poweredByText ? `<span>${config.poweredByLink ? `<a href="${config.poweredByLink}" target="_blank" style="color: ${a.primaryColor}; text-decoration: none;">${config.poweredByText}</a>` : config.poweredByText}</span>` : `Powered by <a href="https://rankved.com" target="_blank" style="color: ${a.primaryColor}; text-decoration: none;">RankVed</a>`}
        </div>
      </div>
    `;
    return win;
  }

  // Add message to chat
  function addMessage(content, sender) {
    const a = getAppearance();
    const messagesContainer = document.getElementById('rankved-messages');
    if (!messagesContainer) return;
    const messageDiv = document.createElement('div');
    if (sender === 'user') {
      messageDiv.setAttribute('style', `margin-bottom: 14px; display: flex; justify-content: flex-end;`);
      const contentDiv = document.createElement('div');
      contentDiv.setAttribute('style', `max-width: 80%; padding: 10px 16px; border-radius: 18px; font-size: 14px; background: ${a.userMsgBg}; color: ${a.userMsgText};`);
      contentDiv.textContent = content;
      messageDiv.appendChild(contentDiv);
    } else {
      messageDiv.setAttribute('style', `margin-bottom: 14px; display: flex; justify-content: flex-start; align-items: flex-start; gap: 8px;`);
      const avatarDiv = document.createElement('div');
      // Use the same fallback logic as header: chatWidgetIcon, then chatWindowAvatar, then default SVG
      let botIcon = config.chatWidgetIcon || config.chatWindowAvatar;
      if (botIcon) {
        avatarDiv.innerHTML = `<img src="${botIcon}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; background: #fff2; border: 2px solid #fff3;">`;
      } else {
        avatarDiv.innerHTML = `<span style=\"display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: #fff2; border: 2px solid #fff3;\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#6366F1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"11\" width=\"18\" height=\"7\" rx=\"2\"/><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"/></svg></span>`;
      }
      messageDiv.appendChild(avatarDiv);
      const contentDiv = document.createElement('div');
      contentDiv.setAttribute('style', `max-width: 80%; padding: 10px 16px; border-radius: 12px; font-size: 14px; background: ${a.msgBg}; color: ${a.msgText}; box-shadow: 0 1px 2px rgba(0,0,0,0.08);`);
      contentDiv.textContent = content;
      messageDiv.appendChild(contentDiv);
    }
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
        btn.onclick = function() {
          addMessage(text, 'user');
          if (config.suggestionPersistence !== 'always_visible') btn.style.display = 'none';
        };
        container.appendChild(btn);
      });
    }
  }

  // Open chat window with animation
  async function openChat() {
    playOpenCloseSound();
    if (isOpen) return;
    if (!configLoaded) {
      await fetchChatbotConfig();
      if (!configLoaded) return; // If still not loaded, abort
    }
    chatWindow = createChatWindow();
    document.body.appendChild(chatWindow);
    isOpen = true;
    addMessage(config.welcomeMessage || 'Hello! How can I help you today?', 'bot');
    showSuggestions();
    chatWindow.querySelector('#rankved-close-btn').onclick = closeChat;
    chatWindow.querySelector('#rankved-send-btn').onclick = sendMessage;
    chatWindow.querySelector('#rankved-input').onkeydown = function(e) {
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
      }, 250);
    }
  }

  // Send message to backend
  async function sendMessage() {
    const input = chatWindow.querySelector('#rankved-input');
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    try {
      const res = await fetch(`${config.apiUrl || ''}/api/chat/${config.chatbotId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (res.ok) {
        const data = await res.json();
        addMessage(data.message || '...', 'bot');
      } else {
        addMessage('Sorry, there was a problem. Please try again.', 'bot');
  }
    } catch (e) {
      addMessage('Sorry, there was a problem. Please try again.', 'bot');
      }
  }

  // Initialize
  async function init() {
    injectStyles();
    await fetchChatbotConfig(); // Wait for config to load before rendering bubble
    bubble = createChatBubble();
    document.body.appendChild(bubble);
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();