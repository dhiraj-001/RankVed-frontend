(function() {
  'use strict';
  
  console.log('🚀 RankVed Chatbot Loader: Starting...');
  
  // Minimal configuration with defaults
  window.RankVedChatbotConfig = window.RankVedChatbotConfig || {
    chatbotId: null,
    excludedPages: [
        // Original Pages
        "",
        "/blog",
        "/admin",
        "/privacy",
        "/terms",
        "/login",
        "/signup",

        // User Account & Authentication
        "/my-account",
        "/profile",
        "/dashboard",
        "/register",
        "/logout",
        "/forgot-password",
        "/reset-password",

        // E-commerce & Checkout Flow
        "/cart",
        "/checkout",
        "/payment",
        "/order-confirmation",
        "/thank-you",

        // Legal & Policy
        "/privacy-policy",
        "/terms-of-service",
        "/cookie-policy",
        "/disclaimer",

        // System Pages
        "/sitemap",
        "/404",
        "/appearance"
      ],
    includedPages: []
  };

  console.log('📋 RankVed Chatbot Config:', window.RankVedChatbotConfig);

  // Function to check if chatbot should be shown on current page
  function shouldShowChatbot() {
    const currentPath = window.location.pathname;
    const currentUrl = window.location.href;

    // If includedPages is specified, only show on those pages
    if (window.RankVedChatbotConfig.includedPages && window.RankVedChatbotConfig.includedPages.length > 0) {
      const isIncluded = window.RankVedChatbotConfig.includedPages.some(pattern => {
        if (pattern.startsWith('/') && pattern.endsWith('/')) {
          // Regex pattern
          const regex = new RegExp(pattern.slice(1, -1));
          return regex.test(currentPath) || regex.test(currentUrl);
        } else {
          // Simple string match
          return currentPath.includes(pattern) || currentUrl.includes(pattern);
        }
      });
      if (!isIncluded) {
        console.log('[RankVed Chat] Page not in included pages list:', currentPath);
        return false;
      }
    }

    // If excludedPages is specified, don't show on those pages
    if (window.RankVedChatbotConfig.excludedPages && window.RankVedChatbotConfig.excludedPages.length > 0) {
      const isExcluded = window.RankVedChatbotConfig.excludedPages.some(pattern => {
        if (pattern.startsWith('/') && pattern.endsWith('/')) {
          // Regex pattern
          const regex = new RegExp(pattern.slice(1, -1));
          return regex.test(currentPath) || regex.test(currentUrl);
        } else {
          // Simple string match
          return currentPath.includes(pattern) || currentUrl.includes(pattern);
        }
      });
      if (isExcluded) {
        console.log('[RankVed Chat] Page excluded from chatbot display:', currentPath);
        return false;
      }
    }

    return true;
  }

  // Compact container creation
function createContainer() {
  console.log('🏗️ Creating chatbot container...');
  const c = document.createElement('div');
  c.id = 'rankved-chatbot-container';
  c.style.cssText = `
    position: fixed;
    z-index: 9999;
    font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
    bottom: 20px;
    right: 20px;
    pointer-events: auto; /* ✅ allow interaction inside chatbot */
    max-height: 80vh;
    overflow-y: auto;     /* ✅ make chatbot scrollable */
    overscroll-behavior: contain; /* ✅ prevent background scroll */
  `;
  document.body.appendChild(c);
  console.log('✅ Container created and added to DOM');
  return c;
}

  // Load React if not available
  function loadReact() {
    return new Promise((resolve, reject) => {
      if (window.React && window.ReactDOM) {
        console.log('✅ React and ReactDOM already available');
        resolve();
        return;
      }
      
      console.log('📦 Loading React and ReactDOM...');
      
      // Load React
      const reactScript = document.createElement('script');
      reactScript.src = 'https://unpkg.com/react@18/umd/react.production.min.js';
      reactScript.crossOrigin = '';
      
      // Load ReactDOM
      const reactDOMScript = document.createElement('script');
      reactDOMScript.src = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js';
      reactDOMScript.crossOrigin = '';
      
      reactScript.onload = () => {
        console.log('✅ React loaded');
        reactDOMScript.onload = () => {
          console.log('✅ ReactDOM loaded');
          resolve();
        };
        reactDOMScript.onerror = () => reject('Failed to load ReactDOM');
        document.head.appendChild(reactDOMScript);
      };
      
      reactScript.onerror = () => reject('Failed to load React');
      document.head.appendChild(reactScript);
    });
  }

  // Load bundle with detailed logging
  function loadBundle() {
    return new Promise((resolve, reject) => {
      console.log('📦 Loading chatbot bundle...');
      
      if (window.RankVedChatbot) {
        console.log('✅ Chatbot already loaded');
        return resolve(window.RankVedChatbot);
      }
      
      const s = document.createElement('script');
      
      // Load bundle from the frontend domain (where chatbot files are hosted)
      // Use the frontendUrl from config, or determine it dynamically
      let frontendDomain = window.RankVedChatbotConfig.frontendUrl;
      
      if (!frontendDomain) {
        // Try to determine the frontend URL dynamically
        const currentDomain = window.location.hostname;
        const currentProtocol = window.location.protocol;
        
        if (currentDomain === 'localhost') {
          frontendDomain = 'http://localhost:5173';
        } else {
          // For production, use the same domain as the current page
          // This assumes the chatbot bundle is hosted on the same domain
          frontendDomain = `${currentProtocol}//${currentDomain}`;
        }
      }
      
      // Try absolute URL first, then fallback to relative URL
      let bundleUrl = frontendDomain + '/chatbot-bundle.js';
      
      console.log('🌐 Frontend domain:', frontendDomain);
      console.log('📦 Bundle URL (from frontend domain):', bundleUrl);
      
      s.src = bundleUrl;
      s.async = true;
      
      s.onload = () => {
        console.log('✅ Bundle script loaded successfully');
        
        // Wait for the RankVedChatbot object to be available
        let retryCount = 0;
        const maxRetries = 50; // 5 seconds max wait
        
        const checkForChatbot = () => {
          console.log('🔍 Checking for RankVedChatbot object... (attempt ' + (retryCount + 1) + ')');
          console.log('🔍 window.RankVedChatbot:', window.RankVedChatbot);
          console.log('🔍 typeof window.RankVedChatbot:', typeof window.RankVedChatbot);
          
          if (window.RankVedChatbot && typeof window.RankVedChatbot.init === 'function') {
            console.log('✅ RankVedChatbot object found');
            console.log('🔍 RankVedChatbot methods:', Object.keys(window.RankVedChatbot));
            console.log('🔍 RankVedChatbot.init:', window.RankVedChatbot.init);
            console.log('🔍 typeof RankVedChatbot.init:', typeof window.RankVedChatbot.init);
            resolve(window.RankVedChatbot);
          } else if (retryCount < maxRetries) {
            retryCount++;
            console.log('⏳ RankVedChatbot not ready yet, retrying... (' + retryCount + '/' + maxRetries + ')');
            setTimeout(checkForChatbot, 100);
          } else {
            console.error('❌ Bundle loaded but RankVedChatbot object not found after ' + maxRetries + ' attempts');
            console.error('❌ Available window properties:', Object.keys(window).filter(key => key.includes('RankVed')));
            reject('Bundle loaded but init function not found after timeout');
          }
        };
        
        // Start checking immediately
        checkForChatbot();
      };
      
      s.onerror = (error) => {
        console.error('❌ Failed to load bundle from absolute URL:', error);
        console.error('❌ Bundle URL that failed:', bundleUrl);
        
        // Fallback to relative URL
        console.log('🔄 Trying relative URL fallback...');
        const relativeBundleUrl = '/chatbot-bundle.js';
        console.log('📦 Relative bundle URL:', relativeBundleUrl);
        
        s.src = relativeBundleUrl;
        
        s.onload = () => {
          console.log('✅ Bundle script loaded successfully from relative URL');
          
          // Wait for the RankVedChatbot object to be available
          let retryCount = 0;
          const maxRetries = 50; // 5 seconds max wait
          
          const checkForChatbot = () => {
            if (window.RankVedChatbot && typeof window.RankVedChatbot.init === 'function') {
              console.log('✅ RankVedChatbot object found');
              resolve(window.RankVedChatbot);
            } else if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(checkForChatbot, 100);
            } else {
              console.error('❌ Bundle loaded but RankVedChatbot object not found after ' + maxRetries + ' attempts');
              reject('Bundle loaded but init function not found after timeout');
            }
          };
          
          checkForChatbot();
        };
        
        s.onerror = (fallbackError) => {
          console.error('❌ Failed to load bundle from relative URL:', fallbackError);
          console.error('❌ Both absolute and relative URLs failed');
          reject('Failed to load bundle from both absolute and relative URLs');
        };
      };
      
      console.log('📤 Adding bundle script to DOM...');
      document.head.appendChild(s);
      console.log('✅ Bundle script added to DOM');
    });
  }

  // Fetch initial chatbot config to get apiUrl
  async function fetchInitialConfig(chatbotId) {
    console.log('🔧 Fetching initial config for chatbot:', chatbotId);
    
    // Try to determine the backend URL from the current page
    let backendUrl = window.RankVedChatbotConfig.apiUrl;
    
    if (!backendUrl) {
      // Try to guess the backend URL from the current domain
      const currentDomain = window.location.hostname;
      const currentProtocol = window.location.protocol;
      
      if (currentDomain === 'localhost') {
        backendUrl = 'http://localhost:3000';
      } else {
        // For production, use the deployed backend URL
        backendUrl = 'https://rankved-backend.onrender.com';
      }
    }
    
    console.log('🔧 Attempting to fetch config from:', backendUrl);
    console.log('🔧 Request URL:', `${backendUrl}/api/chatbot/${chatbotId}/config`);
    console.log('🔧 Headers:', {
      'Content-Type': 'application/json',
      'X-Domain': window.location.hostname,
      'X-Referer': document.referrer
    });
    
    try {
      const response = await fetch(`${backendUrl}/api/chatbot/${chatbotId}/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Domain': window.location.hostname,
          'X-Referer': document.referrer
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.status}`);
      }

      const config = await response.json();
      console.log('✅ Initial config fetched successfully:', config);
      
      // Update the global config with the fetched data
      window.RankVedChatbotConfig = {
        ...window.RankVedChatbotConfig,
        ...config,
        // Ensure the chatbotId from the fetched config is used
        chatbotId: config.id || config.chatbotId || window.RankVedChatbotConfig.chatbotId
      };
      
      console.log('✅ Updated global config:', window.RankVedChatbotConfig);
      console.log('✅ Using chatbotId:', window.RankVedChatbotConfig.chatbotId);
      
      return config;
    } catch (error) {
      console.error('❌ Failed to fetch initial config:', error);
      throw error;
    }
  }

  // Initialize chatbot with detailed logging
  async function init() {
    console.log('🎯 Initializing chatbot...');

    try {
      if (!window.RankVedChatbotConfig.chatbotId) {
        console.error('❌ RankVed Chatbot: chatbotId required');
        console.error('❌ Current config:', window.RankVedChatbotConfig);
        return;
      }

      console.log('✅ Chatbot ID found:', window.RankVedChatbotConfig.chatbotId);

      // Check if chatbot should be shown on this page
      if (!shouldShowChatbot()) {
        console.log('[RankVed Chat] Chatbot disabled for this page - stopping initialization');
        return; // Don't initialize the chatbot
      }
      
      // Fetch initial config to get apiUrl
      console.log('🔧 Fetching initial config...');
      await fetchInitialConfig(window.RankVedChatbotConfig.chatbotId);
      
      const container = createContainer();
      console.log('📦 Loading React...');
      await loadReact();
      console.log('📦 Loading bundle...');
      const chatbot = await loadBundle();
      console.log('🎯 Calling chatbot.init...');
      console.log(chatbot)
      chatbot.init({
        container: container,
        config: window.RankVedChatbotConfig,
        domain: window.location.hostname,
        referer: document.referrer
      });
      
      console.log('🎉 RankVed Chatbot initialized successfully!');
    } catch (error) {
      console.error('💥 RankVed Chatbot init failed:', error);
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        config: window.RankVedChatbotConfig
      });
    }
  }

  // Auto-init with logging
  console.log('⏰ Document ready state:', document.readyState);
  
  if (document.readyState === 'loading') {
    console.log('📝 Document still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📝 DOMContentLoaded fired, initializing...');
      init();
    });
  } else {
    console.log('📝 Document already loaded, initializing immediately...');
    init();
  }
  
  // Manual init
  window.initRankVedChatbot = init;
  console.log('🔧 Manual init function available: window.initRankVedChatbot()');
})(); 