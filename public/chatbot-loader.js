(function() {
  'use strict';
  
  console.log('🚀 RankVed Chatbot Loader: Starting...');
  
  // Minimal configuration with defaults
  window.RankVedChatbotConfig = window.RankVedChatbotConfig || {
    chatbotId: null,
    apiUrl: 'http://localhost:3000'
  };

  console.log('📋 RankVed Chatbot Config:', window.RankVedChatbotConfig);

  // Compact container creation
  function createContainer() {
    console.log('🏗️ Creating chatbot container...');
    const c = document.createElement('div');
    c.id = 'rankved-chatbot-container';
    c.style.cssText = 'position:fixed;z-index:9999;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;pointer-events:none;bottom:20px;right:20px;';
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
      const frontendDomain = window.RankVedChatbotConfig.frontendUrl || 'http://localhost:5173';
      const bundleUrl = frontendDomain + '/chatbot-bundle.js';
      
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
        console.error('❌ Failed to load bundle:', error);
        console.error('❌ Bundle URL that failed:', bundleUrl);
        reject('Failed to load bundle');
      };
      
      console.log('📤 Adding bundle script to DOM...');
      document.head.appendChild(s);
      console.log('✅ Bundle script added to DOM');
    });
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