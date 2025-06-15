<template>
  <div id="app" class="min-h-screen bg-gray-100 font-sans antialiased">
    <!-- Navigation Bar -->
    <nav class="bg-blue-600 text-white p-4 shadow-md rounded-b-lg">
      <div class="container mx-auto flex justify-between items-center">
        <router-link to="/" class="text-2xl font-bold rounded-md hover:bg-blue-700 p-2 transition-colors duration-200">
          JobReferral.io
        </router-link>
        <div class="space-x-4">
          <router-link to="/jobs" class="hover:underline rounded-md hover:bg-blue-700 p-2 transition-colors duration-200">Browse Jobs</router-link>
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="hover:underline rounded-md hover:bg-blue-700 p-2 transition-colors duration-200">Login</router-link>
            <router-link to="/register" class="hover:underline rounded-md hover:bg-blue-700 p-2 transition-colors duration-200">Register</router-link>
          </template>
          <template v-else>
            <router-link v-if="authStore.userRole === 'employee'" to="/employee/dashboard" class="hover:underline rounded-md hover:bg-blue-700 p-2 transition-colors duration-200">Employee Dashboard</router-link>
            <router-link v-else-if="authStore.userRole === 'job_seeker'" to="/seeker/dashboard" class="hover:underline rounded-md hover:bg-blue-700 p-2 transition-colors duration-200">Job Seeker Dashboard</router-link>
            <button @click="handleLogout" class="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md shadow-md transition-colors duration-200">Logout</button>
          </template>
        </div>
      </div>
    </nav>

    <!-- Main Content Area -->
    <main class="container mx-auto p-6">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white p-4 mt-8 rounded-t-lg">
      <div class="container mx-auto text-center">
        &copy; 2025 JobReferral.io. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth'; // Import Pinia auth store

const authStore = useAuthStore();
const router = useRouter();

// Computed properties for login status
const isLoggedIn = computed(() => authStore.isLoggedIn);
const userRole = computed(() => authStore.userRole);

// Function to handle logout
const handleLogout = () => {
  authStore.logoutUser();
  router.push('/login');
};

// On component mount, initialize auth store from localStorage
onMounted(() => {
  authStore.initializeAuth();
});
</script>

<style>
/* You'll primarily use Tailwind CSS classes, but here's a basic style for Inter font */
@import url('[https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap)');

#app {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>