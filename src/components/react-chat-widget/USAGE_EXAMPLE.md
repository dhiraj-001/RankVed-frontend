# RankVed ChatWidget - React Component Usage

## Quick Start

### 1. Basic Usage

```tsx
import React from 'react';
import ChatWidget from './ChatWidget';

function App() {
  return (
    <div>
      <h1>My Website</h1>
      <p>Welcome to my website!</p>
      
      {/* Add the chatbot */}
      <ChatWidget 
        chatbotId="your-chatbot-id-here" 
      />
    </div>
  );
}
```

### 2. With Configuration

```tsx
import React from 'react';
import ChatWidget from './ChatWidget';

function App() {
  return (
    <div>
      <h1>My Website</h1>
      <p>Welcome to my website!</p>
      
      <ChatWidget 
        chatbotId="your-chatbot-id-here"
        config={{
          position: 'bottom-left',
          theme: 'dark',
          primaryColor: '#FF6B6B',
          autoOpen: true,
          greetingMessage: 'Hi! How can I help you today?'
        }}
        onLoad={() => console.log('Chatbot loaded!')}
        onError={(error) => console.error('Chatbot error:', error)}
      />
    </div>
  );
}
```

### 3. Multiple Chatbots

```tsx
import React from 'react';
import ChatWidget from './ChatWidget';

function App() {
  return (
    <div>
      <h1>My Website</h1>
      
      {/* Support chatbot */}
      <ChatWidget 
        chatbotId="support-chatbot-id"
        config={{
          position: 'bottom-right',
          theme: 'light',
          primaryColor: '#6366F1'
        }}
      />
      
      {/* Sales chatbot */}
      <ChatWidget 
        chatbotId="sales-chatbot-id"
        config={{
          position: 'bottom-left',
          theme: 'dark',
          primaryColor: '#FF6B6B'
        }}
      />
    </div>
  );
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiUrl` | string | `'https://rankved-backend.onrender.com'` | Backend API URL |
| `frontendUrl` | string | `'https://rank-ved-frontend-rfam.vercel.app'` | Frontend URL for assets |
| `position` | string | `'bottom-right'` | Position: `'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'`, `'center'` |
| `theme` | string | `'light'` | Theme: `'light'` or `'dark'` |
| `primaryColor` | string | `'#6366F1'` | Primary color for the chatbot |
| `zIndex` | number | `9999` | CSS z-index for layering |
| `autoOpen` | boolean | `false` | Whether to auto-open the chat window |
| `greetingMessage` | string | `'Hello! How can I help you today?'` | Initial greeting message |
| `showAvatar` | boolean | `true` | Whether to show the chatbot avatar |
| `soundEnabled` | boolean | `true` | Whether to enable sound notifications |
| `popupDelay` | number | `2000` | Delay before showing the chat bubble (ms) |
| `messageDelay` | number | `1000` | Delay between messages (ms) |
| `horizontalOffset` | number | `20` | Horizontal offset from edge (px) |
| `verticalOffset` | number | `20` | Vertical offset from edge (px) |
| `borderRadius` | number | `16` | Border radius for the chat window (px) |
| `shadowStyle` | string | `'soft'` | Shadow style: `'none'`, `'soft'`, `'medium'`, `'strong'` |

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `chatbotId` | string | ✅ | The unique ID of your chatbot |
| `config` | ChatWidgetConfig | ❌ | Configuration object |
| `onLoad` | () => void | ❌ | Callback when chatbot loads successfully |
| `onError` | (error: Error) => void | ❌ | Callback when chatbot fails to load |

## Features

✅ **All Existing Features Included:**
- Lead collection forms
- Sound management
- AI responses with intent detection
- Formatted text rendering (bold, italic, links, etc.)
- Follow-up buttons
- CTA buttons
- Welcome messages
- Custom themes and colors
- Responsive design
- Shadow DOM isolation

✅ **Easy Integration:**
- Just import and use
- No additional setup required
- Automatic cleanup on unmount
- TypeScript support

✅ **Customizable:**
- Full configuration options
- Event callbacks
- Multiple chatbots support

## Installation

1. Copy the `ChatWidget.tsx` component to your project
2. Import and use it in your React components
3. That's it! No additional dependencies required

## Notes

- The component doesn't render anything visible (returns `null`)
- It automatically loads React and the chatbot bundle if needed
- It handles cleanup when the component unmounts
- It uses the existing ChatbotEmbed functionality under the hood 