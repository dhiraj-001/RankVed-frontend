# RankVed Chatbot Embed Implementation Guide

This guide provides step-by-step instructions for embedding the RankVed chatbot into external websites using both iframe and React methods.

## 🎯 Overview

The RankVed chatbot can be embedded in two ways:
1. **Iframe Method**: Simple HTML iframe for basic integration
2. **React Method**: Advanced JavaScript loader for full customization

## 📋 Prerequisites

Before implementing, ensure you have:
- A deployed RankVed backend server
- A deployed RankVed frontend server
- A valid chatbot ID
- Domain permissions configured

## 🌐 Method 1: Iframe Embedding

### Basic Iframe Implementation

```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Website</title>
</head>
<body>
    <!-- Your website content -->
    
    <!-- Chatbot iframe -->
    <iframe 
        src="https://your-frontend-domain.com/chat-embed?chatbotId=YOUR_CHATBOT_ID&domain=your-website.com"
        style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 380px;
            height: 600px;
            border: none;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            z-index: 9999;
            background: transparent;
        "
        allow="microphone"
        title="RankVed Chatbot">
    </iframe>
</body>
</html>
```

### Advanced Iframe with Parameters

```html
<iframe 
    src="https://your-frontend-domain.com/chat-embed?chatbotId=YOUR_CHATBOT_ID&domain=your-website.com&theme=dark&position=bottom-left&primaryColor=%233B82F6&autoOpen=false&popupDelay=3000"
    style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 380px;
        height: 600px;
        border: none;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        z-index: 9999;
        background: transparent;
    "
    allow="microphone"
    title="RankVed Chatbot">
</iframe>
```

### Iframe URL Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `chatbotId` | string | required | Your chatbot ID |
| `domain` | string | required | Your website domain |
| `theme` | string | 'light' | 'light' or 'dark' |
| `position` | string | 'bottom-right' | 'bottom-right', 'bottom-left', 'top-right', 'top-left' |
| `primaryColor` | string | '#3B82F6' | Primary color (URL encoded) |
| `autoOpen` | boolean | false | Whether to auto-open chat |
| `popupDelay` | number | 0 | Delay before showing popup (ms) |
| `soundEnabled` | boolean | true | Enable notification sounds |
| `showAvatar` | boolean | true | Show chatbot avatar |

### Responsive Iframe Implementation

```html
<style>
.chatbot-iframe {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 380px;
    height: 600px;
    border: none;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    z-index: 9999;
    background: transparent;
}

/* Mobile responsive */
@media (max-width: 768px) {
    .chatbot-iframe {
        width: calc(100vw - 40px);
        height: calc(100vh - 120px);
        bottom: 20px;
        right: 20px;
        left: 20px;
    }
}
</style>

<iframe 
    class="chatbot-iframe"
    src="https://your-frontend-domain.com/chat-embed?chatbotId=YOUR_CHATBOT_ID&domain=your-website.com"
    allow="microphone"
    title="RankVed Chatbot">
</iframe>
```

## ⚛️ Method 2: React Embedding (Recommended)

### Basic React Implementation

```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Website</title>
</head>
<body>
    <!-- Your website content -->
    
    <!-- Configure the chatbot -->
    <script>
    window.RankVedChatbotConfig = {
        chatbotId: 'YOUR_CHATBOT_ID',
        apiUrl: 'https://your-backend-domain.com',
        frontendUrl: 'https://your-frontend-domain.com'
    };
    </script>
    
    <!-- Load the chatbot -->
    <script src="https://your-frontend-domain.com/chatbot-loader.js"></script>
</body>
</html>
```

### Advanced React Configuration

```html
<script>
window.RankVedChatbotConfig = {
    // Required
    chatbotId: 'YOUR_CHATBOT_ID',
    apiUrl: 'https://your-backend-domain.com',
    frontendUrl: 'https://your-frontend-domain.com',
    
    // Appearance
    position: 'bottom-right',        // bottom-right, bottom-left, top-right, top-left
    theme: 'light',                  // light, dark
    primaryColor: '#3B82F6',         // Primary color
    secondaryColor: '#1D4ED8',       // Secondary color
    borderRadius: 16,                // Border radius in pixels
    shadowStyle: 'soft',             // none, soft, medium, strong
    zIndex: 9999,                    // CSS z-index
    
    // Behavior
    autoOpen: false,                 // Auto-open chat window
    popupDelay: 3000,               // Delay before showing popup (ms)
    messageDelay: 1000,             // Delay between messages (ms)
    replyDelay: 1000,               // Typing delay (ms)
    
    // Content
    greetingMessage: 'Hello! How can I help you today?',
    welcomeMessage: 'Welcome to our support chat!',
    inputPlaceholder: 'Type your message...',
    
    // Avatar and branding
    showAvatar: true,
    avatarUrl: 'https://example.com/avatar.png',
    chatBubbleIcon: 'https://example.com/bubble-icon.png',
    chatWidgetIcon: 'https://example.com/widget-icon.png',
    chatWindowAvatar: 'https://example.com/window-avatar.png',
    chatWidgetName: 'Support Assistant',
    chatWidgetTitle: 'Chat with us',
    
    // Sound settings
    soundEnabled: true,
    popupSoundEnabled: true,
    customPopupSound: 'https://example.com/custom-sound.mp3',
    popupSoundVolume: 50,            // 0-100
    
    // Lead collection
    leadCollectionEnabled: false,
    leadCollectionFields: ['name', 'email', 'phone'],
    leadButtonText: 'Get Contacted',
    
    // Contact information
    whatsapp: '+1234567890',
    email: 'support@example.com',
    phone: '+1234567890',
    website: 'https://example.com',
    
    // Branding
    poweredByText: 'Powered by RankVed',
    poweredByLink: 'https://rankved.com',
    
    // Advanced
    showWelcomePopup: true,
    suggestionButtons: ['How to order?', 'Pricing', 'Contact support'],
    bubblePosition: 'bottom-right',
    horizontalOffset: 20,
    verticalOffset: 20,
    
    // Debug
    debug: false
};
</script>

<script src="https://your-frontend-domain.com/chatbot-loader.js"></script>
```

### React Embedding with Dynamic Configuration

```html
<script>
// Load configuration from your server
async function loadChatbotConfig() {
    try {
        const response = await fetch('https://your-api.com/chatbot-config');
        const config = await response.json();
        
        window.RankVedChatbotConfig = {
            chatbotId: config.chatbotId,
            apiUrl: 'https://your-backend-domain.com',
            frontendUrl: 'https://your-frontend-domain.com',
            ...config
        };
        
        // Load chatbot after config is ready
        loadChatbot();
    } catch (error) {
        console.error('Failed to load chatbot config:', error);
    }
}

function loadChatbot() {
    const script = document.createElement('script');
    script.src = 'https://your-frontend-domain.com/chatbot-loader.js';
    document.head.appendChild(script);
}

// Load config and chatbot
loadChatbotConfig();
</script>
```

### React Embedding with Multiple Chatbots

```html
<script>
// Configuration for multiple chatbots
const chatbotConfigs = {
    'support': {
        chatbotId: 'support-chatbot',
        chatWidgetName: 'Support Chat',
        primaryColor: '#3B82F6',
        position: 'bottom-right'
    },
    'sales': {
        chatbotId: 'sales-chatbot',
        chatWidgetName: 'Sales Chat',
        primaryColor: '#10B981',
        position: 'bottom-left'
    }
};

// Initialize specific chatbot
function initChatbot(type) {
    const config = chatbotConfigs[type];
    if (!config) return;
    
    window.RankVedChatbotConfig = {
        apiUrl: 'https://your-backend-domain.com',
        frontendUrl: 'https://your-frontend-domain.com',
        ...config
    };
    
    // Load chatbot
    const script = document.createElement('script');
    script.src = 'https://your-frontend-domain.com/chatbot-loader.js';
    document.head.appendChild(script);
}

// Initialize support chatbot
initChatbot('support');
</script>
```

## 🔧 WordPress Integration

### WordPress Plugin Method

```php
<?php
/*
Plugin Name: RankVed Chatbot
Description: Embed RankVed chatbot in WordPress
Version: 1.0
*/

function rankved_chatbot_enqueue_scripts() {
    // Enqueue chatbot loader
    wp_enqueue_script(
        'rankved-chatbot',
        'https://your-frontend-domain.com/chatbot-loader.js',
        array(),
        '1.0.0',
        true
    );
    
    // Add configuration
    wp_add_inline_script('rankved-chatbot', '
        window.RankVedChatbotConfig = {
            chatbotId: "' . get_option('rankved_chatbot_id', 'default') . '",
            apiUrl: "https://your-backend-domain.com",
            frontendUrl: "https://your-frontend-domain.com",
            theme: "' . get_option('rankved_chatbot_theme', 'light') . '",
            primaryColor: "' . get_option('rankved_chatbot_color', '#3B82F6') . '"
        };
    ');
}
add_action('wp_enqueue_scripts', 'rankved_chatbot_enqueue_scripts');
?>
```

### WordPress Shortcode Method

```php
function rankved_chatbot_shortcode($atts) {
    $atts = shortcode_atts(array(
        'chatbot_id' => 'default',
        'theme' => 'light',
        'position' => 'bottom-right'
    ), $atts);
    
    return '
    <script>
    window.RankVedChatbotConfig = {
        chatbotId: "' . esc_attr($atts['chatbot_id']) . '",
        apiUrl: "https://your-backend-domain.com",
        frontendUrl: "https://your-frontend-domain.com",
        theme: "' . esc_attr($atts['theme']) . '",
        position: "' . esc_attr($atts['position']) . '"
    };
    </script>
    <script src="https://your-frontend-domain.com/chatbot-loader.js"></script>
    ';
}
add_shortcode('rankved_chatbot', 'rankved_chatbot_shortcode');
```

Usage: `[rankved_chatbot chatbot_id="support" theme="dark" position="bottom-left"]`

## 🛒 E-commerce Integration

### Shopify Integration

```liquid
<!-- In your Shopify theme's layout file -->
<script>
window.RankVedChatbotConfig = {
    chatbotId: '{{ settings.rankved_chatbot_id }}',
    apiUrl: 'https://your-backend-domain.com',
    frontendUrl: 'https://your-frontend-domain.com',
    theme: '{{ settings.rankved_chatbot_theme }}',
    primaryColor: '{{ settings.rankved_chatbot_color }}',
    autoOpen: {{ settings.rankved_chatbot_auto_open | json }},
    popupDelay: {{ settings.rankved_chatbot_popup_delay | default: 3000 }},
    leadCollectionEnabled: true,
    leadCollectionFields: ['name', 'email', 'phone']
};
</script>
<script src="https://your-frontend-domain.com/chatbot-loader.js"></script>
```

### WooCommerce Integration

```php
// Add to functions.php
function rankved_chatbot_woocommerce() {
    if (is_woocommerce() || is_cart() || is_checkout()) {
        echo '
        <script>
        window.RankVedChatbotConfig = {
            chatbotId: "' . get_option('rankved_chatbot_id') . '",
            apiUrl: "https://your-backend-domain.com",
            frontendUrl: "https://your-frontend-domain.com",
            leadCollectionEnabled: true,
            leadCollectionFields: ["name", "email", "phone"]
        };
        </script>
        <script src="https://your-frontend-domain.com/chatbot-loader.js"></script>
        ';
    }
}
add_action('wp_footer', 'rankved_chatbot_woocommerce');
```

## 🔒 Security Considerations

### Domain Validation

```javascript
// Backend validation (Node.js/Express example)
app.use('/api/chat', (req, res, next) => {
    const allowedDomains = ['example.com', 'www.example.com'];
    const requestDomain = req.headers['x-domain'];
    
    if (!allowedDomains.includes(requestDomain)) {
        return res.status(403).json({ error: 'Domain not allowed' });
    }
    
    next();
});
```

### CORS Configuration

```javascript
// Backend CORS setup
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://your-frontend-domain.com',
            'https://example.com',
            'https://www.example.com'
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
```

## 🧪 Testing

### Test Page Template

```html
<!DOCTYPE html>
<html>
<head>
    <title>Chatbot Test Page</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test-section { margin: 20px 0; padding: 20px; border: 1px solid #ccc; }
    </style>
</head>
<body>
    <h1>RankVed Chatbot Test Page</h1>
    
    <div class="test-section">
        <h2>Iframe Method</h2>
        <iframe 
            src="https://your-frontend-domain.com/chat-embed?chatbotId=test&domain=localhost"
            style="width: 380px; height: 600px; border: 1px solid #ccc;">
        </iframe>
    </div>
    
    <div class="test-section">
        <h2>React Method</h2>
        <script>
        window.RankVedChatbotConfig = {
            chatbotId: 'test',
            apiUrl: 'https://your-backend-domain.com',
            frontendUrl: 'https://your-frontend-domain.com',
            debug: true
        };
        </script>
        <script src="https://your-frontend-domain.com/chatbot-loader.js"></script>
    </div>
</body>
</html>
```

## 🚨 Troubleshooting

### Common Issues

1. **Chatbot not loading**
   ```javascript
   // Check browser console for errors
   // Verify URLs are accessible
   // Check CORS settings
   ```

2. **Messages not sending**
   ```javascript
   // Verify backend API is running
   // Check chatbot ID is correct
   // Verify domain permissions
   ```

3. **Styling conflicts**
   ```css
   /* Add CSS isolation if needed */
   .rankved-chatbot {
       all: initial;
       font-family: inherit;
   }
   ```

### Debug Mode

```javascript
window.RankVedChatbotConfig = {
    // ... other config
    debug: true  // Enable detailed logging
};
```

## 📊 Analytics and Tracking

### Google Analytics Integration

```javascript
window.RankVedChatbotConfig = {
    // ... other config
    onMessageSent: function(message) {
        gtag('event', 'chat_message_sent', {
            'event_category': 'chatbot',
            'event_label': message.substring(0, 50)
        });
    },
    onChatOpened: function() {
        gtag('event', 'chat_opened', {
            'event_category': 'chatbot'
        });
    }
};
```

### Custom Tracking

```javascript
window.RankVedChatbotConfig = {
    // ... other config
    onLeadSubmitted: function(leadData) {
        // Send to your CRM
        fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
        });
    }
};
```

## 🔄 Updates and Maintenance

### Version Management

```javascript
// Add version to config for cache busting
window.RankVedChatbotConfig = {
    // ... other config
    version: '1.2.0'
};
```

### A/B Testing

```javascript
// Different configs for different user segments
const userSegment = getUserSegment(); // Your segmentation logic

window.RankVedChatbotConfig = {
    chatbotId: userSegment === 'premium' ? 'premium-support' : 'standard-support',
    theme: userSegment === 'premium' ? 'dark' : 'light',
    // ... other config
};
```

This comprehensive guide covers all aspects of embedding the RankVed chatbot into external websites. Choose the method that best fits your needs and follow the security best practices for production deployment. 