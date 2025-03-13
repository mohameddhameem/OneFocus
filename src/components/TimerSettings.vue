<script setup>
import { ref } from 'vue';

// eslint-disable-next-line
const emit = defineEmits(['save']);

// Initialize with default values from props
// eslint-disable-next-line
const props = defineProps({
  focusDuration: {
    type: Number,
    default: 25,
  },
  shortBreakDuration: {
    type: Number,
    default: 5,
  },
  longBreakDuration: {
    type: Number,
    default: 30,
  },
  pomodorosUntilLongBreak: {
    type: Number,
    default: 3,
  },
  show: {
    type: Boolean,
    default: false,
  }
});

// Local refs for form values
const focus = ref(props.focusDuration);
const shortBreak = ref(props.shortBreakDuration);
const longBreak = ref(props.longBreakDuration);
const pomodoroCount = ref(props.pomodorosUntilLongBreak);

// Save settings
const saveSettings = () => {
  const settings = {
    focusDuration: validateInput(parseInt(focus.value), 1, 120, 25),
    shortBreakDuration: validateInput(parseInt(shortBreak.value), 1, 60, 5),
    longBreakDuration: validateInput(parseInt(longBreak.value), 1, 120, 30),
    pomodorosUntilLongBreak: validateInput(parseInt(pomodoroCount.value), 1, 10, 3),
  };
  
  emit('save', settings);
};

// Input validation helper
const validateInput = (value, min, max, defaultValue) => {
  if (isNaN(value) || value < min || value > max) {
    return defaultValue;
  }
  return value;
};

// Reset to defaults
const resetDefaults = () => {
  focus.value = 25;
  shortBreak.value = 5;
  longBreak.value = 30;
  pomodoroCount.value = 3;
};

// Close settings without saving
const closeSettings = () => {
  emit('save', null);
};
</script>

<template>
  <div v-if="show" class="settings-overlay">
    <div class="settings-modal">
      <div class="settings-header">
        <h2>Timer Settings</h2>
        <button class="close-button" @click="closeSettings" aria-label="Close settings">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="settings-form">
        <div class="form-group">
          <label for="focus">Focus Duration (minutes)</label>
          <input type="number" id="focus" v-model="focus" min="1" max="120" />
        </div>
        
        <div class="form-group">
          <label for="shortBreak">Short Break Duration (minutes)</label>
          <input type="number" id="shortBreak" v-model="shortBreak" min="1" max="60" />
        </div>
        
        <div class="form-group">
          <label for="longBreak">Long Break Duration (minutes)</label>
          <input type="number" id="longBreak" v-model="longBreak" min="1" max="120" />
        </div>
        
        <div class="form-group">
          <label for="pomodoroCount">Pomodoros until Long Break</label>
          <input type="number" id="pomodoroCount" v-model="pomodoroCount" min="1" max="10" />
        </div>
      </div>
      
      <div class="settings-actions">
        <button class="reset-button" @click="resetDefaults">Reset Defaults</button>
        <button class="save-button" @click="saveSettings">Save Settings</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.settings-modal {
  background-color: var(--color-background);
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.settings-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--color-text);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: var(--color-background-soft);
}

.settings-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  font-size: 1rem;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.reset-button {
  padding: 0.75rem 1rem;
  background-color: var(--color-background-soft);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--color-text);
}

.save-button {
  padding: 0.75rem 1rem;
  background-color: var(--pomodoro-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

@media (max-width: 480px) {
  .settings-modal {
    padding: 1rem;
  }
  
  .settings-header h2 {
    font-size: 1.25rem;
  }
}
</style>