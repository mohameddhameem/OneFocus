<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  integration: {
    type: String,
    required: true,
    validator: (value) => ['microsoft', 'google', 'local'].includes(value)
  }
});

// Emit events to parent
const emit = defineEmits(['complete', 'delete', 'start']);

// Determine if the task is completed based on its status
const isCompleted = computed(() => {
  if (props.integration === 'microsoft') {
    return props.task.status === 'completed';
  } else {
    return props.task.status === 'completed';
  }
});

// Determine if the task is in progress (Microsoft only, Google doesn't have this status)
const isInProgress = computed(() => {
  if (props.integration === 'microsoft') {
    return props.task.status === 'inProgress';
  } else {
    // For Google Tasks we can check if the notes contain "Started: " text
    return props.task.notes && props.task.notes.includes('Started:');
  }
});

// Format the task's due date if it exists
const formattedDueDate = computed(() => {
  if (props.integration === 'microsoft') {
    if (props.task.dueDateTime) {
      const date = new Date(props.task.dueDateTime.dateTime);
      return date.toLocaleDateString();
    }
  } else {
    if (props.task.due) {
      const date = new Date(props.task.due);
      return date.toLocaleDateString();
    }
  }
  return null;
});

// Get the task title
const taskTitle = computed(() => {
  return props.task.title;
});

// Handle starting a task
const handleStart = () => {
  emit('start', props.task);
};

// Handle completing a task
const handleComplete = () => {
  emit('complete', props.task.id);
};

// Handle deleting a task
const handleDelete = () => {
  emit('delete', props.task.id);
};
</script>

<template>
  <li class="task-item" :class="{ 'completed': isCompleted, 'in-progress': isInProgress }">
    <div class="task-content">
      <div class="task-status">
        <button 
          v-if="!isCompleted" 
          @click="handleComplete" 
          class="complete-btn"
          title="Mark as completed">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </button>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
          class="completed-icon">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      
      <div class="task-details">
        <div class="task-title" :class="{ 'completed-title': isCompleted }">
          {{ taskTitle }}
        </div>
        
        <div class="task-info">
          <div v-if="task.pomoCount" class="pomo-progress">
            <span class="pomo-count">
              {{ task.completedPomos || 0 }}/{{ task.pomoCount }} pomos
            </span>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: ((task.completedPomos || 0) / task.pomoCount * 100) + '%' }"
              ></div>
            </div>
          </div>
          <div v-if="formattedDueDate" class="task-due-date">
            Due: {{ formattedDueDate }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="task-actions">
      <button
        v-if="!isCompleted && !isInProgress"
        @click="handleStart"
        class="start-btn"
        title="Start working on this task">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <span class="action-text">Start</span>
      </button>
      
      <button
        v-if="isInProgress"
        class="in-progress-indicator"
        disabled
        title="Task in progress">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span class="action-text">In Progress</span>
      </button>
      
      <button
        @click="handleDelete"
        class="delete-btn"
        title="Delete task">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        <span class="action-text">Delete</span>
      </button>
    </div>
  </li>
</template>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.3s;
}

.task-item:hover {
  background-color: var(--color-background-soft);
}

.task-item.completed {
  opacity: 0.7;
}

.task-item.in-progress {
  background-color: rgba(33, 150, 243, 0.1);
}

.task-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.task-status {
  display: flex;
  align-items: center;
  justify-content: center;
}

.complete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  color: var(--color-text);
  opacity: 0.7;
}

.complete-btn:hover {
  opacity: 1;
}

.completed-icon {
  color: #4caf50;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.task-title {
  font-weight: 500;
  word-break: break-word;
}

.completed-title {
  text-decoration: line-through;
  color: var(--color-text-light);
}

.task-due-date {
  font-size: 0.8rem;
  color: var(--color-text-light);
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.task-actions button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.task-actions button:hover {
  background-color: var(--color-background-hover);
}

.start-btn {
  color: #2196f3;
}

.in-progress-indicator {
  color: #ff9800;
  cursor: default !important;
}

.in-progress-indicator:hover {
  background-color: transparent !important;
}

.delete-btn {
  color: #f44336;
}

.action-text {
  display: none;
}

@media (min-width: 640px) {
  .action-text {
    display: inline;
  }
  
  .task-actions button {
    padding: 0.4rem 0.6rem;
  }
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--color-text-light);
}

.pomo-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pomo-count {
  white-space: nowrap;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background-color: var(--color-background-soft);
  border-radius: 2px;
  overflow: hidden;
  min-width: 50px;
  max-width: 100px;
}

.progress-fill {
  height: 100%;
  background-color: var(--pomodoro-color, #ff5722);
  border-radius: 2px;
  transition: width 0.3s ease;
}
</style>