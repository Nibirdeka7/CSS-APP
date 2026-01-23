import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAdminStore = create(
  persist(
    (set, get) => ({
      // Dashboard stats
      dashboardStats: {
        totalEvents: 0,
        activeMatches: 0,
        pendingTeams: 0,
        totalRevenue: 0,
      },

      // Events management
      events: [],
      selectedEvent: null,

      // Teams management
      pendingTeams: [],
      approvedTeams: [],

      // Matches management
      matches: [],
      liveMatches: [],

      // Actions
      setDashboardStats: (stats) => set({ dashboardStats: stats }),
      setEvents: (events) => set({ events }),
      setSelectedEvent: (event) => set({ selectedEvent: event }),
      setPendingTeams: (teams) => set({ pendingTeams: teams }),
      setApprovedTeams: (teams) => set({ approvedTeams: teams }),
      setMatches: (matches) => set({ matches }),
      setLiveMatches: (matches) => set({ liveMatches: matches }),

      // Event actions
      createEvent: async (eventData) => {
        // API call will be implemented here
        const newEvent = { id: Date.now(), ...eventData };
        set((state) => ({ events: [...state.events, newEvent] }));
        return newEvent;
      },

      updateEvent: async (id, eventData) => {
        // API call will be implemented here
        set((state) => ({
          events: state.events.map(event => 
            event.id === id ? { ...event, ...eventData } : event
          )
        }));
      },

      // Team actions
      approveTeam: async (teamId) => {
        // API call will be implemented here
        set((state) => ({
          pendingTeams: state.pendingTeams.filter(team => team.id !== teamId),
          approvedTeams: [...state.approvedTeams, 
            state.pendingTeams.find(team => team.id === teamId)]
        }));
      },

      rejectTeam: async (teamId) => {
        // API call will be implemented here
        set((state) => ({
          pendingTeams: state.pendingTeams.filter(team => team.id !== teamId)
        }));
      },

      // Match actions
      createMatch: async (matchData) => {
        // API call will be implemented here
        const newMatch = { id: Date.now(), ...matchData };
        set((state) => ({ matches: [...state.matches, newMatch] }));
        return newMatch;
      },

      startMatch: async (matchId) => {
        // API call will be implemented here
        set((state) => ({
          matches: state.matches.map(match =>
            match.id === matchId 
              ? { ...match, status: 'live', startTime: new Date().toISOString() }
              : match
          )
        }));
      },

      updateMatchScore: async (matchId, scores) => {
        // API call will be implemented here
        set((state) => ({
          matches: state.matches.map(match =>
            match.id === matchId
              ? { ...match, ...scores }
              : match
          )
        }));
      },

      endMatch: async (matchId, winnerId) => {
        // API call will be implemented here
        set((state) => ({
          matches: state.matches.map(match =>
            match.id === matchId
              ? { 
                  ...match, 
                  status: 'completed', 
                  endTime: new Date().toISOString(),
                  winner: winnerId 
                }
              : match
          )
        }));
      },

      // Data fetching (to be connected to API)
      fetchDashboardData: async () => {
        try {
          // These will be replaced with actual API calls
          const events = await Promise.resolve([]);
          const pendingTeams = await Promise.resolve([]);
          const matches = await Promise.resolve([]);

          set({
            events,
            pendingTeams,
            matches,
            liveMatches: matches.filter(m => m.status === 'live')
          });
        } catch (error) {
          console.error('Failed to fetch dashboard data:', error);
        }
      },

      fetchEligibleTeams: async (eventId) => {
        try {
          // API call to fetch eligible teams
          const eligibleTeams = await Promise.resolve([]);
          return eligibleTeams;
        } catch (error) {
          console.error('Failed to fetch eligible teams:', error);
          return [];
        }
      },
    }),
    {
      name: 'admin-storage',
    }
  )
);

export const useAdmin = () => {
  const store = useAdminStore();
  return store;
};