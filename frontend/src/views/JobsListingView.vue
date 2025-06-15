<template>
  <div class="jobs-listing p-6 bg-white shadow-lg rounded-lg">
    <h1 class="text-4xl font-bold text-gray-900 mb-6 text-center">Browse All Referral Jobs</h1>

    <div v-if="loading" class="text-center text-blue-600 text-lg my-8">Loading jobs...</div>
    <div v-else-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md my-4" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline ml-2">{{ errorMessage }}</span>
    </div>
    <div v-else-if="jobs.length === 0" class="text-center text-gray-600 text-lg my-8 p-4 bg-gray-50 rounded-md">
      No job referrals found at the moment. Please check back later!
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <JobCard v-for="job in jobs" :key="job._id" :job="job" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useJobsStore } from '../stores/jobs'; // Import Pinia jobs store
import { storeToRefs } from 'pinia'; // Import storeToRefs for destructuring state properties
import JobCard from '../components/JobCard.vue';

// Reactive variables
const loading = ref(false);
const errorMessage = ref('');

const jobsStore = useJobsStore();
const { jobs } = storeToRefs(jobsStore); // Destructure state property from store

// Fetch jobs on component mount
onMounted(async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    await jobsStore.fetchAllJobs();
  } catch (error) {
    errorMessage.value = 'Failed to load jobs. Please try again later.';
  } finally {
    loading.value = false;
  }
});
</script>