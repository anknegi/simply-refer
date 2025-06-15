<template>
  <div class="jobseeker-dashboard p-6 bg-white shadow-lg rounded-lg">
    <h1 class="text-4xl font-bold text-gray-900 mb-6 text-center">Job Seeker Dashboard</h1>

    <div v-if="authStore.user" class="text-center text-lg text-gray-700 mb-8">
      Welcome, <span class="font-semibold text-blue-600">{{ authStore.user.name }}</span>! Here are the jobs you've applied for.
    </div>

    <!-- My Applications Section -->
    <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
      <h2 class="text-3xl font-semibold text-gray-800 mb-4">My Applications</h2>

      <div v-if="loadingApplications" class="text-center text-blue-600 text-lg my-8">Loading your applications...</div>
      <div v-else-if="applicationsStore.myApplications.length === 0" class="text-center text-gray-600 text-lg my-8 p-4 bg-gray-50 rounded-md">
        You haven't applied for any jobs yet.
      </div>
      <div v-else>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div v-for="app in applicationsStore.myApplications" :key="app._id" class="application-item p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <h3 class="text-xl font-semibold text-gray-800">{{ app.jobId?.title || 'Job Title N/A' }}</h3>
            <p class="text-gray-600 text-sm mb-2">Company: {{ app.jobId?.companyId?.name || 'N/A' }}</p>
            <p class="text-gray-600 text-sm">Applied On: {{ formatDate(app.appliedAt) }}</p>
            <p class="text-gray-600 text-sm">Status: <span :class="{'text-orange-600': app.status === 'pending', 'text-green-600': app.status === 'reviewed' || app.status === 'hired', 'text-red-600': app.status === 'rejected'}">{{ app.status }}</span></p>
            <div class="mt-3">
               <a :href="app.resumeUrl" target="_blank" class="inline-block bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-md shadow-sm">View Resume</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth'; // Import Pinia auth store
import { useApplicationsStore } from '../stores/applications'; // Import Pinia applications store
import { storeToRefs } from 'pinia'; // Import storeToRefs for destructuring state properties

const authStore = useAuthStore();
const applicationsStore = useApplicationsStore();

// Destructure state from Pinia stores to maintain reactivity
const { user } = storeToRefs(authStore);


// Reactive state for loading applications
const loadingApplications = ref(false);
const applicationsErrorMessage = ref('');

// Helper function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Fetch job seeker's applications on component mount
onMounted(async () => {
  if (authStore.user && authStore.user.role === 'job_seeker') {
    loadingApplications.value = true;
    try {
      await applicationsStore.fetchMyApplications();
    } catch (error) {
      applicationsErrorMessage.value = error.message || 'Failed to load your applications.';
      console.error('Error loading job seeker applications:', error);
    } finally {
      loadingApplications.value = false;
    }
  }
});
</script>