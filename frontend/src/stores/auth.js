import { defineStore } from 'pinia';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
  },
  actions: {
    async login(credentials) {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('role', this.user.role); // Store role for easy access in router guards
        return true; // Indicate success
      } catch (error) {
        console.error('Login error:', error.response?.data?.message || error.message);
        throw error; // Propagate error for component to handle
      }
    },
    async register(userData) {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('role', this.user.role);
        return true;
      } catch (error) {
        console.error('Registration error:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    logoutUser() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    },
    // Action to rehydrate state from localStorage on app load (if directly accessing store outside setup)
    initializeAuth() {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        try {
          this.token = token;
          this.user = JSON.parse(user);
        } catch (e) {
          console.error("Failed to parse user data from localStorage", e);
          this.logoutUser(); // Clear invalid data
        }
      }
    }
  },
});