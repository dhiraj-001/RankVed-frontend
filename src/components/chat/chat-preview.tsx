import { Bot, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatPreviewProps {
  chatbot?: any; // Accepts Chatbot or preview object with appearance props
}

export function ChatPreview({ chatbot }: ChatPreviewProps) {
  const primaryColor = chatbot?.primaryColor || chatbot?.primary_color || '#6366F1';
  const title = chatbot?.title || chatbot?.name || 'Support Bot';
  const welcomeMessage = chatbot?.welcomeMessage || 'Hello! How can I help you today?';

  // Modern styling props (support both camelCase and snake_case for preview objects)
  const chatWindowStyle = chatbot?.chatWindowStyle || chatbot?.chat_window_style || 'modern';
  const chatWindowTheme = chatbot?.chatWindowTheme || chatbot?.chat_window_theme || 'light';
  const borderRadius = chatbot?.borderRadius ?? chatbot?.border_radius ?? 16;
  const shadowStyle = chatbot?.shadowStyle || chatbot?.shadow_style || 'soft';
  const inputPlaceholder = chatbot?.inputPlaceholder || chatbot?.input_placeholder || 'Type your message...';

  // Dynamic styles
  const styleMap: Record<string, string> = {
    modern: 'bg-gradient-to-br from-slate-50 to-white border-slate-200',
    classic: 'bg-slate-50 border-slate-300',
    minimal: 'bg-white border-slate-100',
    floating: 'bg-white border-transparent',
  };
  const shadowMap: Record<string, string> = {
    none: '',
    soft: 'shadow-sm',
    medium: 'shadow-md',
    strong: 'shadow-lg',
  };

  // Theme-based classes
  const isDark = chatWindowTheme === 'dark';
  const windowBg = isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : styleMap[chatWindowStyle];
  const chatBg = isDark ? 'bg-slate-900' : 'bg-slate-50';
  const headerText = 'text-white';
  const botBubble = isDark ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-900';
  const userBubble = isDark ? 'bg-primary text-white' : 'text-white';
  const inputBg = isDark ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400' : 'bg-white border-slate-200 text-slate-900';
  const inputPlaceholderClass = isDark ? 'placeholder:text-slate-400' : 'placeholder:text-slate-400';

  return (
    <div className="border-2 border-slate-200 rounded-2xl p-6 bg-transparent flex justify-center items-center min-h-[420px]">
      <div
        className={`w-full max-w-sm mx-auto border transition-all duration-300 ${windowBg} ${shadowMap[shadowStyle]}`}
        style={{ borderRadius: borderRadius, background: isDark ? 'linear-gradient(135deg, #1e293b 60%, #334155 100%)' : undefined }}
      >
        {/* Chat Header */}
        <div
          className={`p-4 rounded-t-2xl flex items-center gap-3 ${headerText}`}
          style={{ backgroundColor: primaryColor, borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}
        >
          <Avatar className="h-8 w-8 border-2 border-white shadow-md">
            <AvatarImage src={chatbot?.chatWidgetIcon || undefined} />
            <AvatarFallback className="bg-white/20">
              <Bot className="h-4 w-4 text-white" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate">{title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs opacity-90">Online</span>
            </div>
          </div>
        </div>
        {/* Chat Messages */}
        <div className={`p-4 space-y-4 h-56 overflow-y-auto ${chatBg}`} style={{ borderBottomLeftRadius: borderRadius, borderBottomRightRadius: borderRadius }}>
          <div className="flex space-x-3 items-start">
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarImage src={chatbot?.chatWindowAvatar || undefined} />
              <AvatarFallback style={{ backgroundColor: primaryColor }}>
                <Bot className="h-4 w-4 text-white" />
              </AvatarFallback>
            </Avatar>
            <div className={`${botBubble} p-3 rounded-2xl text-sm shadow max-w-[80%]`}>{welcomeMessage}</div>
          </div>
          <div className="flex justify-end">
            <div
              className={`p-3 rounded-2xl text-sm max-w-[80%] ${userBubble}`}
              style={{ backgroundColor: primaryColor }}
            >
              I need help with my account
            </div>
          </div>
          <div className="flex space-x-3 items-start">
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarImage src={chatbot?.chatWindowAvatar || undefined} />
              <AvatarFallback style={{ backgroundColor: primaryColor }}>
                <Bot className="h-4 w-4 text-white" />
              </AvatarFallback>
            </Avatar>
            <div className={`${botBubble} p-3 rounded-2xl text-sm shadow max-w-[80%]`}>
              I'd be happy to help! What specific issue are you experiencing?
            </div>
          </div>
        </div>
        {/* Chat Input */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} bg-transparent`} style={{ borderBottomLeftRadius: borderRadius, borderBottomRightRadius: borderRadius, boxShadow: isDark ? '0 2px 8px rgba(30,41,59,0.12)' : '0 2px 8px rgba(100,116,139,0.08)' }}>
          <div className="flex space-x-2">
            <Input
              placeholder={inputPlaceholder}
              className={`flex-1 text-sm h-9 ${inputBg} ${inputPlaceholderClass} rounded-xl shadow-inner`}
              disabled
            />
            <Button size="sm" style={{ backgroundColor: primaryColor }} className="rounded-xl shadow" disabled>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {chatbot?.poweredByText && (
            <div className="mt-2 text-center">
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{chatbot.poweredByText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
