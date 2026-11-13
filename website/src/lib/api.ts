import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Admin and general API helper modules
export const adminApi = {
  getStats: () => api.get("/admin/dashboard/stats"),
  
  // Teams
  getPendingTeams: () => api.get("/teams/pending"),
  getAllTeams: () => api.get("/teams/all"),
  getEligibleTeams: (eventId: string) => api.get(`/teams/eligible/${eventId}`),
  approveTeam: (teamId: string) => api.put(`/teams/${teamId}/approve`),
  rejectTeam: (teamId: string, reason?: string) =>
    api.delete(`/teams/${teamId}/reject`, { data: { reason } }),
  
  // NEW FEATURE: Direct Team Creation with 0 players for matchmaking
  createDirectTeam: (data: { name: string; eventId: string; captainPhone?: string }) =>
    api.post("/teams/direct", data),

  // Events
  createEvent: (data: any) => api.post("/events", data),
  updateEvent: (id: string, data: any) => api.patch(`/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/events/${id}`),

  // Matches
  createMatch: (data: {
    event: string;
    teamA: string;
    teamB: string;
    round: string;
    venue?: string;
    startTime?: string;
  }) => api.post("/match", data),
  startMatch: (id: string) => api.patch(`/match/${id}/start`),
  updateScore: (id: string, scores: { scoreA: string; scoreB: string }) =>
    api.patch(`/match/${id}/score`, scores),
  endMatch: (id: string, winnerId: string) =>
    api.patch(`/match/${id}/end`, { winnerId }),
  deleteMatch: (id: string) => api.delete(`/match/${id}`),
};
