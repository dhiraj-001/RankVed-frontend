import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffInMs = now.getTime() - d.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMins < 1) return "just now";
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return formatDate(d);
}

export function generateEmbedCode(chatbotId: string, chatbot?: any): string {
  const domain = window.location.origin;

  return `<!-- RankVed WordPress Compatible Embed -->
<script>
  (function() {
    // WordPress compatibility check
    if (window.rankvedChatbotInitialized) return;
    window.rankvedChatbotInitialized = true;
    
    // Enhanced configuration for WordPress
    window.CHATBOT_CONFIG = {
      chatbotId: '${chatbotId}',
      apiUrl: '${domain}',
      name: '${chatbot?.name || "Support Chat"}',
      welcomeMessage: '${chatbot?.welcomeMessage || "Hello! How can I help you today?"}',
      placeholder: '${chatbot?.placeholder || "Type your message..."}',
      primaryColor: '${chatbot?.primaryColor || "#3B82F6"}',
      chatWindowAvatar: '${chatbot?.chatWindowAvatar || ""}',
      chatBubbleIcon: '${chatbot?.chatBubbleIcon || ""}',
      questionFlow: ${JSON.stringify(chatbot?.questionFlow || null)},
      questionFlowEnabled: ${chatbot?.questionFlowEnabled || false},
      suggestionButtons: ${JSON.stringify(chatbot?.suggestionButtons || [])},
      suggestionTiming: '${chatbot?.suggestionTiming || "after_welcome"}',
      leadCollectionEnabled: ${chatbot?.leadCollectionEnabled || false},
      leadCollectionAfterMessages: ${chatbot?.leadCollectionAfterMessages || 3},
      leadCollectionMessage: '${chatbot?.leadCollectionMessage || "Would you like to leave your contact information?"}',
      chatWindowTheme: '${chatbot?.chatWindowTheme || "light"}',
      borderRadius: ${chatbot?.borderRadius || 16},
      shadowStyle: '${chatbot?.shadowStyle || "soft"}',
      poweredBy: 'Powered by RankVed',
      poweredByLink: 'https://rankved.com'
    };
    
    // WordPress-safe loading function
    function loadChatBot() {
      const script = document.createElement('script');
      script.src = '${domain}/wordpress-embed.js';
      script.async = true;
      script.defer = true;
      script.setAttribute('data-rankved-widget', 'true');
      script.onload = function() {
        console.log('RankVed Chat loaded');
      };
      script.onerror = function() {
        console.warn('RankVed Chat could not be loaded');
      };
      
      // WordPress theme compatibility
      const target = document.querySelector('head') || document.body;
      target.appendChild(script);
    }
    
    // Enhanced DOM ready detection for WordPress
    function initWhenReady() {
      if (document.readyState === 'complete' || 
          (document.readyState === 'interactive' && document.body)) {
        loadChatBot();
      } else {
        document.addEventListener('DOMContentLoaded', loadChatBot);
        document.addEventListener('load', loadChatBot);
        // Fallback for WordPress AJAX themes
        setTimeout(loadChatBot, 1000);
      }
    }
    
    initWhenReady();
  })();
</script>
<!-- End RankVed Embed -->`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
}

export function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function fileToDataURI(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString });
}

export function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
}
