<template>
  <div class="job-detail p-8 bg-white shadow-lg rounded-lg">
    <div v-if="loading" class="text-center text-blue-600 text-lg my-8">Loading job details...</div>
    <div v-else-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md my-4" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline ml-2">{{ errorMessage }}</span>
    </div>
    <div v-else-if="job">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ job.title }}</h1>
      <p class="text-blue-600 font-medium text-xl mb-4">{{ job.companyId?.name || 'N/A' }}</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Job Details</h3>
          <p class="text-gray-700 mb-2"><strong>Location:</strong> {{ job.location }}</p>
          <p class="text-gray-700 mb-2"><strong>Employment Type:</strong> {{ job.employmentType }}</p>
          <p class="text-gray-700 mb-2"><strong>Posted by:</strong> {{ job.referrerId?.name || 'N/A' }} ({{ job.referrerId?.email || 'N/A' }})</p>
          <p class="text-gray-700 mb-2"><strong>Posted On:</strong> {{ formatDate(job.createdAt) }}</p>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Description</h3>
          <p class="text-gray-700 whitespace-pre-wrap">{{ job.description }}</p>
        </div>
      </div>

      <div class="mb-8">
        <h3 class="text-xl font-semibold text-gray-800 mb-2">Requirements</h3>
        <p class="text-gray-700 whitespace-pre-wrap">{{ job.requirements }}</p>
      </div>

      <div v-if="isAuthenticated" class="apply-section bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
        <h3 class="text-2xl font-bold text-blue-700 mb-4">Apply for this Job</h3>
        <form @submit.prevent="handleApply">
          <div class="mb-4">
            <label for="applicantName" class="block text-gray-700 text-sm font-semibold mb-2">Your Name:</label>
            <input type="text" id="applicantName" v-model="applicationForm.applicantName"
                   class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                   required>
          </div>
          <div class="mb-4">
            <label for="applicantEmail" class="block text-gray-700 text-sm font-semibold mb-2">Your Email:</label>
            <input type="email" id="applicantEmail" v-model="applicationForm.applicantEmail"
                   class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                   required>
          </div>
          <div class="mb-4">
            <label for="applicantPhone" class="block text-gray-700 text-sm font-semibold mb-2">Your Phone (Optional):</label>
            <input type="tel" id="applicantPhone" v-model="applicationForm.applicantPhone"
                   class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
          </div>
          <div class="mb-4">
            <label for="resume" class="block text-gray-700 text-sm font-semibold mb-2">Upload Resume (PDF, DOCX):</label>
            <input type="file" id="resume" @change="handleResumeUpload"
                   class="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-all duration-200"
                   accept=".pdf,.doc,.docx" required>
          </div>
          <div class="mb-6">
            <label for="coverLetter" class="block text-gray-700 text-sm font-semibold mb-2">Cover Letter (Optional):</label>
            <textarea id="coverLetter" v-model="applicationForm.coverLetter" rows="5"
                      class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"></textarea>
          </div>

          <div v-if="applyErrorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
            <strong class="font-bold">Error:</strong>
            <span class="block sm:inline ml-2">{{ applyErrorMessage }}</span>
          </div>
          <div v-if="applySuccessMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-4" role="alert">
            <strong class="font-bold">Success:</strong>
            <span class="block sm:inline ml-2">{{ applySuccessMessage }}</span>
          </div>

          <button type="submit"
                  class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 shadow-md transform hover:scale-105 transition-all duration-300"
                  :disabled="applying">
            {{ applying ? 'Submitting Application...' : 'Apply Now' }}
          </button>
        </form>
      </div>
      <div v-else class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-md mb-4" role="alert">
        <strong class="font-bold">Notice:</strong>
        <span class="block sm:inline ml-2">You must be logged in as a job seeker to apply for this job.</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth'; // Import Pinia auth store
import { useApplicationsStore } from '../stores/applications'; // Import Pinia applications store
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // Your backend API URL

const route = useRoute();
const authStore = useAuthStore();
const applicationsStore = useApplicationsStore();
const isAuthenticated = computed(() => !!authStore.user)

// Reactive variables
const job = ref(null);
const loading = ref(false);
const errorMessage = ref('');
const applying = ref(false);
const applyErrorMessage = ref('');
const applySuccessMessage = ref('');
const applicationForm = reactive({
  applicantName: '',
  applicantEmail: '',
  applicantPhone: '',
  resume: null,
  coverLetter: ''
});

// Helper function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Handle resume file upload
const handleResumeUpload = (event) => {
  applicationForm.resume = event.target.files[0];
};

// Handle job application submission
const handleApply = async () => {
  applyErrorMessage.value = '';
  applySuccessMessage.value = '';
  applying.value = true;

  const jobId = route.params.id;

  // Create FormData for file upload
  const formData = new FormData();
  formData.append('applicantName', applicationForm.applicantName);
  formData.append('applicantEmail', applicationForm.applicantEmail);
  formData.append('applicantPhone', applicationForm.applicantPhone);
  formData.append('coverLetter', applicationForm.coverLetter);
  formData.append('resume', applicationForm.resume);
  if (authStore.user && authStore.user.role === 'job_seeker') {
    formData.append('jobSeekerId', authStore.user.id);
  }

  try {
    await applicationsStore.applyForJob(jobId, formData);
    applySuccessMessage.value = 'Your application has been submitted successfully!';
    // Reset form or redirect after success
    applicationForm.applicantName = authStore.user?.name || '';
    applicationForm.applicantEmail = authStore.user?.email || '';
    applicationForm.applicantPhone = '';
    applicationForm.resume = null;
    applicationForm.coverLetter = '';
    // Clear the file input visually
    const resumeInput = document.getElementById('resume');
    if (resumeInput) resumeInput.value = '';

  } catch (error) {
    applyErrorMessage.value = error.message || 'Failed to submit application. Please try again.';
  } finally {
    applying.value = false;
  }
};

// Fetch job details on component mount
onMounted(async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await axios.get(`${API_BASE_URL}/jobs/${route.params.id}`);
    job.value = response.data.job;

    // Pre-fill application form if user is logged in as a job seeker
    if (authStore.user && authStore.user.role === 'job_seeker') {
      applicationForm.applicantName = authStore.user.name;
      applicationForm.applicantEmail = authStore.user.email;
      // Optionally pre-fill phone if available in user profile
      // applicationForm.applicantPhone = authStore.user.phone;
    }

  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to load job details.';
  } finally {
    loading.value = false;
  }
});
</script>