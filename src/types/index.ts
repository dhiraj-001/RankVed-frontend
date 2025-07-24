// Database types - copied from shared schema
export interface User {
  id: number;
  username: string;
  email: string;
  agencyName: string;
  agencyLogo?: string;
  onboardingCompleted: boolean;
  businessType?: string;
  primaryGoals: string[];
  experienceLevel: string;
  onboardingStep: number;
  personalizedRecommendations?: any;
  createdAt: Date;
}

export interface Chatbot {
  id: string;
  userId: number;
  name: string;
  description?: string;
  isActive:boolean
  
  // AI Configuration
  aiSystemPrompt: string;
  aiProvider: string;
  customApiKey?: string;
  
  // Branding
  chatWindowAvatar?: string;
  chatBubbleIcon?: string;
  chatWidgetIcon?: string;
  chatWidgetName?: string;
  
  // Messaging
  welcomeMessage: string;
  initialMessageDelay: number;
  
  // Notifications
  enableNotificationSound: boolean;
  customNotificationSound?: string;
  
  // Integrations
  leadsWebhookUrl?: string;
  
  // Flow & Branding
  businessType: string;
  poweredByText?: string;
  poweredByLink?: string;
  
  // Placement
  bubblePosition: string;
  horizontalOffset: number;
  verticalOffset: number;
  
  // Lead Collection
  leadCollectionEnabled: boolean;
  leadCollectionAfterMessages: number;
  leadCollectionMessage: string;
  
  // Usage Limits
  dailyChatLimit: number;
  monthlyChatLimit: number;
  
  // Training Data
  trainingData?: string;
  
  // Question Flow
  questionFlow?: any;
  questionFlowEnabled?: boolean;
  
  leadButtonText?: string;
  createdAt: Date;
  updatedAt: Date;
  conversations?: number;
  leads?: number;
  allowedDomains?: string[];
  inputPlaceholder?: string;
  primaryColor?: string;
  secondaryColor?: string;
  suggestionButtons?: any;
  title?: string;
  showWelcomePopup?: boolean;
  suggestionTiming?: string;
  suggestionPersistence?: string;
  suggestionTimeout?: number;
  chatWindowStyle?: string;
  chatWindowTheme?: string;
  borderRadius?: number;
  shadowStyle?: string;
}

export interface Lead {
  id: string;
  chatbotId: string;
  name: string;
  email?: string;
  phone?: string;
  source: string;
  metadata?: any;
  createdAt: Date;
  consentGiven?: boolean;
  conversationContext?: any;
}

export interface ChatSession {
  id: string;
  chatbotId: string;
  userId: number;
  sessionData?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  chatbotId: string;
  content: string;
  sender: string;
  metadata?: any;
  createdAt: Date;
}

export interface UsageStats {
  id: string;
  userId: number;
  chatbotId: string;
  date: Date;
  totalConversations: number;
  totalMessages: number;
  totalLeads: number;
  avgResponseTime: number;
  createdAt: Date;
  updatedAt: Date;
}

// Insert types for forms
export interface InsertUser {
  username: string;
  password: string;
  email: string;
  agencyName: string;
  agencyLogo?: string;
  onboardingCompleted?: boolean;
  businessType?: string;
  primaryGoals?: string[];
  experienceLevel?: string;
  onboardingStep?: number;
  personalizedRecommendations?: any;
}

export interface InsertChatbot {
  userId: number;
  name: string;
  description?: string;
  aiSystemPrompt: string;
  aiProvider?: string;
  customApiKey?: string;
  chatWindowAvatar?: string;
  chatBubbleIcon?: string;
  welcomeMessage?: string;
  initialMessageDelay?: number;
  enableNotificationSound?: boolean;
  customNotificationSound?: string;
  leadsWebhookUrl?: string;
  businessType?: string;
  poweredByText?: string;
  poweredByLink?: string;
  bubblePosition?: string;
  horizontalOffset?: number;
  verticalOffset?: number;
  leadCollectionEnabled?: boolean;
  leadCollectionAfterMessages?: number;
  leadCollectionMessage?: string;
  dailyChatLimit?: number;
  monthlyChatLimit?: number;
  trainingData?: string;
  questionFlow?: any;
  questionFlowEnabled?: boolean;
  isActive?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  showWelcomePopup?: boolean;
  suggestionButtons?: string;
  suggestionTiming?: string;
  suggestionPersistence?: string;
  suggestionTimeout?: number;
  inputPlaceholder?: string;
  leadButtonText?: string;
  chatWidgetIcon?: string;
  chatWidgetName?: string;
  chatWindowStyle?: string;
  chatWindowTheme?: string;
  borderRadius?: number;
  shadowStyle?: string;
  allowedDomains?: string[];
}

export interface InsertLead {
  chatbotId: string;
  name: string;
  email?: string;
  phone?: string;
  source: string;
  metadata?: any;
  consentGiven?: boolean;
  conversationContext?: any;
  userId?: string;
}

export interface InsertChatbotExtended extends InsertChatbot {
  allowedDomains?: string[];
}