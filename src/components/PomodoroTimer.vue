<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import TimerSettings from './TimerSettings.vue';

// Define props for settings visibility
const props = defineProps({ // eslint-disable-line
  showSettings: {
    type: Boolean,
    default: false
  }
}); // eslint-disable-line no-unused-vars

// Define emits for closing settings
const emit = defineEmits(['closeSettings']); // eslint-disable-line

// Load saved settings from localStorage or use defaults
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('pomodoro-settings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  
  return {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 30,
    pomodorosUntilLongBreak: 3
  };
};

// Settings state
const settings = ref(loadSettings());

// Timer configurations based on settings
const POMODORO_TIME = computed(() => settings.value.focusDuration * 60);
const SHORT_BREAK_TIME = computed(() => settings.value.shortBreakDuration * 60);
const LONG_BREAK_TIME = computed(() => settings.value.longBreakDuration * 60);
const POMODOROS_UNTIL_LONG_BREAK = computed(() => settings.value.pomodorosUntilLongBreak);

// Timer states
const timeLeft = ref(POMODORO_TIME.value);
const isRunning = ref(false);
const timerInterval = ref(null);
const completedPomodoros = ref(0);
const timerMode = ref('pomodoro'); // 'pomodoro', 'shortBreak', or 'longBreak'

// Handle settings updates
const updateSettings = (newSettings) => {
  if (!newSettings) {
    emit('closeSettings');
    return; // User canceled
  }
  
  // Update settings
  settings.value = newSettings;
  
  // Save to localStorage
  localStorage.setItem('pomodoro-settings', JSON.stringify(newSettings));
  
  // Update current timer if not running
  if (!isRunning.value) {
    resetTimer();
  }
  
  // Close settings
  emit('closeSettings');
};

// Watch for changes in computed timer values
watch([POMODORO_TIME, SHORT_BREAK_TIME, LONG_BREAK_TIME], () => {
  if (!isRunning.value) {
    resetTimer();
  }
});

// Dynamic class based on current mode
const timerDisplayClass = computed(() => {
  return `timer-display mode-${timerMode.value}`;
});

// Computed properties for UI display
// eslint-disable-next-line no-unused-vars
const currentMode = computed(() => {
  switch (timerMode.value) {
    case 'pomodoro': return 'Focus';
    case 'shortBreak': return 'Short Break';
    case 'longBreak': return 'Long Break';
    default: return 'Focus';
  }
});

// Format time as minutes:seconds
const formattedTime = () => {
  const minutes = Math.floor(timeLeft.value / 60);
  const seconds = timeLeft.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Update document title with timer and mode
const updateDocumentTitle = () => {
  const time = formattedTime();
  const mode = timerMode.value === 'pomodoro' ? 'Focus' : 
    timerMode.value === 'shortBreak' ? 'Short Break' : 'Long Break';
  document.title = `${time} - ${mode} | OneFocus`;
};

// Set timer based on mode
const setTimerMode = (mode) => {
  timerMode.value = mode;
  isRunning.value = false;
  clearInterval(timerInterval.value);
  timerInterval.value = null;

  switch (mode) {
    case 'pomodoro':
      timeLeft.value = POMODORO_TIME.value;
      break;
    case 'shortBreak':
      timeLeft.value = SHORT_BREAK_TIME.value;
      break;
    case 'longBreak':
      timeLeft.value = LONG_BREAK_TIME.value;
      break;
    default:
      timeLeft.value = POMODORO_TIME.value;
  }
  updateDocumentTitle(); // Update title when mode changes
};

// Timer control functions
const startTimer = () => {
  if (isRunning.value) {
    // Pause the timer
    clearInterval(timerInterval.value);
    timerInterval.value = null;
    isRunning.value = false;
  } else {
    // Start the timer
    isRunning.value = true;
    updateTimer(); // Initial update
    timerInterval.value = setInterval(updateTimer, 1000);
  }
  updateDocumentTitle(); // Update title when timer starts/pauses
};

const updateTimer = () => {
  if (timeLeft.value > 0) {
    timeLeft.value--;
    updateDocumentTitle(); // Update title every second
  }
  if (timeLeft.value === 0) {
    // Timer completed
    clearInterval(timerInterval.value);
    timerInterval.value = null;
    isRunning.value = false;
    handleTimerCompletion();
  }
};

const handleTimerCompletion = () => {
  // Stop the timer completely
  clearInterval(timerInterval.value);
  timerInterval.value = null;
  isRunning.value = false;
  timeLeft.value = 0;

  if (timerMode.value === 'pomodoro') {
    // Increment completed pomodoros counter
    completedPomodoros.value++;
    notifyCompletion('Work session completed!', 'Time for a break.');

    // Determine which break to take
    if (completedPomodoros.value % POMODOROS_UNTIL_LONG_BREAK.value === 0) {
      setTimerMode('longBreak');
    } else {
      setTimerMode('shortBreak');
    }
  } else {
    // Break is over, back to pomodoro
    notifyCompletion('Break time over!', 'Ready to focus again?');
    setTimerMode('pomodoro');
  }
};

const resetTimer = () => {
  clearInterval(timerInterval.value);
  timerInterval.value = null;
  isRunning.value = false;
  
  // Reset to current mode's default time
  switch (timerMode.value) {
    case 'pomodoro':
      timeLeft.value = POMODORO_TIME.value;
      break;
    case 'shortBreak':
      timeLeft.value = SHORT_BREAK_TIME.value;
      break;
    case 'longBreak':
      timeLeft.value = LONG_BREAK_TIME.value;
      break;
    default:
      timeLeft.value = POMODORO_TIME.value;
  }
  updateDocumentTitle(); // Update title when timer resets
};

const resetAllTimers = () => {
  completedPomodoros.value = 0;
  setTimerMode('pomodoro');
};

// Skip break and go back to focus mode
const skipBreak = () => {
  notifyCompletion('Break skipped', 'Back to focus mode');
  setTimerMode('pomodoro');
};

const notifyCompletion = (title, body) => {
  // Play a sound (if available)
  try {
    const audio = new Audio('/notification.mp3');
    audio.play();
  } catch (e) {
    console.log('Sound notification not supported');
  }

  // Browser notification
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: '/favicon.ico'
    });
  }
};

// Request notification permission
onMounted(() => {
  if (Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
});

// Clean up on component unmount
onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
});
</script>

<template>
  <div :class="timerDisplayClass">
    <div class="timer-mode">
      <button 
        :class="['mode-btn', { active: timerMode === 'pomodoro' }]" 
        @click="setTimerMode('pomodoro')">
        Focus
      </button>
      <button 
        :class="['mode-btn', { active: timerMode === 'shortBreak' }]" 
        @click="setTimerMode('shortBreak')">
        Short Break
      </button>
      <button 
        :class="['mode-btn', { active: timerMode === 'longBreak' }]" 
        @click="setTimerMode('longBreak')">
        Long Break
      </button>
    </div>

    <div class="timer">{{ formattedTime() }}</div>
    
    <div class="pomodoro-count">
      Completed: {{ completedPomodoros }} / {{ POMODOROS_UNTIL_LONG_BREAK }}
    </div>
    
    <div class="controls">
      <button class="start" @click="startTimer" aria-label="Start or pause timer">
        <span class="button-icon">
          <svg v-if="!isRunning" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </span>
        <span class="button-text">{{ isRunning ? 'Pause' : 'Start' }}</span>
      </button>
      
      <button class="reset" @click="resetTimer" aria-label="Reset timer">
        <span class="button-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 1 9 9 9.75 9.75 0 0 1-6.74-2.74"/>
            <path d="M3 12v-3h3"/>
          </svg>
        </span>
        <span class="button-text">Reset</span>
      </button>
      
      <!-- Skip button for breaks only -->
      <button 
        v-if="timerMode === 'shortBreak' || timerMode === 'longBreak'" 
        class="skip" 
        @click="skipBreak" 
        aria-label="Skip break">
        <span class="button-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </span>
        <span class="button-text">Skip</span>
      </button>
    </div>
    
    <button v-if="completedPomodoros > 0" 
      class="reset-all" 
      @click="resetAllTimers" 
      aria-label="Reset all timers">
      Reset All
    </button>
    
    <!-- Settings component -->
    <TimerSettings 
      :show="showSettings"
      :focus-duration="settings.focusDuration"
      :short-break-duration="settings.shortBreakDuration"
      :long-break-duration="settings.longBreakDuration"
      :pomodoros-until-long-break="settings.pomodorosUntilLongBreak"
      @save="updateSettings"
    />
  </div>
</template>

<style scoped>
/* Base timer display styling */
.timer-display {
  padding: 1.5rem;
  border-radius: 8px;
  background-color: var(--timer-bg);
  box-shadow: 0 4px 8px var(--timer-shadow);
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  transition: all 0.3s ease;
  border-top: 4px solid transparent;
}

/* Mode-specific styling */
.timer-display.mode-pomodoro {
  border-top-color: var(--pomodoro-color);
  background-color: var(--pomodoro-bg);
}

.timer-display.mode-shortBreak {
  border-top-color: var(--short-break-color);
  background-color: var(--short-break-bg);
}

.timer-display.mode-longBreak {
  border-top-color: var(--long-break-color);
  background-color: var(--long-break-bg);
}

.timer-mode {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.mode-btn {
  padding: 0.5rem;
  background: var(--color-background-soft);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.3s;
  font-size: 0.875rem;
}

.mode-btn.active {
  opacity: 1;
  font-weight: bold;
}

/* Make mode buttons match the current timer mode */
.mode-pomodoro .mode-btn.active {
  color: var(--pomodoro-color);
  border-bottom: 2px solid var(--pomodoro-color);
}

.mode-shortBreak .mode-btn.active {
  color: var(--short-break-color);
  border-bottom: 2px solid var(--short-break-color);
}

.mode-longBreak .mode-btn.active {
  color: var(--long-break-color);
  border-bottom: 2px solid var(--long-break-color);
}

.timer {
  font-size: min(5rem, 15vw);
  font-weight: bold;
  margin-bottom: 1rem;
  font-family: monospace;
  line-height: 1;
}

/* Colorize timer based on mode */
.mode-pomodoro .timer {
  color: var(--pomodoro-color);
}

.mode-shortBreak .timer {
  color: var(--short-break-color);
}

.mode-longBreak .timer {
  color: var(--long-break-color);
}

.pomodoro-count {
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  font-size: 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-icon {
  display: none;
}

.button-text {
  display: block;
}

/* Mode-specific button styling */
.mode-pomodoro button.start {
  background-color: var(--pomodoro-color);
  color: white;
}

.mode-shortBreak button.start {
  background-color: var(--short-break-color);
  color: white;
}

.mode-longBreak button.start {
  background-color: var(--long-break-color);
  color: white;
}

/* Skip button styling */
.skip {
  background-color: #9e9e9e;
  color: white;
}

.skip:hover {
  background-color: #757575;
}

.mode-shortBreak .skip {
  background-color: var(--short-break-color);
  opacity: 0.8;
}

.mode-shortBreak .skip:hover {
  opacity: 1;
}

.mode-longBreak .skip {
  background-color: var(--long-break-color);
  opacity: 0.8;
}

.mode-longBreak .skip:hover {
  opacity: 1;
}

.reset-all {
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.reset-all:hover {
  background-color: var(--color-background-hover);
}

/* Responsive design */
@media (max-width: 480px) {
  .timer-display {
    padding: 1.25rem;
  }
  
  .timer-mode {
    margin-bottom: 1rem;
  }
  
  .mode-btn {
    padding: 0.4rem;
    font-size: 0.75rem;
  }
  
  button.start, button.reset, button.skip {
    width: 3rem;
    height: 3rem;
    padding: 0.5rem;
    border-radius: 50%;
  }
  
  .button-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .button-text {
    display: none;
  }

  .timer {
    margin-bottom: 0.75rem;
  }
  
  .pomodoro-count {
    margin-bottom: 1rem;
  }
  
  .settings-button {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.4rem;
  }
  
  .settings-button svg {
    width: 18px;
    height: 18px;
  }
}

/* For very small screens */
@media (max-width: 320px) {
  .timer {
    font-size: 3.5rem;
  }
  
  button.start, button.reset, button.skip {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .button-icon svg {
    width: 20px;
    height: 20px;
  }
  
  .timer-mode {
    flex-direction: column;
    gap: 0.3rem;
  }
  
  .settings-button {
    top: 0.5rem;
    right: 0.5rem;
  }
  
  .settings-button svg {
    width: 16px;
    height: 16px;
  }
}
</style>