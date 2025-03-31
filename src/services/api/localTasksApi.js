// Local Task Storage Service
// This service manages tasks stored in local storage without requiring external integrations

// Helper to generate unique IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Default task list if none exists
const DEFAULT_LIST = {
  id: 'default',
  title: 'My Tasks'
};

// Initialize local storage with a default list if needed
const initializeLocalStorage = () => {
  if (!localStorage.getItem('mfocus_taskLists')) {
    localStorage.setItem('mfocus_taskLists', JSON.stringify([DEFAULT_LIST]));
  }
  
  if (!localStorage.getItem('mfocus_tasks')) {
    localStorage.setItem('mfocus_tasks', JSON.stringify({}));
  }
};

// Local Task API Service
export const localTasksApi = {
  // Get all task lists
  async getTaskLists() {
    initializeLocalStorage();
    return JSON.parse(localStorage.getItem('mfocus_taskLists'));
  },
  
  // Create a new task list
  async createTaskList(name) {
    initializeLocalStorage();
    const lists = JSON.parse(localStorage.getItem('mfocus_taskLists'));
    const newList = {
      id: generateId(),
      title: name
    };
    
    lists.push(newList);
    localStorage.setItem('mfocus_taskLists', JSON.stringify(lists));
    
    return newList;
  },
  
  // Get tasks from a specific list
  async getTasks(listId) {
    initializeLocalStorage();
    const allTasks = JSON.parse(localStorage.getItem('mfocus_tasks'));
    return allTasks[listId] || [];
  },
  
  // Create a new task
  async createTask(listId, task) {
    initializeLocalStorage();
    const allTasks = JSON.parse(localStorage.getItem('mfocus_tasks'));
    
    // Initialize the list if it doesn't exist
    if (!allTasks[listId]) {
      allTasks[listId] = [];
    }
    
    const newTask = {
      id: generateId(),
      title: task.title,
      status: 'notStarted',
      createdAt: new Date().toISOString(),
      ...task
    };
    
    allTasks[listId].push(newTask);
    localStorage.setItem('mfocus_tasks', JSON.stringify(allTasks));
    
    return newTask;
  },
  
  // Delete a task
  async deleteTask(listId, taskId) {
    initializeLocalStorage();
    const allTasks = JSON.parse(localStorage.getItem('mfocus_tasks'));
    
    if (allTasks[listId]) {
      allTasks[listId] = allTasks[listId].filter(task => task.id !== taskId);
      localStorage.setItem('mfocus_tasks', JSON.stringify(allTasks));
    }
    
    return true;
  },
  
  // Mark a task as completed
  async completeTask(listId, taskId) {
    initializeLocalStorage();
    const allTasks = JSON.parse(localStorage.getItem('mfocus_tasks'));
    
    if (allTasks[listId]) {
      const taskIndex = allTasks[listId].findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        allTasks[listId][taskIndex].status = 'completed';
        allTasks[listId][taskIndex].completedAt = new Date().toISOString();
        localStorage.setItem('mfocus_tasks', JSON.stringify(allTasks));
      }
    }
    
    return true;
  },
  
  // Start a task (mark as in progress)
  async startTask(listId, taskId) {
    initializeLocalStorage();
    const allTasks = JSON.parse(localStorage.getItem('mfocus_tasks'));
    
    if (allTasks[listId]) {
      const taskIndex = allTasks[listId].findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        allTasks[listId][taskIndex].status = 'inProgress';
        localStorage.setItem('mfocus_tasks', JSON.stringify(allTasks));
      }
    }
    
    return true;
  },
  
  // Update a task
  async updateTask(listId, taskId, updates) {
    initializeLocalStorage();
    const allTasks = JSON.parse(localStorage.getItem('mfocus_tasks'));
    
    if (allTasks[listId]) {
      const taskIndex = allTasks[listId].findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        allTasks[listId][taskIndex] = {
          ...allTasks[listId][taskIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('mfocus_tasks', JSON.stringify(allTasks));
        return allTasks[listId][taskIndex];
      }
    }
    
    throw new Error('Task not found');
  }
};

export default localTasksApi;