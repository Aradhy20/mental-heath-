import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return 'http://localhost:8000';
};

const BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// Token interceptor — attach bearer token from localStorage if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('mindfulai-store');
      if (stored) {
        const { state } = JSON.parse(stored);
        if (state?.token) {
          config.headers['Authorization'] = `Bearer ${state.token}`;
        }
      }
    } catch {}
  }
  return config;
});

// Response error interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mindfulai-store');
        document.cookie = 'mindful_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        window.location.href = '/auth';
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Determine if a string is an email or phone, then send the correct field.
 * Backend OTPRequest model expects: { email?: str, phone?: str }
 */
function buildOtpPayload(contact: string): { email?: string; phone?: string } {
  const isPhone = /^\+?\d[\d\s\-().]{6,}$/.test(contact.trim());
  return isPhone ? { phone: contact.trim() } : { email: contact.trim() };
}

/**
 * Request OTP — sends { email } or { phone } depending on input.
 */
export const requestOTP = (contact: string) =>
  api.post('/api/v1/auth/request-otp', buildOtpPayload(contact));

/**
 * Verify OTP — sends { email/phone, otp } correctly.
 * Maps response so `user.name` works on the frontend (backend returns `username`).
 */
export const verifyOTP = async (contact: string, otp: string) => {
  const payload = { ...buildOtpPayload(contact), otp };
  const res = await api.post('/api/v1/auth/verify-otp', payload);
  // Normalize response: backend returns `username`, frontend expects `name`
  if (res.data?.user) {
    res.data.user.name = res.data.user.name ?? res.data.user.username ?? res.data.user.full_name ?? 'User';
    res.data.user.id   = res.data.user.id   ?? res.data.user.user_id;
  }
  return res;
};

/**
 * Full signup with email + password + username.
 * POST /api/v1/auth/signup
 */
export const signupUser = async (data: {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  phone?: string;
}) => {
  const res = await api.post('/api/v1/auth/signup', data);
  if (res.data?.user) {
    res.data.user.name = res.data.user.name ?? res.data.user.username ?? res.data.user.full_name ?? 'User';
    res.data.user.id   = res.data.user.id   ?? res.data.user.user_id;
  }
  return res;
};

/**
 * Traditional email+password login.
 * POST /api/v1/auth/login
 */
export const loginUser = async (data: { email: string; password: string }) => {
  const res = await api.post('/api/v1/auth/login', data);
  if (res.data?.user) {
    res.data.user.name = res.data.user.name ?? res.data.user.username ?? 'User';
    res.data.user.id   = res.data.user.id   ?? res.data.user.user_id;
  }
  return res;
};

/**
 * Fetch current user profile.
 * GET /api/v1/auth/me
 */
export const getMe = () => api.get('/api/v1/auth/me');

// ── Wellness ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/dashboard/stats  (correct backend endpoint in analysis.py)
 */
export const getWellnessStats = async () => {
  try {
    const res = await api.get('/api/v1/dashboard/stats');
    return {
      ...res,
      data: {
        wellness_index: res.data.wellness_score ?? res.data.wellness_index ?? 72,
        average_mood:   res.data.average_mood   ?? (res.data.wellness_score ? res.data.wellness_score / 20 : 3.8),
        streak:         res.data.streak         ?? res.data.active_sessions ?? 5,
        alert_count:    res.data.alert_count    ?? ((res.data.stress_index && res.data.stress_index > 0.7) ? 1 : 0),
        ...res.data,
      },
    };
  } catch {
    // Graceful fallback when backend not reachable
    return {
      data: { wellness_index: 72, average_mood: 3.8, streak: 5, alert_count: 0 },
    };
  }
};

/**
 * POST /api/v1/mood  (correct backend endpoint for mood logging in wellness.py)
 */
export const submitMood = (data: { score: number; tags?: string[]; note?: string; user_id?: string }) =>
  api.post('/api/v1/mood', {
    score:        data.score,
    feelings:     data.tags ?? [],
    note:         data.note ?? '',
    user_id:      data.user_id ?? 'guest',
    sleep_hours:  8.0,
    energy_level: 5,
  });

// ── Chat ─────────────────────────────────────────────────────────────────────
export const sendChatMessage = (message: string, mode: string) =>
  api.post('/api/v1/chat', { message, mode });

// ── Insights ─────────────────────────────────────────────────────────────────
export const getInsights = () => api.get('/api/v1/insights');

export interface InsightData {
  weekly_summary: {
    avg_mood: number;
    trend: string;
    dominant_emotion: string;
    total_sessions?: number;
  };
  emotion_breakdown: Array<{
    emotion: string;
    count: number;
    percentage: number;
  }>;
  risk_assessment: {
    level: string;
    confidence: number;
  };
  recommendations: string[];
  mood_history: Array<{
    date: string;
    score: number;
    emotion: string;
  }>;
}

export const insightsAPI = {
  get: async (): Promise<InsightData> => {
    const res = await api.get('/api/v1/insights');
    return res.data;
  },
};

// ── Journal ──────────────────────────────────────────────────────────────────
export interface JournalRecord {
  id: string;
  content: string;
  mood_tag?: string;
  is_private?: boolean;
  created_at: string;
  emotion_analysis?: {
    emotion: string;
    score: number;
  };
}

export const journalAPI = {
  list: async (): Promise<JournalRecord[]> => {
    const res = await api.get('/api/v1/journal');
    return res.data;
  },
  create: async (data: { content: string; mood_tag?: string; is_private?: boolean }): Promise<{ id: string; status: string }> => {
    const res = await api.post('/api/v1/journal', data);
    return res.data;
  },
};

// ── Trends ───────────────────────────────────────────────────────────────────
export const getTrends = (days = 30) => api.get(`/api/v1/trends?days=${days}`);

// ── Assessments ──────────────────────────────────────────────────────────────
export const submitAssessment = (type: 'PHQ9' | 'GAD7', answers: number[]) =>
  api.post('/api/v1/clinical-assessments/submit', { type, answers });

// ── Check-in ─────────────────────────────────────────────────────────────────
export const getCheckin = () => api.get('/api/v1/checkin');

// ── SSE Chat Stream ───────────────────────────────────────────────────────────
export const createChatEventSource = (message: string, mode: string, token: string | null) => {
  const params = new URLSearchParams({ message, mode });
  if (token) params.set('token', token);
  return new EventSource(`${BASE_URL}/api/v1/chat/stream?${params.toString()}`);
};

// ── Games ─────────────────────────────────────────────────────────────────────
export const submitGameScore = (data: { game_name: string; score: number; mood_impact: number }) =>
  api.post('/api/v1/games/score', data);

// ── Analytics ────────────────────────────────────────────────────────────────
export const getAnalytics = () => api.get('/api/v1/analytics');

// ── Profile Updates & Users ──────────────────────────────────────────────────
export const updateProfile = (data: { username?: string; email?: string; full_name?: string; phone?: string }) =>
  api.put('/api/v1/auth/me', data);

export const getUsers = () => api.get('/api/v1/auth/users');
