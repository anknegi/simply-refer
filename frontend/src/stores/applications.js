import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth'; // Import auth store to get token

const API_BASE_URL = 'http://localhost:3000/api';

export const useApplicationsStore = defineStore('applications', {
  state: () => ({
    jobApplications: [], // Applications for a specific job (employee view)
    myApplications: [], // Applications submitted by the logged-in job seeker
  }),
  actions: {
    async applyForJob(jobId, formData) {
      // No token required as application can be submitted by guests
      try {
        await axios.post(`${API_BASE_URL}/jobs/${jobId}/apply`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Crucial for file uploads
            },
        });
        // If the user is a job seeker and logged in, refresh their applications
        const authStore = useAuthStore();
        if (authStore.user && authStore.user.role === 'job_seeker') {
            await this.fetchMyApplications();
        }
        return true;
      } catch (error) {
        console.error('Error applying for job:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    async fetchJobApplications(jobId) {
      const authStore = useAuthStore();
      if (!authStore.token) {
        throw new Error('Authentication token missing. Please log in.');
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}/applications`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        this.jobApplications = response.data.applications;
      } catch (error) {
        console.error('Error fetching job applications:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    async fetchMyApplications() {
      const authStore = useAuthStore();
      if (!authStore.token || authStore.userRole !== 'job_seeker') {
        console.warn('Cannot fetch job seeker applications: not authenticated as job seeker.');
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/applications/my`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        this.myApplications = response.data.applications;
      } catch (error) {
        console.error('Error fetching my applications:', error.response?.data?.message || error.message);
        throw error;
      }
    }
  },
});