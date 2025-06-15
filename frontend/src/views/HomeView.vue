<template>
  <div class="home-view">
    <section class="search-section">
      <input
        v-model="searchQuery"
        @input="onSearch"
        type="text"
        placeholder="Search for jobs..."
        class="search-box"
      />
    </section>

    <section class="categories-section">
      <h2>Job Categories</h2>
      <ul class="categories-list">
        <li
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category)"
          :class="{ selected: selectedCategory && selectedCategory.id === category.id }"
        >
          {{ category.name }}
        </li>
      </ul>
    </section>

    <section class="featured-jobs-section">
      <h2>Featured Jobs</h2>
      <ul class="featured-jobs-list">
        <li v-for="job in filteredFeaturedJobs" :key="job.id" class="job-card">
          <h3>{{ job.title }}</h3>
          <p>{{ job.company }}</p>
          <span class="category">{{ job.category }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
export default {
  name: "HomeView",
  data() {
    return {
      searchQuery: "",
      categories: [
        { id: 1, name: "Engineering" },
        { id: 2, name: "Design" },
        { id: 3, name: "Marketing" },
        { id: 4, name: "Sales" },
        { id: 5, name: "Customer Support" }
      ],
      selectedCategory: null,
      featuredJobs: [
        { id: 101, title: "Frontend Developer", company: "Tech Corp", category: "Engineering" },
        { id: 102, title: "UI/UX Designer", company: "Design Studio", category: "Design" },
        { id: 103, title: "Digital Marketer", company: "Marketify", category: "Marketing" },
        { id: 104, title: "Sales Executive", company: "SalesPro", category: "Sales" },
        { id: 105, title: "Support Specialist", company: "HelpDesk", category: "Customer Support" }
      ]
    };
  },
  computed: {
    filteredFeaturedJobs() {
      let jobs = this.featuredJobs;
      if (this.selectedCategory) {
        jobs = jobs.filter(job => job.category === this.selectedCategory.name);
      }
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        jobs = jobs.filter(
          job =>
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query)
        );
      }
      return jobs;
    }
  },
  methods: {
    selectCategory(category) {
      this.selectedCategory = this.selectedCategory && this.selectedCategory.id === category.id
        ? null
        : category;
    },
    onSearch() {
      // Debounce or API call logic can be added here if needed
    }
  }
};
</script>

<style scoped>
.home-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}
.search-section {
  margin-bottom: 2rem;
}
.search-box {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.categories-section {
  margin-bottom: 2rem;
}
.categories-list {
  display: flex;
  gap: 1rem;
  list-style: none;
  padding: 0;
}
.categories-list li {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s;
}
.categories-list li.selected,
.categories-list li:hover {
  background: #0078d4;
  color: #fff;
}
.featured-jobs-section {
  margin-bottom: 2rem;
}
.featured-jobs-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  list-style: none;
  padding: 0;
}
.job-card {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.job-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}
.job-card .category {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.2rem 0.6rem;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 0.85rem;
}
</style>