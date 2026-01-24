import { create } from 'zustand';
import { eventAPI, teamAPI, matchAPI, investmentAPI } from '../services/api';
import { toast } from 'sonner';
import { useAuthStore } from './authStore';

export const useAdminStore = create((set, get) => ({
  // State
  events: [],
  pendingTeams: [],
  matches: [],
  liveMatches: [],
  eligibleTeams: {},
  isLoading: false,
  selectedEvent: null,
  selectedTeam: null,
  selectedMatch: null,
  matchStats: {},
  
  // Events Actions
  fetchEvents: async () => {
    set({ isLoading: true });
    try {
      const response = await eventAPI.getEvents();
      set({ events: response.data, isLoading: false });
    } catch (error) {
      toast.error('Failed to fetch events');
      set({ isLoading: false });
      throw error;
    }
  },

  createEvent: async (eventData) => {
    set({ isLoading: true });
    try {
      const response = await eventAPI.createEvent(eventData);
      set((state) => ({
        events: [...state.events, response.data],
        isLoading: false
      }));
      toast.success('Event created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
      set({ isLoading: false });
      throw error;
    }
  },

  updateEvent: async (id, eventData) => {
    set({ isLoading: true });
    try {
      const response = await eventAPI.updateEvent(id, eventData);
      set((state) => ({
        events: state.events.map(event => 
          event._id === id ? response.data : event
        ),
        isLoading: false
      }));
      toast.success('Event updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update event');
      set({ isLoading: false });
      throw error;
    }
  },

  deleteEvent: async (id) => {
    set({ isLoading: true });
    try {
      await eventAPI.deleteEvent(id);
      set((state) => ({
        events: state.events.filter(event => event._id !== id),
        isLoading: false
      }));
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error('Failed to delete event');
      set({ isLoading: false });
      throw error;
    }
  },
  // Team
  // Add these methods to your admin store

// Fetch teams by event
fetchTeamsByEvent: async (eventId) => {
  set({ isLoading: true });
  try {
    const response = await teamAPI.getTeamsByEvent(eventId);
    set((state) => ({
      teamsByEvent: {
        ...state.teamsByEvent,
        [eventId]: response.data
      },
      isLoading: false
    }));
    return response.data;
  } catch (error) {
    toast.error('Failed to fetch teams for event');
    set({ isLoading: false });
    throw error;
  }
},

// Get teams by event from cache
getTeamsByEvent: (eventId) => {
  return get().teamsByEvent[eventId] || [];
},

// Get approved teams by event
getApprovedTeamsByEvent: (eventId) => {
  const teams = get().teamsByEvent[eventId] || [];
  return teams.filter(team => team.approved === true);
},

// Get pending teams by event
getPendingTeamsByEvent: (eventId) => {
  const teams = get().teamsByEvent[eventId] || [];
  return teams.filter(team => team.approved === false);
},

// Also update the fetchPendingTeams to use the correct endpoint
fetchPendingTeams: async () => {
  set({ isLoading: true });
  try {
    const response = await teamAPI.getPendingTeams();
    set({ 
      pendingTeams: response.data, 
      isLoading: false 
    });
    
    // Also update teamsByEvent cache for each event
    const teamsByEvent = {};
    response.data.forEach(team => {
      if (team.event) {
        const eventId = team.event._id || team.event;
        if (!teamsByEvent[eventId]) {
          teamsByEvent[eventId] = [];
        }
        teamsByEvent[eventId].push(team);
      }
    });
    
    set((state) => ({
      teamsByEvent: { ...state.teamsByEvent, ...teamsByEvent }
    }));
    
  } catch (error) {
    toast.error('Failed to fetch pending teams');
    set({ isLoading: false });
    throw error;
  }
},

  // Teams Actions
  fetchPendingTeams: async () => {
    set({ isLoading: true });
    try {
      const response = await teamAPI.getPendingTeams();
      set({ pendingTeams: response.data, isLoading: false });
    } catch (error) {
      toast.error('Failed to fetch pending teams');
      set({ isLoading: false });
      throw error;
    }
  },

  approveTeam: async (teamId) => {
    set({ isLoading: true });
    try {
      const response = await teamAPI.approveTeam(teamId);
      set((state) => ({
        pendingTeams: state.pendingTeams.filter(team => team._id !== teamId),
        isLoading: false
      }));
      toast.success('Team approved successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve team');
      set({ isLoading: false });
      throw error;
    }
  },

  // Matches Actions
  // src/stores/adminStore.js
fetchMatches: async (eventId = 'all') => {
  set({ isLoading: true });
  try {
    // ONE call is enough. If eventId is 'all', backend returns everything.
    // If eventId is a specific ID, backend returns only that event's matches.
    const { data } = await matchAPI.getMatchesByEvent(eventId);
    
    // We replace the entire array with the clean data from the server
    set({ 
      matches: data, 
      isLoading: false 
    });
  } catch (error) {
    console.error('Fetch Error:', error);
    set({ isLoading: false, matches: [] });
    toast.error("Failed to sync matches");
  }
},


  createMatch: async (matchData) => {
    set({ isLoading: true });
    try {
      const { data } = await matchAPI.createMatch(matchData);
      // Immediately add the new match to local state
      set((state) => ({ 
        matches: [data, ...state.matches],
        isLoading: false 
      }));
      toast.success('Match scheduled!');
    } catch (error) {
      toast.error('Scheduling failed');
      set({ isLoading: false });
    }
  },

// Update startMatch method to use correct status
startMatch: async (matchId) => {
  set({ isLoading: true });
  try {
    const response = await matchAPI.startMatch(matchId);
    set((state) => ({
      matches: state.matches.map(match =>
        match._id === matchId ? response.data : match
      ),
      liveMatches: [...state.liveMatches, response.data],
      isLoading: false
    }));
    toast.success('Match started successfully');
    return response.data;
  } catch (error) {
    toast.error('Failed to start match');
    set({ isLoading: false });
    throw error;
  }
},

// Update fetchMatches to handle correct status mapping
fetchMatches: async () => {
  set({ isLoading: true });
  try {
    // You need to implement getAllMatches endpoint or use getMatchesByEvent
    const response = await matchAPI.getAll(); // This needs to be implemented
    
    const matches = response.data;
    set({ 
      matches,
      liveMatches: matches.filter(match => match.status === 'LIVE'),
      isLoading: false 
    });
  } catch (error) {
    toast.error('Failed to fetch matches');
    set({ isLoading: false });
    throw error;
  }
},
// src/stores/adminStore.js
cancelMatch: async (matchId) => {
  set({ isLoading: true });
  try {
    await matchAPI.deleteMatch(matchId);
    
    // Filter out the deleted match from the global matches array
    set((state) => ({
      matches: state.matches.filter((m) => m._id !== matchId),
      isLoading: false,
    }));
    
    toast.success('Match cancelled and removed');
  } catch (error) {
    console.error('Cancel Match Error:', error);
    set({ isLoading: false });
    toast.error('Failed to cancel match');
    throw error;
  }
},

// Add this method to fetch matches by event
fetchMatchesByEvent: async (eventId) => {
  set({ isLoading: true });
  try {
    const response = await matchAPI.getMatchesByEvent(eventId);
    
    // Store matches by event
    set((state) => ({
      matchesByEvent: {
        ...state.matchesByEvent,
        [eventId]: response.data
      },
      isLoading: false
    }));
    
    return response.data;
  } catch (error) {
    toast.error('Failed to fetch matches for event');
    set({ isLoading: false });
    throw error;
  }
},

// Update fetchMatches to work with multiple events or implement getAllMatches
fetchMatches: async () => {
  set({ isLoading: true });
  try {
    // Since we don't have getAllMatches endpoint, we'll fetch matches for each event
    const { events } = get();
    const allMatches = [];
    
    // Fetch matches for each event
    for (const event of events) {
      try {
        const matches = await matchAPI.getMatchesByEvent(event._id);
        console.log(matches)
        allMatches.push(...matches.data);
      } catch (error) {
        console.error(`Failed to fetch matches for event ${event._id}:`, error);
      }
    }
    
    set({ 
      matches: allMatches,
      liveMatches: allMatches.filter(match => match.status === 'LIVE'),
      isLoading: false 
    });
    
  } catch (error) {
    toast.error('Failed to fetch matches');
    set({ isLoading: false });
    throw error;
  }
},
fetchMatchStats: async (matchId) => {
    try {
      const { data } = await investmentAPI.getMatchStats(matchId);
      set((state) => ({
        matchStats: {
          ...state.matchStats,
          [matchId]: data // data is the array of { _id, totalPoints, investorCount }
        }
      }));
    } catch (error) {
      console.error("Error fetching match stats:", error);
    }
  },

// Get matches for a specific event
getMatchesByEvent: (eventId) => {
  return get().matchesByEvent[eventId] || [];
},

  startMatch: async (matchId) => {
    set({ isLoading: true });
    try {
      const response = await matchAPI.startMatch(matchId);
      set((state) => ({
        matches: state.matches.map(match =>
          match._id === matchId ? response.data : match
        ),
        liveMatches: [...state.liveMatches, response.data],
        isLoading: false
      }));
      toast.success('Match started successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to start match');
      set({ isLoading: false });
      throw error;
    }
  },

  updateMatchScore: async (matchId, scores) => {
    set({ isLoading: true });
    try {
      const response = await matchAPI.updateScore(matchId, scores);
      set((state) => ({
        matches: state.matches.map(match =>
          match._id === matchId ? response.data : match
        ),
        isLoading: false
      }));
      toast.success('Score updated successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to update score');
      set({ isLoading: false });
      throw error;
    }
  },

  endMatch: async (matchId, winnerId) => {
    set({ isLoading: true });
    try {
      const response = await matchAPI.endMatch(matchId, { winnerId });
      set((state) => ({
        matches: state.matches.map(match =>
          match._id === matchId ? response.data.match : match
        ),
        liveMatches: state.liveMatches.filter(match => match._id !== matchId),
        isLoading: false
      }));
      toast.success('Match ended successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to end match');
      set({ isLoading: false });
      throw error;
    }
  },

  // Fetch eligible teams for an event
  fetchEligibleTeams: async (eventId) => {
    set({ isLoading: true });
    try {
      const response = await eventAPI.getEligibleTeams(eventId);
      set((state) => ({
        eligibleTeams: {
          ...state.eligibleTeams,
          [eventId]: response.data
        },
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch eligible teams');
      set({ isLoading: false });
      throw error;
    }
  },

  // Get eligible teams from cache
  getEligibleTeams: (eventId) => {
    return get().eligibleTeams[eventId] || [];
  },

  // Dashboard Stats (mock for now - you can create a backend endpoint)
  getDashboardStats: () => {
    const events = get().events;
    const pendingTeams = get().pendingTeams;
    const liveMatches = get().liveMatches;
    
    return {
      totalEvents: events.length,
      activeEvents: events.filter(e => e.isActive).length,
      pendingTeams: pendingTeams.length,
      liveMatches: liveMatches.length,
    };
  },

  // Selectors
  getEventById: (id) => {
    return get().events.find(event => event._id === id);
  },

  getMatchById: (id) => {
    return get().matches.find(match => match._id === id);
  },

  // Set selected items
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setSelectedTeam: (team) => set({ selectedTeam: team }),
  setSelectedMatch: (match) => set({ selectedMatch: match }),
}));