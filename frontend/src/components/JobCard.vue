<template>
  <div class="job-card bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col justify-between">
    <div>
      <h3 class="text-2xl font-semibold text-gray-800 mb-2">{{ job.title }}</h3>
      <p class="text-blue-600 font-medium text-lg mb-2">{{ job.companyId?.name || 'N/A' }}</p>
      <p class="text-gray-700 text-sm mb-1"><strong>Location:</strong> {{ job.location }}</p>
      <p class="text-gray-700 text-sm mb-1"><strong>Employment Type:</strong> {{ job.employmentType }}</p>
      <p v-if="job.referrerId" class="text-gray-700 text-sm mb-4"><strong>Posted by:</strong> {{ job.referrerId.name }}</p>
      <p class="text-gray-600 text-sm line-clamp-3">{{ job.description }}</p>
    </div>
    <div class="mt-4">
      <router-link :to="{ name: 'job-detail', params: { id: job._id } }"
        class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transform hover:scale-105 transition-all duration-300 w-full text-center">
        View Details
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

// Define props for the component
const props = defineProps({
  job: {
    type: Object,
    required: true
  }
});
</script>
