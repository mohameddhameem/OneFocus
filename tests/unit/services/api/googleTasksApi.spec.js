import googleTasksApi from '../../../../src/services/api/googleTasksApi';
import { googleAuthService } from '../../../../src/services/auth/googleAuth';
import { GoogleTasksApi } from '@/services/api/googleTasksApi';
import { google } from 'googleapis';

jest.mock('googleapis');

// Mock the auth service
jest.mock('../../../../src/services/auth/googleAuth', () => ({
  googleAuthService: {
    getGapiClient: jest.fn().mockResolvedValue({
      tasks: {
        tasklists: {
          list: jest.fn(),
          get: jest.fn()
        },
        tasks: {
          list: jest.fn(),
          insert: jest.fn(),
          update: jest.fn(),
          delete: jest.fn()
        }
      }
    })
  }
}), { virtual: true });

describe('googleTasksApi (legacy version)', () => {
  let mockGapi;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockGapi = (await googleAuthService.getGapiClient()).tasks;
  });

  describe('getTaskLists', () => {
    it('returns task lists successfully', async () => {
      const mockLists = {
        items: [
          { id: '1', title: 'List 1' },
          { id: '2', title: 'List 2' }
        ]
      };

      mockGapi.tasklists.list.mockResolvedValueOnce({ result: mockLists });

      const result = await googleTasksApi.getTaskLists();
      expect(result).toEqual(mockLists.items);
      expect(mockGapi.tasklists.list).toHaveBeenCalled();
    });

    it('handles errors appropriately', async () => {
      mockGapi.tasklists.list.mockRejectedValueOnce(new Error('API Error'));

      await expect(googleTasksApi.getTaskLists()).rejects.toThrow('API Error');
    });
  });

  describe('getTasks', () => {
    const listId = 'test-list-id';

    it('returns tasks from a list successfully', async () => {
      const mockTasks = {
        items: [
          { id: '1', title: 'Task 1', status: 'needsAction' },
          { id: '2', title: 'Task 2', status: 'completed' }
        ]
      };

      mockGapi.tasks.list.mockResolvedValueOnce({ result: mockTasks });

      const result = await googleTasksApi.getTasks(listId);
      expect(result).toEqual(mockTasks.items);
      expect(mockGapi.tasks.list).toHaveBeenCalledWith({ tasklist: listId });
    });

    it('handles errors appropriately', async () => {
      mockGapi.tasks.list.mockRejectedValueOnce(new Error('API Error'));

      await expect(googleTasksApi.getTasks(listId)).rejects.toThrow('API Error');
    });
  });

  describe('createTask', () => {
    const listId = 'test-list-id';
    const task = {
      title: 'New Task',
      notes: 'Task notes',
      due: '2025-03-24T00:00:00.000Z'
    };

    it('creates a task successfully', async () => {
      const mockResponse = { ...task, id: 'new-task-id' };
      mockGapi.tasks.insert.mockResolvedValueOnce({ result: mockResponse });

      const result = await googleTasksApi.createTask(listId, task);
      expect(result).toEqual(mockResponse);
      expect(mockGapi.tasks.insert).toHaveBeenCalledWith({
        tasklist: listId,
        resource: expect.objectContaining({
          title: task.title,
          notes: task.notes
        })
      });
    });

    it('handles errors appropriately', async () => {
      mockGapi.tasks.insert.mockRejectedValueOnce(new Error('API Error'));

      await expect(googleTasksApi.createTask(listId, task)).rejects.toThrow('API Error');
    });
  });

  describe('completeTask', () => {
    const listId = 'test-list-id';
    const taskId = 'test-task-id';

    it('marks a task as completed successfully', async () => {
      mockGapi.tasks.update.mockResolvedValueOnce({
        result: { id: taskId, status: 'completed' }
      });

      const result = await googleTasksApi.completeTask(listId, taskId);
      expect(result).toBe(true);
      expect(mockGapi.tasks.update).toHaveBeenCalledWith({
        tasklist: listId,
        task: taskId,
        resource: expect.objectContaining({
          status: 'completed'
        })
      });
    });

    it('handles errors appropriately', async () => {
      mockGapi.tasks.update.mockRejectedValueOnce(new Error('API Error'));

      await expect(googleTasksApi.completeTask(listId, taskId)).rejects.toThrow('API Error');
    });
  });

  describe('startTask', () => {
    const listId = 'test-list-id';
    const taskId = 'test-task-id';

    it('marks a task as active successfully', async () => {
      mockGapi.tasks.update.mockResolvedValueOnce({
        result: { id: taskId, status: 'needsAction' }
      });

      const result = await googleTasksApi.startTask(listId, taskId);
      expect(result).toBe(true);
      expect(mockGapi.tasks.update).toHaveBeenCalledWith({
        tasklist: listId,
        task: taskId,
        resource: expect.objectContaining({
          status: 'needsAction'
        })
      });
    });

    it('handles errors appropriately', async () => {
      mockGapi.tasks.update.mockRejectedValueOnce(new Error('API Error'));

      await expect(googleTasksApi.startTask(listId, taskId)).rejects.toThrow('API Error');
    });
  });

  describe('deleteTask', () => {
    const listId = 'test-list-id';
    const taskId = 'test-task-id';

    it('deletes a task successfully', async () => {
      mockGapi.tasks.delete.mockResolvedValueOnce({});

      const result = await googleTasksApi.deleteTask(listId, taskId);
      expect(result).toBe(true);
      expect(mockGapi.tasks.delete).toHaveBeenCalledWith({
        tasklist: listId,
        task: taskId
      });
    });

    it('handles errors appropriately', async () => {
      mockGapi.tasks.delete.mockRejectedValueOnce(new Error('API Error'));

      await expect(googleTasksApi.deleteTask(listId, taskId)).rejects.toThrow('API Error');
    });
  });
});

describe('GoogleTasksApi - gapi client', () => {
  let api;
  let mockGapiClient;

  beforeEach(() => {
    // Mock the gapi.client.tasks object
    mockGapiClient = {
      tasks: {
        tasklists: {
          list: jest.fn(),
        },
        tasks: {
          list: jest.fn(),
          insert: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      },
    };

    global.gapi = mockGapiClient;
    api = new GoogleTasksApi();
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete global.gapi;
  });

  describe('getTaskLists', () => {
    it('retrieves task lists successfully', async () => {
      const mockResponse = {
        result: {
          items: [
            { id: '1', title: 'List 1' },
            { id: '2', title: 'List 2' },
          ],
        },
      };

      mockGapiClient.tasks.tasklists.list.mockResolvedValue(mockResponse);

      const lists = await api.getTaskLists();

      expect(mockGapiClient.tasks.tasklists.list).toHaveBeenCalled();
      expect(lists).toHaveLength(2);
      expect(lists[0]).toEqual(expect.objectContaining({
        id: '1',
        title: 'List 1',
      }));
    });

    it('handles empty response', async () => {
      mockGapiClient.tasks.tasklists.list.mockResolvedValue({ result: {} });

      const lists = await api.getTaskLists();

      expect(lists).toEqual([]);
    });

    it('handles API errors', async () => {
      mockGapiClient.tasks.tasklists.list.mockRejectedValue(new Error('API Error'));

      await expect(api.getTaskLists()).rejects.toThrow('Failed to fetch task lists');
    });
  });

  describe('getTasks', () => {
    const listId = 'test-list-id';

    it('retrieves tasks successfully', async () => {
      const mockResponse = {
        result: {
          items: [
            { id: '1', title: 'Task 1', status: 'needsAction' },
            { id: '2', title: 'Task 2', status: 'completed' },
          ],
        },
      };

      mockGapiClient.tasks.tasks.list.mockResolvedValue(mockResponse);

      const tasks = await api.getTasks(listId);

      expect(mockGapiClient.tasks.tasks.list).toHaveBeenCalledWith({
        tasklist: listId,
      });
      expect(tasks).toHaveLength(2);
      expect(tasks[0].completed).toBe(false);
      expect(tasks[1].completed).toBe(true);
    });

    it('handles empty task list', async () => {
      mockGapiClient.tasks.tasks.list.mockResolvedValue({ result: {} });

      const tasks = await api.getTasks(listId);

      expect(tasks).toEqual([]);
    });

    it('handles API errors', async () => {
      mockGapiClient.tasks.tasks.list.mockRejectedValue(new Error('API Error'));

      await expect(api.getTasks(listId)).rejects.toThrow('Failed to fetch tasks');
    });
  });

  describe('addTask', () => {
    const listId = 'test-list-id';
    const newTask = { title: 'New Task' };

    it('creates a task successfully', async () => {
      const mockResponse = {
        result: {
          id: '3',
          title: 'New Task',
          status: 'needsAction',
        },
      };

      mockGapiClient.tasks.tasks.insert.mockResolvedValue(mockResponse);

      const task = await api.addTask(listId, newTask);

      expect(mockGapiClient.tasks.tasks.insert).toHaveBeenCalledWith({
        tasklist: listId,
        resource: expect.any(Object),
      });
      expect(task).toEqual(expect.objectContaining({
        id: '3',
        title: 'New Task',
        completed: false,
      }));
    });

    it('handles API errors', async () => {
      mockGapiClient.tasks.tasks.insert.mockRejectedValue(new Error('API Error'));

      await expect(api.addTask(listId, newTask)).rejects.toThrow('Failed to create task');
    });
  });

  describe('updateTask', () => {
    const listId = 'test-list-id';
    const taskUpdate = { id: '1', title: 'Updated Task', completed: true };

    it('updates a task successfully', async () => {
      const mockResponse = {
        result: {
          id: '1',
          title: 'Updated Task',
          status: 'completed',
        },
      };

      mockGapiClient.tasks.tasks.update.mockResolvedValue(mockResponse);

      const task = await api.updateTask(listId, taskUpdate);

      expect(mockGapiClient.tasks.tasks.update).toHaveBeenCalledWith({
        tasklist: listId,
        task: '1',
        resource: expect.any(Object),
      });
      expect(task).toEqual(expect.objectContaining({
        id: '1',
        title: 'Updated Task',
        completed: true,
      }));
    });

    it('handles API errors', async () => {
      mockGapiClient.tasks.tasks.update.mockRejectedValue(new Error('API Error'));

      await expect(api.updateTask(listId, taskUpdate)).rejects.toThrow('Failed to update task');
    });
  });

  describe('deleteTask', () => {
    const listId = 'test-list-id';
    const taskId = 'test-task-id';

    it('deletes a task successfully', async () => {
      mockGapiClient.tasks.tasks.delete.mockResolvedValue({});

      await api.deleteTask(listId, taskId);

      expect(mockGapiClient.tasks.tasks.delete).toHaveBeenCalledWith({
        tasklist: listId,
        task: taskId,
      });
    });

    it('handles API errors', async () => {
      mockGapiClient.tasks.tasks.delete.mockRejectedValue(new Error('API Error'));

      await expect(api.deleteTask(listId, taskId)).rejects.toThrow('Failed to delete task');
    });
  });
});

describe('GoogleTasksApi - google tasks methods', () => {
  let api;
  let mockTasks;

  beforeEach(() => {
    mockTasks = {
      list: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    google.tasks = jest.fn().mockReturnValue({
      tasks: mockTasks
    });

    api = new GoogleTasksApi('mock-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('fetches tasks from Google Tasks API', async () => {
      const mockResponse = {
        data: {
          items: [
            { id: '1', title: 'Task 1', status: 'needsAction' },
            { id: '2', title: 'Task 2', status: 'completed' }
          ]
        }
      };

      mockTasks.list.mockResolvedValueOnce(mockResponse);

      const tasks = await api.getTasks();

      expect(mockTasks.list).toHaveBeenCalledWith({
        tasklist: '@default',
        showCompleted: true
      });
      expect(tasks).toEqual(mockResponse.data.items);
    });

    it('handles empty task list', async () => {
      const mockResponse = {
        data: {}
      };

      mockTasks.list.mockResolvedValueOnce(mockResponse);

      const tasks = await api.getTasks();

      expect(tasks).toEqual([]);
    });

    it('handles API errors gracefully', async () => {
      mockTasks.list.mockRejectedValueOnce(new Error('API Error'));

      await expect(api.getTasks()).rejects.toThrow('Failed to fetch tasks');
    });
  });

  describe('createTask', () => {
    it('creates a new task', async () => {
      const newTask = { title: 'New Task' };
      const mockResponse = {
        data: { id: '3', title: 'New Task', status: 'needsAction' }
      };

      mockTasks.insert.mockResolvedValueOnce(mockResponse);

      const result = await api.createTask(newTask);

      expect(mockTasks.insert).toHaveBeenCalledWith({
        tasklist: '@default',
        requestBody: newTask
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('handles API errors when creating task', async () => {
      mockTasks.insert.mockRejectedValueOnce(new Error('API Error'));

      await expect(api.createTask({ title: 'New Task' }))
          .rejects.toThrow('Failed to create task');
    });
  });

  describe('updateTask', () => {
    it('updates an existing task', async () => {
      const taskId = '1';
      const updates = { title: 'Updated Task' };
      const mockResponse = {
        data: { id: taskId, title: 'Updated Task', status: 'needsAction' }
      };

      mockTasks.update.mockResolvedValueOnce(mockResponse);

      const result = await api.updateTask(taskId, updates);

      expect(mockTasks.update).toHaveBeenCalledWith({
        tasklist: '@default',
        task: taskId,
        requestBody: updates
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('handles API errors when updating task', async () => {
      mockTasks.update.mockRejectedValueOnce(new Error('API Error'));

      await expect(api.updateTask('1', { title: 'Updated Task' }))
          .rejects.toThrow('Failed to update task');
    });
  });

  describe('deleteTask', () => {
    it('deletes a task', async () => {
      const taskId = '1';
      mockTasks.delete.mockResolvedValueOnce({});

      await api.deleteTask(taskId);

      expect(mockTasks.delete).toHaveBeenCalledWith({
        tasklist: '@default',
        task: taskId
      });
    });

    it('handles API errors when deleting task', async () => {
      mockTasks.delete.mockRejectedValueOnce(new Error('API Error'));

      await expect(api.deleteTask('1'))
          .rejects.toThrow('Failed to delete task');
    });
  });

  describe('completeTask', () => {
    it('marks a task as completed', async () => {
      const taskId = '1';
      const mockResponse = {
        data: { id: taskId, status: 'completed' }
      };

      mockTasks.update.mockResolvedValueOnce(mockResponse);

      const result = await api.completeTask(taskId);

      expect(mockTasks.update).toHaveBeenCalledWith({
        tasklist: '@default',
        task: taskId,
        requestBody: { status: 'completed' }
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('handles API errors when completing task', async () => {
      mockTasks.update.mockRejectedValueOnce(new Error('API Error'));

      await expect(api.completeTask('1'))
          .rejects.toThrow('Failed to complete task');
    });
  });
});