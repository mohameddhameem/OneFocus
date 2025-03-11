<script setup>
import PomodoroTimer from './components/PomodoroTimer.vue';
import ThemeToggle from './components/ThemeToggle.vue';
import { ref } from 'vue';

// Settings state
const showSettings = ref(false);

// Open settings modal
const openSettings = () => {
  showSettings.value = true;
};
</script>

<template>
  <div class="pomodoro-container">
    <div class="top-right-controls">
      <button class="settings-button" @click="openSettings" aria-label="Settings">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
      <ThemeToggle />
    </div>
    
    <header>
      <h1>OneFocus</h1>
    </header>
    <main>
      <PomodoroTimer :show-settings="showSettings" @close-settings="showSettings = false" />
    </main>
  </div>
</template>

<style scoped>
.pomodoro-container {
  max-width: 500px;
  width: 95%;
  margin: 0 auto;
  text-align: center;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  justify-content: center;
  position: relative; /* For absolute positioning of controls */
}

.top-right-controls {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 100;
}

.settings-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--color-text);
  opacity: 0.6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.settings-button:hover {
  opacity: 1;
  background-color: var(--color-background-soft);
}

header {
  margin-bottom: 1.5rem;
  padding-top: 2rem; /* Add padding to account for the fixed position controls */
}

header h1 {
  font-size: 2.5rem;
  text-align: center;
  margin: 0 auto;
}

@media (max-width: 480px) {
  .pomodoro-container {
    padding: 0.75rem;
  }
  
  .top-right-controls {
    top: 0.75rem;
    right: 0.75rem;
  }
  
  header {
    margin-bottom: 1rem;
    padding-top: 1.5rem;
  }
  
  header h1 {
    font-size: 1.75rem;
  }
  
  .settings-button {
    padding: 0.4rem;
  }
  
  .settings-button svg {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 320px) {
  header h1 {
    font-size: 1.5rem;
  }
  
  .top-right-controls {
    top: 0.5rem;
    right: 0.5rem;
  }
  
  .settings-button {
    padding: 0.3rem;
  }
  
  .settings-button svg {
    width: 16px;
    height: 16px;
  }
}
</style>
