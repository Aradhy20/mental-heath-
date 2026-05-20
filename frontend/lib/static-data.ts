export const INSIGHTS_DATA = {
  weekly_summary: { avg_mood: 3.8, trend: 'improving', dominant_emotion: 'Calm' },
  emotion_breakdown: [
    { emotion: 'Calm', count: 12, percentage: 45 },
    { emotion: 'Happy', count: 8, percentage: 30 },
    { emotion: 'Anxious', count: 4, percentage: 15 },
    { emotion: 'Sad', count: 2, percentage: 10 },
  ],
  risk_assessment: { level: 'low', confidence: 0.92 },
  recommendations: [
    'Practice 5-minute box breathing each morning',
    'Schedule a 20-minute walk at noon',
    'Limit screen time 1 hour before bed',
  ],
  mood_history: [
    { date: new Date(Date.now() - 6 * 86400000).toISOString(), score: 3.2, emotion: 'neutral' },
    { date: new Date(Date.now() - 5 * 86400000).toISOString(), score: 3.8, emotion: 'calm' },
    { date: new Date(Date.now() - 4 * 86400000).toISOString(), score: 2.9, emotion: 'anxious' },
    { date: new Date(Date.now() - 3 * 86400000).toISOString(), score: 4.1, emotion: 'happy' },
    { date: new Date(Date.now() - 2 * 86400000).toISOString(), score: 3.6, emotion: 'calm' },
    { date: new Date(Date.now() - 1 * 86400000).toISOString(), score: 4.3, emotion: 'happy' },
    { date: new Date().toISOString(), score: 3.9, emotion: 'calm' },
  ],
};

export const DASHBOARD_STATS = {
  wellness_score: 78,
  active_sessions: 5,
  streak_days: 7,
  total_checkins: 42,
};

export const JOURNAL_ENTRIES = [
  { id: '1', content: 'Today was a productive day. Feeling centered.', mood_tag: 'calm', created_at: new Date().toISOString() },
  { id: '2', content: 'Had a stressful morning but recovered well.', mood_tag: 'anxious', created_at: new Date(Date.now() - 86400000).toISOString() },
];

export const DEMO_USER = { email: 'demo@mindful.ai', username: 'demo_user', id: '1', name: 'Demo User' };
export const DEMO_TOKEN = 'demo_token_123';
export const DEMO_AUTH_RESPONSE = {
  access_token: DEMO_TOKEN,
  token: DEMO_TOKEN,
  token_type: 'bearer',
  user_id: '1',
  user: { username: 'demo_user', email: 'demo@mindful.ai', full_name: 'Demo User' },
};

export const MOOD_LOG_RESULT = { id: 'demo-mood-1', score: 4, created_at: new Date().toISOString() };
export const WELLNESS_ACTIONS = [
  { id: '1', title: 'Morning Meditation', type: 'mindfulness', duration_minutes: 10 },
  { id: '2', title: 'Gratitude Journal', type: 'journaling', duration_minutes: 5 },
  { id: '3', title: 'Box Breathing', type: 'breathing', duration_minutes: 5 },
];
export const ASSESSMENT_RESULT = { score: 8, level: 'minimal', recommendation: 'Continue current wellness practices.' };
export const GAME_RECOMMENDATIONS = [
  { id: '1', name: 'Zen Garden', description: 'Arrange stones to calm the mind', benefit: 'Reduces anxiety' },
  { id: '2', name: 'Breath Trainer', description: 'Guided breathing patterns', benefit: 'Improves focus' },
];
export const GAME_SCORE_RESULT = { id: 'score-1', saved: true };
