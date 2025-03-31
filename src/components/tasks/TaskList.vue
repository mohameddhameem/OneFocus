<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import microsoftTodoApi from '../../services/api/microsoftTodoApi';
import googleTasksApi from '../../services/api/googleTasksApi';
import localTasksApi from '../../services/api/localTasksApi';
import TaskItem from './TaskItem.vue';

// Props
const props = defineProps({
  integration: {
    type: String,
    required: false,
    default: 'local', // Use local storage by default
    validator: (value) => ['microsoft', 'google', 'local'].includes(value)
  }
});

// Emit events
const emit = defineEmits(['start-task', 'integration-changed']);

// State
const taskLists = ref([]);
const selectedListId = ref(null);
const tasks = ref([]);
const isLoading = ref(false);
const error = ref(null);
const newTaskTitle = ref('');
const newTaskPomoCount = ref(1); // New state for pomodoro count

// Compute the active API based on the selected integration
const activeApi = computed(() => {
  switch(props.integration) {
    case 'microsoft': return microsoftTodoApi;
    case 'google': return googleTasksApi;
    default: return localTasksApi;
  }
});

// Reset state when changing integrations - define BEFORE the watchers that use it
const resetState = () => {
  taskLists.value = [];
  selectedListId.value = null;
  tasks.value = [];
  error.value = null;
};

// Fetch task lists from the selected integration
const fetchTaskLists = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // Make sure activeApi.value is defined before calling its methods
    if (!activeApi.value) {
      console.log('Active API is undefined, defaulting to local storage');
      // Silently switch to local storage without showing an error to the user
      emit('integration-changed', 'local');
      return;
    }

    taskLists.value = await activeApi.value.getTaskLists();
    
    // Add a null check before accessing length
    if (taskLists.value && taskLists.value.length > 0) {
      selectedListId.value = taskLists.value[0].id;
    }
  } catch (err) {
    // Log errors to console but don't show them to users if related to external integrations
    console.log('Error fetching task lists:', err);
    
    // Only set error value for local storage errors or other critical errors
    // that aren't related to integration availability
    if (props.integration === 'local') {
      error.value = `Error fetching task lists: ${err.message}`;
    } else {
      // For Microsoft/Google integration errors, silently switch to local storage
      console.log('Integration error, falling back to local storage');
      emit('integration-changed', 'local');
    }
  } finally {
    isLoading.value = false;
  }
};

// Fetch tasks from the selected task list
const fetchTasks = async (listId) => {
  if (!listId) return;
  
  isLoading.value = true;
  error.value = null;
  
  try {
    // Make sure activeApi.value is defined before calling its methods
    if (!activeApi.value) {
      console.log('Active API is undefined, defaulting to local storage');
      // Silently switch to local storage without showing an error to the user
      emit('integration-changed', 'local');
      return;
    }

    tasks.value = await activeApi.value.getTasks(listId);
  } catch (err) {
    // Log errors to console but don't show them to users if related to external integrations
    console.log(`Error fetching tasks from list ${listId}:`, err);
    
    // Only set error value for local storage errors or other critical errors
    if (props.integration === 'local') {
      error.value = `Error fetching tasks: ${err.message}`;
    } else {
      // For Microsoft/Google integration errors, silently switch to local storage
      console.log('Integration error, falling back to local storage');
      emit('integration-changed', 'local');
    }
  } finally {
    isLoading.value = false;
  }
};

// Watch for integration changes and fetch task lists - AFTER resetState and fetchTaskLists are defined
watch(() => props.integration, async () => {
  resetState();
  await fetchTaskLists();
}, { immediate: true });

// Watch for selected list changes and fetch tasks
watch(selectedListId, async (newListId) => {
  if (newListId) {
    await fetchTasks(newListId);
  } else {
    tasks.value = [];
  }
});

// Add a new task
const addTask = async () => {
  const title = newTaskTitle.value.trim();
  const pomoCount = parseInt(newTaskPomoCount.value);

  if (!title || !selectedListId.value || isNaN(pomoCount) || pomoCount < 1) {
    error.value = 'Please provide a valid task title and pomodoro count';
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    if (!activeApi.value) {
      console.error('Active API is undefined');
      emit('integration-changed', 'local');
      return;
    }

    const newTask = await activeApi.value.createTask(selectedListId.value, {
      title,
      pomoCount,
      remainingPomos: pomoCount,
      completedPomos: 0
    });
    
    tasks.value = [...tasks.value, newTask];
    newTaskTitle.value = '';
    newTaskPomoCount.value = 1; // Reset to default
    
  } catch (err) {
    console.error('Error adding task:', err);
    error.value = `Error adding task: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
};

// Create a new task list
const createNewList = async () => {
  const listName = prompt('Enter a name for the new list');
  if (!listName || !listName.trim()) {
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    const newList = await activeApi.value.createTaskList(listName.trim());
    taskLists.value.push(newList);
    selectedListId.value = newList.id;
  } catch (err) {
    console.error('Error creating task list:', err);
    error.value = `Error creating task list: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
};

// Delete a task
const deleteTask = async (taskId) => {
  if (!selectedListId.value || !taskId) {
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    await activeApi.value.deleteTask(selectedListId.value, taskId);
    
    // Remove the task from the list
    tasks.value = tasks.value.filter(task => task.id !== taskId);
  } catch (err) {
    console.error(`Error deleting task ${taskId}:`, err);
    error.value = `Error deleting task: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
};

// Complete a task
const completeTask = async (taskId) => {
  if (!selectedListId.value || !taskId) {
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    if (!activeApi.value) {
      console.error('Active API is undefined');
      emit('integration-changed', 'local');
      return;
    }

    const task = tasks.value.find(t => t.id === taskId);
    if (!task) {
      // Instead of throwing an error that's caught locally, set the error and return
      error.value = 'Task not found';
      isLoading.value = false;
      return;
    }
    
    if (task.pomoCount && task.completedPomos < task.pomoCount) {
      // Show warning if not all pomodoros are completed
      error.value = `This task has ${task.pomoCount - task.completedPomos} pomodoros remaining.`;
      isLoading.value = false;
      return;
    }

    await activeApi.value.completeTask(selectedListId.value, taskId);
    
    // Update the task in the list
    const taskIndex = tasks.value.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks.value[taskIndex].status = 'completed';
    }

    // Refresh the task list
    await fetchTasks(selectedListId.value);
  } catch (err) {
    console.error(`Error completing task ${taskId}:`, err);
    error.value = `Error completing task: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
};

// Start a task and emit event to parent
const startTask = async (task) => {
  if (!selectedListId.value || !task.id) {
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    // Check if the task has remaining pomos
    if (task.pomoCount && task.completedPomos >= task.pomoCount) {
      error.value = 'All pomodoros completed for this task. Mark it as done!';
      return;
    }

    await activeApi.value.startTask(selectedListId.value, task.id);
    
    // Update the task in the list
    const taskIndex = tasks.value.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
      tasks.value[taskIndex].status = 'inProgress';
    }
    
    // Emit event to parent component to start the timer
    emit('start-task', task);

    // Refresh the task list
    await fetchTasks(selectedListId.value);
  } catch (err) {
    console.error(`Error starting task ${task.id}:`, err);
    error.value = `Error starting task: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
};

// Handle pomodoro completion for a task
const handlePomodoroComplete = async (task) => {
  if (!selectedListId.value || !task?.id) {
    console.error('Invalid task or list ID');
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    if (!activeApi.value) {
      console.error('Active API is undefined');
      emit('integration-changed', 'local');
      return;
    }

    const taskIndex = tasks.value.findIndex(t => t.id === task.id);
    if (taskIndex === -1) {
      // Instead of throwing an error that's caught locally, set the error and return
      error.value = 'Task not found';
      isLoading.value = false;
      return;
    }

    const updatedTask = { ...tasks.value[taskIndex] };
    updatedTask.completedPomos = (updatedTask.completedPomos || 0) + 1;
    updatedTask.remainingPomos = Math.max(0, updatedTask.pomoCount - updatedTask.completedPomos);
    
    await activeApi.value.updateTask(selectedListId.value, task.id, {
      completedPomos: updatedTask.completedPomos,
      remainingPomos: updatedTask.remainingPomos
    });

    // Update the task in the reactive array properly
    tasks.value[taskIndex] = updatedTask;

    if (updatedTask.completedPomos >= updatedTask.pomoCount) {
      error.value = 'All pomodoros completed! You can mark this task as done.';
    }
  } catch (err) {
    console.error(`Error updating pomodoro count for task ${task.id}:`, err);
    error.value = `Failed to update task: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
};

// Add defineExpose to make handlePomodoroComplete available to parent
defineExpose({ handlePomodoroComplete });

// Refresh tasks
const refreshTasks = async () => {
  if (selectedListId.value) {
    await fetchTasks(selectedListId.value);
  }
};

// Initialize when component is mounted
onMounted(async () => {
  await fetchTaskLists();
});
</script>

<template>
  <div class="task-list-container">
    <div v-if="isLoading && !tasks.length" class="loader">
      <div class="spinner"></div>
      <span>Loading...</span>
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
      <button @click="fetchTaskLists" class="retry-btn">Retry</button>
    </div>
    
    <div v-else class="task-manager">
      <!-- Task list selector -->
      <div class="task-list-header">
        <div class="task-list-selector">
          <label for="task-list-select">Task List:</label>
          <select 
            id="task-list-select" 
            v-model="selectedListId"
            :disabled="isLoading || !taskLists.length">
            <option v-for="list in taskLists" :key="list.id" :value="list.id">
              {{ list.displayName || list.title }}
            </option>
          </select>
          
          <button @click="refreshTasks" class="refresh-btn" :disabled="isLoading">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
              <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
        </div>
        
        <button v-if="integration === 'local'" @click="createNewList" class="new-list-btn" :disabled="isLoading">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New List
        </button>
      </div>
      
      <!-- Add new task form -->
      <form @submit.prevent="addTask" class="add-task-form">
        <div class="task-inputs">
          <input 
            type="text" 
            v-model="newTaskTitle" 
            placeholder="Add a new task..." 
            :disabled="isLoading || !selectedListId"
            class="task-title-input"
          />
          <div class="pomo-count-input">
            <label for="pomo-count">Pomos:</label>
            <input 
              type="number" 
              id="pomo-count"
              v-model.number="newTaskPomoCount"
              min="1"
              max="10"
              :disabled="isLoading || !selectedListId"
            />
          </div>
        </div>
        <button type="submit" :disabled="isLoading || !newTaskTitle.trim() || !selectedListId">
          Add
        </button>
      </form>
      
      <!-- Task list -->
      <div class="tasks-wrapper" v-if="selectedListId">
        <div v-if="!tasks.length && !isLoading" class="no-tasks">
          No tasks found. Add a task to get started.
        </div>
        
        <ul v-else class="tasks">
          <TaskItem 
            v-for="task in tasks" 
            :key="task.id"
            :task="task"
            :integration="integration"
            @delete="deleteTask"
            @complete="completeTask"
            @start="startTask"
          />
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --color-text-light: #888;
  --color-text: #333;
  --color-border: #ddd;
  --color-background: #fff;
  --color-background-hover: #f5f5f5;
  --color-background-soft: #f9f9f9;
}

.task-list-container {
  margin-top: 1.5rem;
}

.loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
}

.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 3px solid var(--color-text);
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  margin: 1rem 0;
  padding: 0.75rem;
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.retry-btn {
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}

.task-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.task-list-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task-list-selector label {
  font-weight: bold;
}

.task-list-selector select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
  color: var(--color-text);
  min-width: 150px;
}

.refresh-btn, .new-list-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.new-list-btn {
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
}

.refresh-btn:hover, .new-list-btn:hover {
  background-color: var(--color-background-hover);
}

.add-task-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.task-inputs {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.task-title-input {
  flex-grow: 1;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
  color: var(--color-text);
}

.pomo-count-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
}

.pomo-count-input label {
  font-size: 0.9rem;
  color: var(--color-text-light);
}

.pomo-count-input input {
  width: 60px;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
  color: var(--color-text);
  text-align: center;
}

.add-task-form button {
  padding: 0.75rem 1rem;
  background-color: var(--color-text);
  color: var(--color-background);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-task-form button:hover {
  opacity: 0.9;
}

.add-task-form button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.tasks-wrapper {
  margin-top: 1rem;
}

.no-tasks {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-light);
  background-color: var(--color-background-soft);
  border-radius: 4px;
}

.tasks {
  list-style: none;
  padding: 0;
  margin: 0;
}

@media (max-width: 480px) {
  .task-list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .task-list-selector {
    width: 100%;
  }
  
  .task-list-selector select {
    flex-grow: 1;
  }
  
  .new-list-btn {
    width: 100%;
    justify-content: center;
  }
  
  .add-task-form {
    flex-direction: column;
  }
  
  .task-inputs {
    flex-direction: column;
  }
  
  .pomo-count-input {
    width: 100%;
  }
  
  .pomo-count-input input {
    flex: 1;
  }
  
  .add-task-form button {
    width: 100%;
  }
}
</style>
