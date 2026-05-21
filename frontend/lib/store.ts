import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  name: string;
  email: string;
  tier: string;
  wellnessIndex: number;
  username?: string;
  role?: string;
  avatar?: string;
  phone?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  emotion?: string;
  riskLevel?: string;
  feedbackId?: string;
  feedbackType?: 'like' | 'dislike' | null;
}

export interface MoodEntry {
  score: number;
  tags: string[];
  note: string;
  timestamp: number;
}

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;

  // Chat
  messages: ChatMessage[];
  chatMode: 'SUPPORT' | 'CBT' | 'COACHING' | 'CRISIS';
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
  setChatMode: (mode: AppState['chatMode']) => void;
  updateMessageFeedback: (id: string, feedbackId: string, feedbackType: 'like' | 'dislike' | null) => void;

  // Mood
  lastMood: MoodEntry | null;
  moodHistory: MoodEntry[];
  setLastMood: (entry: MoodEntry) => void;

  // Crisis
  crisisActive: boolean;
  setCrisisActive: (active: boolean) => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => {
        if (typeof window !== 'undefined') {
          document.cookie = 'mindful_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        }
        set({ user: null, token: null, messages: [], lastMood: null });
      },

      messages: [],
      chatMode: 'SUPPORT',
      addMessage: (msg) => set((s) => ({ messages: [...s.messages.slice(-49), msg] })),
      clearMessages: () => set({ messages: [] }),
      setChatMode: (mode) => set({ chatMode: mode }),
      updateMessageFeedback: (id, feedbackId, feedbackType) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, feedbackId, feedbackType } : m
          ),
        })),

      lastMood: null,
      moodHistory: [],
      setLastMood: (entry) =>
        set((s) => ({ lastMood: entry, moodHistory: [entry, ...s.moodHistory].slice(0, 30) })),

      crisisActive: false,
      setCrisisActive: (active) => set({ crisisActive: active }),

      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    { name: 'mindfulai-store', partialize: (s) => ({ user: s.user, token: s.token, moodHistory: s.moodHistory }) }
  )
);
