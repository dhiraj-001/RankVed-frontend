# RankVed Chatbot Embed System

A complete chatbot embed solution that allows you to integrate AI-powered chatbots into any website with complete isolation and security.

## 🚀 Features

- **Complete Isolation**: Uses Shadow DOM to prevent CSS conflicts
- **React-based**: Built with modern React and TypeScript
- **Customizable**: Themes, colors, positions, and behaviors
- **Secure**: Domain validation and session management
- **Mobile Responsive**: Optimized for all screen sizes
- **Sound Support**: Notification sounds with volume control
- **Multiple AI Providers**: Support for OpenAI, Google Gemini, and custom providers
- **Analytics**: Built-in session and message tracking

## 📁 File Structure

```
frontend/
├── public/
│   ├── chatbot-loader.js          # Loader script for websites
│   ├── chatbot-bundle.js          # Bundled React app (generated)
│   └── chatbot-demo.html          # Demo page
├── src/
│   └── components/
│       └── chatbot-embed/
│           ├── ChatbotEmbed.tsx   # Main React component
│           └── index.tsx          # Entry point for bundling
├── webpack.chatbot.config.js      # Webpack config for bundling
└── package.json                   # Build scripts
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install webpack webpack-cli ts-loader terser-webpack-plugin --save-dev
```

### 2. Build the Chatbot Bundle

```bash
npm run build:chatbot
```

This will create `public/chatbot-bundle.js` which contains the bundled React application.

### 3. Configure Backend

Make sure your backend has the `/api/chat` endpoint configured (already added to `backend/server/routes.ts`).

### 4. Update Configuration

Update the `apiUrl` in `public/chatbot-loader.js` to point to your actual backend domain.

## 🌐 Website Integration

### Basic Integration

Add this to any website's HTML:

```html
<!-- Configure the chatbot -->
<script>
window.RankVedChatbotConfig = {
    chatbotId: 'your-chatbot-id',
    apiUrl: 'https://your-backend-domain.com',
    position: 'bottom-right',
    theme: 'light',
    primaryColor: '#3B82F6'
};
</script>

<!-- Load the chatbot -->
<script src="https://your-backend-domain.com/chatbot-loader.js"></script>
```

### Advanced Configuration

```javascript
window.RankVedChatbotConfig = {
    // Required
    chatbotId: 'your-chatbot-id',
    apiUrl: 'https://your-backend-domain.com',

    // Optional
    position: 'bottom-right',        // bottom-right, bottom-left, top-right, top-left
    theme: 'light',                  // light, dark
    primaryColor: '#3B82F6',         // Any CSS color
    autoOpen: false,                 // true/false
    popupDelay: 3000,               // milliseconds
    greetingMessage: 'Hello! How can I help you?',
    soundEnabled: true,              // true/false
    showAvatar: true,                // true/false
    avatarUrl: 'https://example.com/avatar.png',
    zIndex: 9999,                    // CSS z-index

    // Page Visibility Control
    excludedPages: ['/blog', '/admin', '/privacy', '/terms', '/login', '/signup'], // Hide chatbot on these pages
    includedPages: ['/contact', '/support', '/pricing'] // Only show on these pages (overrides excludedPages)
};
```

## 🔒 Security Features

### Domain Validation

The backend validates requests using:
- `X-Domain` header (current domain)
- `X-Referer` header (referring domain)
- `X-Chatbot-ID` header (chatbot identifier)

### Session Management

- Unique session IDs for each user
- IP address and user agent tracking
- Automatic session cleanup

### Access Control

Configure allowed domains in your chatbot settings:

```json
{
    "allowedDomains": ["example.com", "subdomain.example.com"]
}
```

## 🎨 Customization

### Themes

```javascript
// Light theme (default)
theme: 'light'

// Dark theme
theme: 'dark'
```

### Positions

```javascript
position: 'bottom-right'  // Default
position: 'bottom-left'
position: 'top-right'
position: 'top-left'
```

### Colors

```javascript
primaryColor: '#3B82F6'   // Blue (default)
primaryColor: '#10B981'   // Green
primaryColor: '#F59E0B'   // Yellow
primaryColor: '#EF4444'   // Red
```

## 🎯 Page Visibility Control

Control where your chatbot appears on embedded websites using page-based rules.

### Configuration Options

```javascript
window.RankVedChatbotConfig = {
    // Hide chatbot on specific pages
    excludedPages: ['/blog', '/admin', '/privacy'],

    // Only show chatbot on specific pages (takes precedence over excludedPages)
    includedPages: ['/contact', '/support', '/pricing']
};
```

### How It Works

- **excludedPages**: Array of page patterns to hide the chatbot
- **includedPages**: Array of page patterns to show the chatbot (if specified, chatbot only appears on these pages)
- **Pattern Matching**: Supports both simple strings and regex patterns
- **Priority**: `includedPages` takes precedence over `excludedPages`

### Pattern Examples

```javascript
// Simple string matching
excludedPages: ['/blog', '/admin']

// Regex patterns (enclosed in forward slashes)
excludedPages: ['/blog/.*', '/admin/.*']

// Mix of both
excludedPages: ['/blog', '/admin/.*', '/privacy-policy']
```

### Use Cases

- **Hide on blog pages**: `excludedPages: ['/blog']`
- **Hide on admin/auth pages**: `excludedPages: ['/admin', '/login', '/signup', '/dashboard']`
- **Hide on legal pages**: `excludedPages: ['/privacy', '/terms', '/legal', '/cookies']`
- **Only show on contact/support**: `includedPages: ['/contact', '/support']`
- **Hide on multiple sections**: `excludedPages: ['/blog', '/admin', '/dashboard', '/settings']`
- **Complex patterns**: `excludedPages: ['/blog/.*', '/news/.*', '/category/.*']`
- **E-commerce exclusions**: `excludedPages: ['/cart', '/checkout', '/account', '/orders']`
- **Content management**: `excludedPages: ['/wp-admin', '/admin', '/editor', '/cms']`

## 📱 Mobile Responsiveness

The chatbot automatically adapts to mobile screens:
- Touch-friendly interface
- Responsive message bubbles
- Optimized input fields
- Mobile-optimized layout

## 🔧 Development

### Local Development

1. Start the backend server
2. Build the chatbot bundle: `npm run build:chatbot`
3. Serve the files: `npm run preview`
4. Open `chatbot-demo.html` to test

### Customizing the Component

Edit `src/components/chatbot-embed/ChatbotEmbed.tsx` to modify:
- UI layout and styling
- Message handling
- Sound effects
- Animation behavior

### Adding Features

1. Modify the React component
2. Update the TypeScript interfaces
3. Rebuild the bundle: `npm run build:chatbot`
4. Test in the demo page

## 📊 Analytics

The chatbot automatically tracks:
- Chat sessions and duration
- Message count and response times
- User engagement metrics
- Domain and referrer information
- Device and browser statistics

## 🚨 Troubleshooting

### Common Issues

1. **Chatbot not loading**
   - Check if `chatbot-bundle.js` is accessible
   - Verify `apiUrl` is correct
   - Check browser console for errors

2. **Messages not sending**
   - Verify backend `/api/chat` endpoint is working
   - Check domain validation settings
   - Ensure `chatbotId` is correct

3. **Styling conflicts**
   - Shadow DOM should prevent most conflicts
   - Check if any global CSS is affecting the container

4. **Sound not playing**
   - Check browser autoplay policies
   - Verify audio file is accessible
   - Ensure `soundEnabled` is true

### Debug Mode

Add this to enable debug logging:

```javascript
window.RankVedChatbotConfig = {
    // ... other config
    debug: true
};
```

## 🔄 Updates

To update the chatbot on client websites:

1. Modify the React component
2. Rebuild the bundle: `npm run build:chatbot`
3. Deploy the new `chatbot-bundle.js`
4. Clear CDN cache if using one

## 📄 License

This chatbot embed system is part of the RankVed platform.

## 🤝 Support

For support and questions:
- Check the demo page: `chatbot-demo.html`
- Review the configuration options
- Test with the provided examples 