<template>
  <div class="employee-dashboard p-6 bg-white shadow-lg rounded-lg">
    <h1 class="text-4xl font-bold text-gray-900 mb-6 text-center">Employee Dashboard</h1>

    <div v-if="authStore.user" class="text-center text-lg text-gray-700 mb-8">
      Welcome, <span class="font-semibold text-blue-600">{{ authStore.user.name }}</span>! You are an employee of <span class="font-semibold text-purple-600">{{ authStore.user.companyId?.name || 'N/A' }}</span>.
    </div>

    <!-- Create New Job Section -->
    <div class="mb-10 p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-inner">
      <h2 class="text-3xl font-semibold text-blue-800 mb-4">Post a New Job Referral</h2>
      <form @submit.prevent="handleCreateJob">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="mb-4">
            <label for="jobTitle" class="block text-gray-700 text-sm font-semibold mb-2">Job Title:</label>
            <input type="text" id="jobTitle" v-model="newJob.title"
                   class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                   required>
          </div>
          <div class="mb-4">
            <label for="jobLocation" class="block text-gray-700 text-sm font-semibold mb-2">Location:</label>
            <input type="text" id="jobLocation" v-model="newJob.location"
                   class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                   required>
          </div>
        </div>
        <div class="mb-4">
          <label for="employmentType" class="block text-gray-700 text-sm font-semibold mb-2">Employment Type:</label>
          <select id="employmentType" v-model="newJob.employmentType"
                  class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Temporary">Temporary</option>
          </select>
        </div>
        <div class="mb-4">
          <label for="jobDescription" class="block text-gray-700 text-sm font-semibold mb-2">Description:</label>
          <textarea id="jobDescription" v-model="newJob.description" rows="5"
                    class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required></textarea>
        </div>
        <div class="mb-6">
          <label for="jobRequirements" class="block text-gray-700 text-sm font-semibold mb-2">Requirements:</label>
          <textarea id="jobRequirements" v-model="newJob.requirements" rows="5"
                    class="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required></textarea>
        </div>

        <div v-if="createJobErrorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
          <strong class="font-bold">Error:</strong>
          <span class="block sm:inline ml-2">{{ createJobErrorMessage }}</span>
        </div>
        <div v-if="createJobSuccessMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-4" role="alert">
          <strong class="font-bold">Success:</strong>
          <span class="block sm:inline ml-2">{{ createJobSuccessMessage }}</span>
        </div>

        <button type="submit"
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md transform hover:scale-105 transition-all duration-300"
                :disabled="creatingJob">
          {{ creatingJob ? 'Posting Job...' : 'Post New Job' }}
        </button>
      </form>
    </div>

    <!-- My Posted Jobs Section -->
    <div class="mb-10 p-6 bg-white border border-gray-200 rounded-lg shadow-md">
      <h2 class="text-3xl font-semibold text-gray-800 mb-4">My Posted Jobs</h2>

      <div v-if="loadingJobs" class="text-center text-blue-600 text-lg my-8">Loading your jobs...</div>
      <div v-else-if="jobsStore.myJobs.length === 0" class="text-center text-gray-600 text-lg my-8 p-4 bg-gray-50 rounded-md">
        You haven't posted any jobs yet.
      </div>
      <div v-else>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div v-for="job in jobsStore.myJobs" :key="job._id" class="job-item p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <h3 class="text-xl font-semibold text-gray-800">{{ job.title }}</h3>
            <p class="text-gray-600 text-sm">Location: {{ job.location }} | Status: <span :class="{'text-green-600': job.status === 'active', 'text-red-600': job.status === 'closed'}">{{ job.status }}</span></p>
            <div class="mt-3 flex space-x-2">
              <button @click="showApplications(job._id)" class="bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-md shadow-sm">View Applications</button>
              <!-- Implement Edit Job functionality -->
              <!-- <button @click="editJob(job._id)" class="bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-2 px-4 rounded-md shadow-sm">Edit</button> -->
              <button @click="confirmDelete(job._id)" class="bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-4 rounded-md shadow-sm">Delete</button>
            </div>

            <!-- Applications List for this Job -->
            <div v-if="selectedJobIdForApplications === job._id && applicationsStore.jobApplications.length > 0" class="mt-6 p-4 bg-gray-100 rounded-md border border-gray-300">
              <h4 class="text-lg font-semibold text-gray-800 mb-3">Applications for {{ job.title }}</h4>
              <ul class="space-y-3">
                <li v-for="app in applicationsStore.jobApplications" :key="app._id" class="p-3 bg-white rounded-md shadow-sm border border-gray-200">
                  <p class="font-medium text-gray-800">{{ app.applicantName }} ({{ app.applicantEmail }})</p>
                  <p class="text-gray-600 text-sm">Phone: {{ app.applicantPhone || 'N/A' }}</p>
                  <a :href="app.resumeUrl" target="_blank" class="text-blue-500 hover:underline text-sm">Download Resume</a>
                  <p class="text-gray-700 text-sm mt-1">Cover Letter: {{ app.coverLetter || 'N/A' }}</p>
                </li>
              </ul>
            </div>
            <div v-else-if="selectedJobIdForApplications === job._id && applicationsLoading" class="mt-6 text-center text-blue-500">Loading applications...</div>
            <div v-else-if="selectedJobIdForApplications === job._id && applicationsStore.jobApplications.length === 0" class="mt-6 text-center text-gray-600 text-sm">No applications yet for this job.</div>
            <div v-else-if="selectedJobIdForApplications === job._id && applicationsError" class="mt-6 bg-red-100 text-red-700 p-3 rounded-md text-sm">Error loading applications: {{ applicationsError }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal for Delete -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm text-center">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
        <p class="text-gray-700 mb-6">Are you sure you want to delete this job post? This action cannot be undone.</p>
        <div class="flex justify-center space-x-4">
          <button @click="deleteJob" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-md shadow-md transition-colors duration-200">Yes, Delete</button>
          <button @click="cancelDelete" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-5 rounded-md shadow-md transition-colors duration-200">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth'; // Import Pinia auth store
import { useJobsStore } from '../stores/jobs'; // Import Pinia jobs store
import { useApplicationsStore } from '../stores/applications'; // Import Pinia applications store
import { storeToRefs } from 'pinia'; // Import storeToRefs for destructuring state properties

const authStore = useAuthStore();
const jobsStore = useJobsStore();
const applicationsStore = useApplicationsStore();

// Destructure state from Pinia stores to maintain reactivity
const { user } = storeToRefs(authStore);


// Reactive state for job creation form
const newJob = reactive({
  title: '',
  description: '',
  requirements: '',
  location: '',
  employmentType: 'Full-time'
});

// Reactive state for UI feedback and loading
const creatingJob = ref(false);
const createJobErrorMessage = ref('');
const createJobSuccessMessage = ref('');
const loadingJobs = ref(false);
const selectedJobIdForApplications = ref(null);
const applicationsLoading = ref(false);
const applicationsError = ref('');
const showDeleteModal = ref(false);
const jobToDeleteId = ref(null);

// Handle creating a new job post
const handleCreateJob = async () => {
  createJobErrorMessage.value = '';
  createJobSuccessMessage.value = '';
  creatingJob.value = true;
  try {
    await jobsStore.createJob(newJob);
    createJobSuccessMessage.value = 'Job posted successfully!';
    // Clear form
    newJob.title = '';
    newJob.description = '';
    newJob.requirements = '';
    newJob.location = '';
    newJob.employmentType = 'Full-time';
  } catch (error) {
    createJobErrorMessage.value = error.message || 'Failed to post job.';
  } finally {
    creatingJob.value = false;
  }
};

// Toggle and fetch applications for a specific job
const showApplications = async (jobId) => {
  if (selectedJobIdForApplications.value === jobId) {
    // Toggle off if already open
    selectedJobIdForApplications.value = null;
    applicationsStore.jobApplications = []; // Clear applications state when closing
    return;
  }

  selectedJobIdForApplications.value = jobId;
  applicationsLoading.value = true;
  applicationsError.value = '';
  try {
    await applicationsStore.fetchJobApplications(jobId);
  } catch (error) {
    applicationsError.value = error.message || 'Could not fetch applications.';
  } finally {
    applicationsLoading.value = false;
  }
};

// Show delete confirmation modal
const confirmDelete = (jobId) => {
  jobToDeleteId.value = jobId;
  showDeleteModal.value = true;
};

// Cancel delete operation
const cancelDelete = () => {
  showDeleteModal.value = false;
  jobToDeleteId.value = null;
};

// Execute job deletion
const deleteJob = async () => {
  showDeleteModal.value = false; // Close modal immediately
  try {
    if (jobToDeleteId.value) {
      await jobsStore.deleteJob(jobToDeleteId.value);
      // In a real app, use a custom modal for success messages too
      console.log('Job deleted successfully!');
    }
  } catch (error) {
    // In a real app, use a custom modal for error messages too
    console.error('Error deleting job:', error.message || 'Failed to delete job.');
  } finally {
    jobToDeleteId.value = null;
  }
};

// Fetch employee's jobs on component mount
onMounted(async () => {
  // Ensure user data is loaded (it should be from App.vue's onMounted hook)
  // Pinia store's state is directly reactive.
  if (authStore.user && authStore.user.role === 'employee') {
    loadingJobs.value = true;
    try {
      await jobsStore.fetchMyJobs();
    } catch (error) {
      console.error('Error loading employee jobs:', error);
    } finally {
      loadingJobs.value = false;
    }
  }
});
</script>