import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import JobsListingView from '../views/JobsListingView.vue';
import JobDetailView from '../views/JobDetailView.vue';
import EmployeeDashboard from '../views/EmployeeDashboard.vue';
import JobSeekerDashboard from '../views/JobSeekerDashboard.vue';

// Import Pinia stores for use in navigation guards
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/jobs',
      name: 'jobs',
      component: JobsListingView
    },
    {
      path: '/jobs/:id',
      name: 'job-detail',
      component: JobDetailView,
      props: true // Allows passing route params as props
    },
    {
      path: '/employee/dashboard',
      name: 'employee-dashboard',
      component: EmployeeDashboard,
      meta: { requiresAuth: true, requiredRole: 'employee' }
    },
    {
      path: '/seeker/dashboard',
      name: 'job-seeker-dashboard',
      component: JobSeekerDashboard,
      meta: { requiresAuth: true, requiredRole: 'job_seeker' }
    }
  ]
});

// Navigation Guard for authentication and authorization
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore(); // Access Pinia auth store
  const token = authStore.token || localStorage.getItem('token');
  const userRole = authStore.user?.role || localStorage.getItem('role'); // Assuming role is stored on login

  if (to.meta.requiresAuth && !token) {
    next('/login'); // Redirect to login if auth required but no token
  } else if (to.meta.requiredRole && userRole !== to.meta.requiredRole) {
    // If role required but user doesn't have it, redirect (e.g., to home or an unauthorized page)
    console.warn('You do not have permission to access this page.'); // Log to console instead of alert
    // In a real app, you'd show a custom modal or toast notification
    next('/');
  } else {
    next(); // Proceed
  }
});

export default router;