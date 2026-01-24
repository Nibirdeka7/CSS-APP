import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import { toast } from 'sonner';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Actions
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login({ email, password });
          const { token, user } = response.data;
          
          // Store token and user
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          toast.success('Login successful!');
          return user;
        } catch (error) {
          toast.error(error.response?.data?.message || 'Login failed');
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear local storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          
          toast.success('Logged out successfully');
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(userData);
          const { token, user } = response.data;
          
          // Store token and user
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          toast.success('Registration successful!');
          return user;
        } catch (error) {
          toast.error(error.response?.data?.message || 'Registration failed');
          set({ isLoading: false });
          throw error;
        }
      },
      
      getProfile: async () => {
        set({ isLoading: true });
        try {
          const response = await authAPI.getProfile();
          const user = response.data;
          
          // Update local storage
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            isLoading: false,
          });
          
          return user;
        } catch (error) {
          // If token is invalid, logout
          if (error.response?.status === 401) {
            get().logout();
          }
          set({ isLoading: false });
          throw error;
        }
      },
      
      // Initialize from localStorage
      initialize: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({
              user,
              token,
              isAuthenticated: true,
            });
          } catch (error) {
            // Clear invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      },
      
      // Check if user is admin
      isAdmin: () => {
        const user = get().user;
        return user?.role === 'admin' || user?.isAdmin === true;
      },
      
      // Update user points (after investment/win)
      updateUserPoints: (points) => {
        const user = get().user;
        if (user) {
          const updatedUser = {
            ...user,
            points: (user.points || 0) + points,
          };
          
          localStorage.setItem('user', JSON.stringify(updatedUser));
          set({ user: updatedUser });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);