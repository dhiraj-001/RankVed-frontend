import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Chatbot } from '@/types';

interface ChatBubbleProps {
  chatbot: Chatbot;
  onClick: () => void;
  isOpen: boolean;
  className?: string;
}

export function ChatBubble({ chatbot, onClick, isOpen, className }: ChatBubbleProps) {
  const [hasNotification, setHasNotification] = useState(true);

  const handleClick = () => {
    setHasNotification(false);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group chat-bubble-enter',
        className
      )}
      style={{ 
        backgroundColor: chatbot.primaryColor || '#6366F1',
        position: 'fixed',
        bottom: `${chatbot.verticalOffset || 20}px`,
        right: `${chatbot.horizontalOffset || 20}px`,
        zIndex: 1000,
      }}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? (
        <X className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
      ) : (
        <MessageCircle className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
      )}
      
      {/* Notification Badge */}
      {hasNotification && !isOpen && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
          1
        </div>
      )}
    </button>
  );
}
