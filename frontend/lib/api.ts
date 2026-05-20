import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
        window.location.href = '/auth';
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const requestOTP = (contact: string) =>
  api.post('/api/v1/auth/request-otp', { contact });

export const verifyOTP = (contact: string, otp: string) =>
  api.post('/api/v1/auth/verify-otp', { contact, otp });

// ── Wellness ─────────────────────────────────────────────────────────────────
export const getWellnessStats = () => api.get('/api/v1/wellness/stats');
export const submitMood = (data: { score: number; tags: string[]; note: string }) =>
  api.post('/api/v1/wellness/mood', data);

// ── Chat ─────────────────────────────────────────────────────────────────────
export const sendChatMessage = (message: string, mode: string) =>
  api.post('/api/v1/chat', { message, mode });

// ── Insights ─────────────────────────────────────────────────────────────────
export const getInsights = () => api.get('/api/v1/insights');

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
