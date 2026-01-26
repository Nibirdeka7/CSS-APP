import axios from "axios";

const api = axios.create({
  // baseURL: 'https://css-app-mfog.vercel.app/api',
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Public API endpoints
export const publicAPI = {
  getEvents: () => api.get("/events"),
  getEventById: (id) => api.get(`/events/${id}`),
};

// Events API
export const eventAPI = {
  createEvent: (data) => api.post("/events", data),
  updateEvent: (id, data) => api.patch(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  getEvents: () => api.get("/events"),
  getEventById: (id) => api.get(`/events/${id}`),
};

// Teams API
export const teamAPI = {
  getPendingTeams: () => api.get("/teams/pending"),
  approveTeam: (id) => api.put(`/teams/${id}/approve`),
  rejectTeam: (id, data) => api.delete(`/teams/${id}/reject`, { data }),

  // ✅ FIXED: Moved here and Updated URL to match Backend
  // Old: /admin/teams/eligible/...
  // New: /teams/eligible/...
  getEligibleTeams: (eventId) => api.get(`/teams/eligible/${eventId}`),

  createTeam: (data) => api.post("/teams", data),
  getMyTeams: () => api.get("/teams/my"),
  getTeamsByEvent: (eventId) => api.get(`/teams/event/${eventId}`),
  getAllTeams: () => api.get("/teams/all"),
};

// Matches API
export const matchAPI = {
  createMatch: (data) => api.post("/match", data),
  updateMatchResult: (id, data) => api.put(`/match/${id}/result`, data),
  startMatch: (id) => api.patch(`/match/${id}/start`),
  updateScore: (id, data) => api.patch(`/match/${id}/score`, data),
  endMatch: (id, data) => api.patch(`/match/${id}/end`, data),
  getMatchesByEvent: (eventId) => api.get(`/match/event/${eventId}`),
  getMatchById: (id) => api.get(`/match/${id}`),
  deleteMatch: (id) => api.delete(`/match/${id}`),
};

// Investments API
export const investmentAPI = {
  createInvestment: (data) => api.post("/investment", data),
  getInvestmentsByMatch: (matchId) => api.get(`/investment/match/${matchId}`),
  getMatchStats: (matchId) => api.get(`/investment/match/${matchId}/stats`),
};

// Transactions API
export const transactionAPI = {
  getMyTransactions: () => api.get("/transaction/my"),
  adminAdjustPoints: (data) => api.post("/transaction/admin-adjust", data),
};

// Auth API
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get("/admin/dashboard/stats"),
  getRecentActivities: () => api.get("/admin/dashboard/activities"),
};

export default api;
