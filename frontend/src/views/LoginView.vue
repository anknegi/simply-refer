<template>
  <div class="login-view flex items-center justify-center min-h-[calc(100vh-180px)]">
    <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-6">Login to Your Account</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="email" class="block text-gray-700 text-sm font-semibold mb-2">Email:</label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700 text-sm font-semibold mb-2">Password:</label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>
        <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
          <strong class="font-bold">Error:</strong>
          <span class="block sm:inline ml-2">{{ errorMessage }}</span>
        </div>
        <button
          type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md transform hover:scale-105 transition-all duration-300"
          :disabled="loading"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      <p class="text-center text-gray-600 text-sm mt-6">
        Don't have an account?
        <router-link to="/register" class="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200">Register here</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth'; // Import Pinia auth store

// Reactive variables
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const loading = ref(false);

const authStore = useAuthStore();
const router = useRouter();

// Handle login function
const handleLogin = async () => {
  errorMessage.value = '';
  loading.value = true;
  try {
    await authStore.login({ email: email.value, password: password.value });
    // Redirect based on user role (accessed directly from store)
    if (authStore.userRole === 'employee') {
      router.push('/employee/dashboard');
    } else if (authStore.userRole === 'job_seeker') {
      router.push('/seeker/dashboard');
    } else {
      router.push('/'); // Default redirect
    }
  } catch (error) {
    errorMessage.value = error.message || 'Failed to login. Please check your credentials.';
  } finally {
    loading.value = false;
  }
};
</script>