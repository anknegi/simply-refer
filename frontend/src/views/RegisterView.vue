<template>
  <div class="register-view flex items-center justify-center min-h-[calc(100vh-180px)]">
    <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg border border-gray-200">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-6">Create Your Account</h2>
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label for="name" class="block text-gray-700 text-sm font-semibold mb-2">Full Name:</label>
          <input
            type="text"
            id="name"
            v-model="name"
            class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>
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
        <div class="mb-4">
          <label for="password" class="block text-gray-700 text-sm font-semibold mb-2">Password:</label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>
        <div class="mb-6">
          <label for="role" class="block text-gray-700 text-sm font-semibold mb-2">I am a:</label>
          <select
            id="role"
            v-model="role"
            @change="toggleCompanyFields"
            class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          >
            <option value="job_seeker">Job Seeker</option>
            <option value="employee">Employee (posting jobs)</option>
          </select>
        </div>

        <div v-if="role === 'employee'" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 class="text-lg font-semibold text-blue-800 mb-3">Company Details (for Employees)</h3>
          <div class="mb-4">
            <label for="companyName" class="block text-gray-700 text-sm font-semibold mb-2">Company Name:</label>
            <input
              type="text"
              id="companyName"
              v-model="companyName"
              class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          <div class="mb-4">
            <label for="companyDomain" class="block text-gray-700 text-sm font-semibold mb-2">Company Email Domain (e.g., example.com):</label>
            <input
              type="text"
              id="companyDomain"
              v-model="companyDomain"
              class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Optional, for internal validation"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
          <strong class="font-bold">Error:</strong>
          <span class="block sm:inline ml-2">{{ errorMessage }}</span>
        </div>
        <button
          type="submit"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 shadow-md transform hover:scale-105 transition-all duration-300"
          :disabled="loading"
        >
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>
      <p class="text-center text-gray-600 text-sm mt-6">
        Already have an account?
        <router-link to="/login" class="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200">Login here</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth'; // Import Pinia auth store

// Reactive variables
const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('job_seeker'); // Default role
const companyName = ref('');
const companyDomain = ref('');
const errorMessage = ref('');
const loading = ref(false);

const authStore = useAuthStore();
const router = useRouter();

// Toggle company fields based on role
const toggleCompanyFields = () => {
  if (role.value === 'job_seeker') {
    companyName.value = '';
    companyDomain.value = '';
  }
};

// Handle registration
const handleRegister = async () => {
  errorMessage.value = '';
  loading.value = true;
  try {
    const userData = {
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
    };

    if (role.value === 'employee') {
      userData.companyName = companyName.value;
      userData.companyDomain = companyDomain.value;
    }

    await authStore.register(userData);
    // Redirect based on user role after successful registration
    if (authStore.userRole === 'employee') {
      router.push('/employee/dashboard');
    } else {
      router.push('/seeker/dashboard');
    }
  } catch (error) {
    errorMessage.value = error.message || 'Failed to register. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>