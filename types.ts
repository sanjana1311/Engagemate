export interface User {
  id: string;
  name: string;
  avatar: string;
  handle: string;
}

export interface UserProfile {
  name: string;
  title: string;
  avatar: string;
  bio: string; // Context for the AI to understand who it is pretending to be
  writingStyle: string; // e.g. "Casual, lowercase, uses emojis" vs "Professional, formal"
}

export interface Asset {
  id: string;
  name: string;
  type: 'PDF' | 'LINK' | 'IMAGE';
  url: string;
  downloads: number;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  text: string;
  timestamp: string;
  reply?: string; // The AI generated reply
  dmSent?: boolean; // Whether the DM was triggered
  dmContent?: string;
  status: 'pending' | 'processing' | 'completed';
}

export interface Post {
  id: string;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  keyword: string;
  assetId: string;
  isActive: boolean;
  customPrompt?: string; // Optional custom instruction for the AI reply
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  AUTOMATIONS = 'AUTOMATIONS',
  ASSETS = 'ASSETS',
  SETTINGS = 'SETTINGS'
}