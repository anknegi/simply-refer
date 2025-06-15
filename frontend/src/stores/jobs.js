import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth'; // Import auth store to get token

const API_BASE_URL = 'http://localhost:3000/api';

export const useJobsStore = defineStore('jobs', {
  state: () => ({
    jobs: [], // All public jobs
    myJobs: [], // Jobs posted by the logged-in employee
    // You might add specific job details here if not fetched per component
  }),
  actions: {
    async fetchAllJobs() {
      try {
        const response = await axios.get(`${API_BASE_URL}/jobs`);
        this.jobs = response.data.jobs;
      } catch (error) {
        console.error('Error fetching all jobs:', error.response?.data?.message || error.message);
        throw error; // Propagate error for component to handle
      }
    },
    async fetchMyJobs() {
      const authStore = useAuthStore();
      if (!authStore.token) {
        console.warn('Cannot fetch employee jobs: no token available.');
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/jobs/my`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        this.myJobs = response.data.jobs;
      } catch (error) {
        console.error('Error fetching my jobs:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    async createJob(jobData) {
      const authStore = useAuthStore();
      if (!authStore.token) {
        throw new Error('Authentication token missing. Please log in.');
      }
      try {
        await axios.post(`${API_BASE_URL}/jobs`, jobData, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        // Refresh the list of my jobs after creation
        await this.fetchMyJobs();
        return true;
      } catch (error) {
        console.error('Error creating job:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    async deleteJob(jobId) {
      const authStore = useAuthStore();
      if (!authStore.token) {
        throw new Error('Authentication token missing. Please log in.');
      }
      try {
        await axios.delete(`${API_BASE_URL}/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        // Remove the deleted job from the state
        this.myJobs = this.myJobs.filter(job => job._id !== jobId);
        this.jobs = this.jobs.filter(job => job._id !== jobId); // Also remove from public list if present
        return true;
      } catch (error) {
        console.error('Error deleting job:', error.response?.data?.message || error.message);
        throw error;
      }
    }
    // You could add actions for updating jobs, fetching single job by ID etc.
  },
});