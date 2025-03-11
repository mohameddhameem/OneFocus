<script setup>
import { ref, onMounted, watch } from 'vue';

// Theme state
const isDark = ref(false);

// Initialize theme from local storage or system preference
onMounted(() => {
  // Check if theme preference is stored in localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDark.value = savedTheme === 'dark';
  } else {
    // Use system preference if no saved preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  // Apply theme immediately on mount
  applyTheme();
});

// Watch for changes to isDark and apply theme
watch(isDark, () => {
  applyTheme();
  // Save preference to localStorage
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
});

// Apply the theme to the document
const applyTheme = () => {
  document.documentElement.classList.toggle('dark-theme', isDark.value);
};

// Toggle theme function
const toggleTheme = () => {
  isDark.value = !isDark.value;
};
</script>

<template>
  <button @click="toggleTheme" class="theme-toggle" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
    <!-- Sun icon for light mode -->
    <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
    <!-- Moon icon for dark mode -->
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
  color: var(--color-text);
}

.theme-toggle:hover {
  background-color: var(--color-background-soft);
}

/* Responsive design */
@media (max-width: 480px) {
  .theme-toggle {
    padding: 5px;
  }
  
  .theme-toggle svg {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 320px) {
  .theme-toggle svg {
    width: 18px;
    height: 18px;
  }
}
</style>