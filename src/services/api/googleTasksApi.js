// Google Tasks API Service
import { gapi } from 'gapi-script';
import { googleAuthService } from '../auth/googleAuth';

// Google Tasks API Service
export const googleTasksApi = {
  // Get all task lists
  async getTaskLists() {
    try {
      await googleAuthService.initialize();
      const response = await gapi.client.tasks.tasklists.list();
      return response.result.items || [];
    } catch (error) {
      console.error('Error getting task lists:', error);
      throw error;
    }
  },
  
  // Get a specific task list
  async getTaskList(listId) {
    try {
      await googleAuthService.initialize();
      const response = await gapi.client.tasks.tasklists.get({
        tasklist: listId
      });
      return response.result;
    } catch (error) {
      console.error(`Error getting task list ${listId}:`, error);
      throw error;
    }
  },
  
  // Create a new task list
  async createTaskList(title) {
    try {
      await googleAuthService.initialize();
      const response = await gapi.client.tasks.tasklists.insert({
        resource: { title }
      });
      return response.result;
    } catch (error) {
      console.error('Error creating task list:', error);
      throw error;
    }
  },
  
  // Get tasks from a specific list
  async getTasks(listId) {
    try {
      await googleAuthService.initialize();
      const response = await gapi.client.tasks.tasks.list({
        tasklist: listId,
        showCompleted: true
      });
      return response.result.items || [];
    } catch (error) {
      console.error(`Error getting tasks from list ${listId}:`, error);
      throw error;
    }
  },
  
  // Create a new task
  async createTask(listId, task) {
    try {
      await googleAuthService.initialize();
      const resource = {
        title: task.title,
        notes: task.notes || '',
        due: task.dueDate ? new Date(task.dueDate).toISOString() : undefined
      };
      
      const response = await gapi.client.tasks.tasks.insert({
        tasklist: listId,
        resource
      });
      
      return response.result;
    } catch (error) {
      console.error(`Error creating task in list ${listId}:`, error);
      throw error;
    }
  },
  
  // Update a task
  async updateTask(listId, taskId, updates) {
    try {
      await googleAuthService.initialize();
      
      // First get the current task to merge with updates
      const currentTask = await this.getTask(listId, taskId);
      const updatedTask = { ...currentTask, ...updates };
      
      const response = await gapi.client.tasks.tasks.update({
        tasklist: listId,
        task: taskId,
        resource: updatedTask
      });
      
      return response.result;
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  },
  
  // Get a specific task
  async getTask(listId, taskId) {
    try {
      await googleAuthService.initialize();
      const response = await gapi.client.tasks.tasks.get({
        tasklist: listId,
        task: taskId
      });
      
      return response.result;
    } catch (error) {
      console.error(`Error getting task ${taskId}:`, error);
      throw error;
    }
  },
  
  // Delete a task
  async deleteTask(listId, taskId) {
    try {
      await googleAuthService.initialize();
      await gapi.client.tasks.tasks.delete({
        tasklist: listId,
        task: taskId
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  },
  
  // Mark a task as completed
  async completeTask(listId, taskId) {
    try {
      await googleAuthService.initialize();
      const task = await this.getTask(listId, taskId);
      
      task.status = 'completed';
      task.completed = new Date().toISOString();
      
      await gapi.client.tasks.tasks.update({
        tasklist: listId,
        task: taskId,
        resource: task
      });
      
      return true;
    } catch (error) {
      console.error(`Error completing task ${taskId}:`, error);
      throw error;
    }
  },
  
  // Start a task (Google Tasks doesn't have an "in progress" status, but we can update notes)
  async startTask(listId, taskId) {
    try {
      await googleAuthService.initialize();
      const task = await this.getTask(listId, taskId);
      
      // We'll append a note indicating the task is in progress
      const startDate = new Date().toLocaleString();
      const progressNote = `Started: ${startDate}`;
      
      task.notes = task.notes 
        ? `${task.notes}\n${progressNote}`
        : progressNote;
      
      await gapi.client.tasks.tasks.update({
        tasklist: listId,
        task: taskId,
        resource: task
      });
      
      return true;
    } catch (error) {
      console.error(`Error starting task ${taskId}:`, error);
      throw error;
    }
  }
};

export default googleTasksApi;