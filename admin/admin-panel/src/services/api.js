import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://css-app-mfog.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Public API endpoints (no auth required)
export const publicAPI = {
  getEvents: () => api.get('/events'),
  getEventById: (id) => api.get(`/events/${id}`),
};

// Events API (admin only)
export const eventAPI = {
  // Admin routes
  createEvent: (data) => api.post('/admin/events', data),
  updateEvent: (id, data) => api.patch(`/admin/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),
  
  // Public routes
  getEvents: () => api.get('/events'),
  getEventById: (id) => api.get(`/events/${id}`),
  
  // Admin specific
  getEligibleTeams: (eventId) => api.get(`/admin/teams/eligible/${eventId}`),
};

// Teams API
// export const teamAPI = {
//   // Admin routes
//   getPendingTeams: () => api.get('/admin/teams/pending'),
//   approveTeam: (id) => api.patch(`/admin/teams/${id}/approve`),
  
//   // User routes (protected)
//   createTeam: (data) => api.post('/teams', data),
//   getMyTeams: () => api.get('/teams/my'),
//   getTeamsByEvent: (eventId) => api.get(`/teams/event/${eventId}`),
// };

// Teams API
export const teamAPI = {
  // Admin routes
  getPendingTeams: () => api.get('/admin/teams/pending'),
  approveTeam: (id) => api.patch(`/admin/teams/${id}/approve`),
  
  // Add this if you create a reject endpoint
  rejectTeam: (id, data) => api.delete(`/admin/teams/${id}`, { data }),
  
  // User routes (protected)
  createTeam: (data) => api.post('/teams', data),
  getMyTeams: () => api.get('/teams/my'),
  getTeamsByEvent: (eventId) => api.get(`/teams/event/${eventId}`),
  getAllTeams: () => api.get('/teams/all'), // You might need to create this
};
// Matches API
// src/services/api.js
export const matchAPI = {
  createMatch: (data) => api.post('/admin/matches', data),
  startMatch: (id) => api.patch(`/admin/matches/${id}/start`),
  updateScore: (id, data) => api.patch(`/admin/matches/${id}/score`, data),
  endMatch: (id, data) => api.patch(`/admin/matches/${id}/end`, data),
  
  getMatchesByEvent: (eventId) => api.get(`/match/event/${eventId}`),
  getMatchById: (id) => api.get(`/match/${id}`),
  deleteMatch: (id) => api.delete(`/admin/matches/${id}`),
};

// Investments API (protected)
export const investmentAPI = {
  createInvestment: (data) => api.post('/investment', data),
  getInvestmentsByMatch: (matchId) => api.get(`/investment/match/${matchId}`),
  getMatchStats: (matchId) => api.get(`/investment/matches/${matchId}/stats`),
};

// Transactions API
export const transactionAPI = {
  getMyTransactions: () => api.get('/transaction/my'),
  adminAdjustPoints: (data) => api.post('/transaction/admin-adjust', data),
};

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
};

// Dashboard API (custom)
export const dashboardAPI = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getRecentActivities: () => api.get('/admin/dashboard/activities'),
};

export default api;