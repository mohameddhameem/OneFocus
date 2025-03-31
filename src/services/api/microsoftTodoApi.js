// Microsoft Todo API Service
import { Client } from '@microsoft/microsoft-graph-client';
import { microsoftAuthService } from '../auth/microsoftAuth';

// Create a Microsoft Graph client factory
const getGraphClient = async () => {
  // Get access token
  const token = await microsoftAuthService.getAccessToken();
  
  // Initialize the Graph client
  const graphClient = Client.init({
    authProvider: (done) => {
      done(null, token);
    },
  });
  
  return graphClient;
};

// Microsoft Todo API Service
export const microsoftTodoApi = {
  // Get all task lists
  async getTaskLists() {
    try {
      const client = await getGraphClient();
      const response = await client
        .api('/me/todo/lists')
        .get();
      
      return response.value || [];
    } catch (error) {
      console.error('Error getting task lists:', error);
      throw error;
    }
  },
  
  // Get a specific task list
  async getTaskList(listId) {
    try {
      const client = await getGraphClient();
      const response = await client
        .api(`/me/todo/lists/${listId}`)
        .get();
      
      return response;
    } catch (error) {
      console.error(`Error getting task list ${listId}:`, error);
      throw error;
    }
  },
  
  // Create a new task list
  async createTaskList(name) {
    try {
      const client = await getGraphClient();
      const response = await client
        .api('/me/todo/lists')
        .post({
          displayName: name
        });
      
      return response;
    } catch (error) {
      console.error('Error creating task list:', error);
      throw error;
    }
  },
  
  // Get tasks from a specific list
  async getTasks(listId) {
    try {
      const client = await getGraphClient();
      const response = await client
        .api(`/me/todo/lists/${listId}/tasks`)
        .get();
      
      return response.value || [];
    } catch (error) {
      console.error(`Error getting tasks from list ${listId}:`, error);
      throw error;
    }
  },
  
  // Create a new task
  async createTask(listId, task) {
    try {
      const client = await getGraphClient();
      const response = await client
        .api(`/me/todo/lists/${listId}/tasks`)
        .post({
          title: task.title,
          importance: task.importance || 'normal',
          status: 'notStarted',
          body: {
            content: task.notes || '',
            contentType: 'text'
          },
          dueDateTime: task.dueDate ? {
            dateTime: new Date(task.dueDate).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          } : null
        });
      
      return response;
    } catch (error) {
      console.error(`Error creating task in list ${listId}:`, error);
      throw error;
    }
  },
  
  // Update a task
  async updateTask(listId, taskId, updates) {
    try {
      const client = await getGraphClient();
      const response = await client
        .api(`/me/todo/lists/${listId}/tasks/${taskId}`)
        .patch(updates);
      
      return response;
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  },
  
  // Delete a task
  async deleteTask(listId, taskId) {
    try {
      const client = await getGraphClient();
      await client
        .api(`/me/todo/lists/${listId}/tasks/${taskId}`)
        .delete();
      
      return true;
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  },
  
  // Mark a task as completed
  async completeTask(listId, taskId) {
    try {
      // No need to declare client here since we're using this.updateTask
      await this.updateTask(listId, taskId, {
        status: 'completed',
        completedDateTime: {
          dateTime: new Date().toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
      
      return true;
    } catch (error) {
      console.error(`Error completing task ${taskId}:`, error);
      throw error;
    }
  },
  
  // Start a task (mark as in progress)
  async startTask(listId, taskId) {
    try {
      // No need to declare client here since we're using this.updateTask
      await this.updateTask(listId, taskId, {
        status: 'inProgress'
      });
      
      return true;
    } catch (error) {
      console.error(`Error starting task ${taskId}:`, error);
      throw error;
    }
  }
};

export default microsoftTodoApi;