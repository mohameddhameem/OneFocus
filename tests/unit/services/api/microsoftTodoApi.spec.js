import '@microsoft/microsoft-graph-client';
import microsoftTodoApi from '../../../../src/services/api/microsoftTodoApi';
import { Client } from '@microsoft/microsoft-graph-client';
// Define mockGraphApi before any imports or mocks that use it
const mockGraphApi = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn()
};



// Mock the auth service
jest.mock('../../../../src/services/auth/microsoftAuth', () => ({
  microsoftAuthService: {
    getAccessToken: jest.fn().mockResolvedValue('mock-token')
  }
}), { virtual: true });

// Mock the Microsoft Graph client
jest.mock('@microsoft/microsoft-graph-client', () => ({
  Client: {
    init: jest.fn().mockReturnValue({
      api: jest.fn().mockReturnValue(mockGraphApi)
    })
  }
}));

describe('microsoftTodoApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTaskLists', () => {
    it('returns task lists successfully', async () => {
      const mockLists = [
        { id: '1', displayName: 'List 1' },
        { id: '2', displayName: 'List 2' }
      ];
      
      mockGraphApi.get.mockResolvedValueOnce({ value: mockLists });
      
      const result = await microsoftTodoApi.getTaskLists();
      expect(result).toEqual(mockLists);
      expect(mockGraphApi.get).toHaveBeenCalled();
    });

    it('handles errors appropriately', async () => {
      mockGraphApi.get.mockRejectedValueOnce(new Error('API Error'));
      
      await expect(microsoftTodoApi.getTaskLists()).rejects.toThrow('API Error');
    });
  });

  describe('getTasks', () => {
    const listId = 'test-list-id';
    
    it('returns tasks from a list successfully', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' }
      ];
      
      mockGraphApi.get.mockResolvedValueOnce({ value: mockTasks });
      
      const result = await microsoftTodoApi.getTasks(listId);
      expect(result).toEqual(mockTasks);
      expect(mockGraphApi.get).toHaveBeenCalled();
    });

    it('handles errors appropriately', async () => {
      mockGraphApi.get.mockRejectedValueOnce(new Error('API Error'));
      
      await expect(microsoftTodoApi.getTasks(listId)).rejects.toThrow('API Error');
    });
  });

  describe('createTask', () => {
    const listId = 'test-list-id';
    const task = {
      title: 'New Task',
      notes: 'Task notes',
      dueDate: '2025-03-24'
    };

    it('creates a task successfully', async () => {
      const mockResponse = { ...task, id: 'new-task-id' };
      mockGraphApi.post.mockResolvedValueOnce(mockResponse);
      
      const result = await microsoftTodoApi.createTask(listId, task);
      expect(result).toEqual(mockResponse);
      expect(mockGraphApi.post).toHaveBeenCalled();
    });

    it('handles errors appropriately', async () => {
      mockGraphApi.post.mockRejectedValueOnce(new Error('API Error'));
      
      await expect(microsoftTodoApi.createTask(listId, task)).rejects.toThrow('API Error');
    });
  });

  describe('completeTask', () => {
    const listId = 'test-list-id';
    const taskId = 'test-task-id';

    it('marks a task as completed successfully', async () => {
      mockGraphApi.patch.mockResolvedValueOnce({ status: 'completed' });
      
      const result = await microsoftTodoApi.completeTask(listId, taskId);
      expect(result).toBe(true);
      expect(mockGraphApi.patch).toHaveBeenCalled();
    });

    it('handles errors appropriately', async () => {
      mockGraphApi.patch.mockRejectedValueOnce(new Error('API Error'));
      
      await expect(microsoftTodoApi.completeTask(listId, taskId)).rejects.toThrow('API Error');
    });
  });

  describe('startTask', () => {
    const listId = 'test-list-id';
    const taskId = 'test-task-id';

    it('marks a task as in progress successfully', async () => {
      mockGraphApi.patch.mockResolvedValueOnce({ status: 'inProgress' });
      
      const result = await microsoftTodoApi.startTask(listId, taskId);
      expect(result).toBe(true);
      expect(mockGraphApi.patch).toHaveBeenCalled();
    });

    it('handles errors appropriately', async () => {
      mockGraphApi.patch.mockRejectedValueOnce(new Error('API Error'));
      
      await expect(microsoftTodoApi.startTask(listId, taskId)).rejects.toThrow('API Error');
    });
  });

  describe('deleteTask', () => {
    const listId = 'test-list-id';
    const taskId = 'test-task-id';

    it('deletes a task successfully', async () => {
      mockGraphApi.delete.mockResolvedValueOnce();
      
      const result = await microsoftTodoApi.deleteTask(listId, taskId);
      expect(result).toBe(true);
      expect(mockGraphApi.delete).toHaveBeenCalled();
    });

    it('handles errors appropriately', async () => {
      mockGraphApi.delete.mockRejectedValueOnce(new Error('API Error'));
      
      await expect(microsoftTodoApi.deleteTask(listId, taskId)).rejects.toThrow('API Error');
    });
  });
});

describe('MicrosoftTodoApi', () => {
  let api;
  let mockClient;

  beforeEach(() => {
    mockClient = {
      api: jest.fn().mockReturnThis(),
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    Client.init = jest.fn().mockReturnValue(mockClient);
    api = new MicrosoftTodoApi('mock-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with access token', () => {
    expect(Client.init).toHaveBeenCalledWith({
      authProvider: expect.any(Function),
    });
  });

  describe('getTasks', () => {
    it('retrieves tasks from Microsoft Todo', async () => {
      const mockResponse = {
        value: [
          { id: '1', title: 'Test Task 1', status: 'notStarted' },
          { id: '2', title: 'Test Task 2', status: 'completed' }
        ]
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tasks = await api.getTasks();

      expect(mockClient.api).toHaveBeenCalledWith('/me/todo/lists/defaultList/tasks');
      expect(mockClient.get).toHaveBeenCalled();
      expect(tasks).toHaveLength(2);
      expect(tasks[0]).toEqual(expect.objectContaining({
        id: '1',
        title: 'Test Task 1',
        completed: false
      }));
    });

    it('handles API errors gracefully', async () => {
      mockClient.get.mockRejectedValue(new Error('API Error'));
      
      await expect(api.getTasks()).rejects.toThrow('Failed to fetch tasks');
    });
  });

  describe('addTask', () => {
    it('creates a new task', async () => {
      const newTask = { title: 'New Task' };
      const mockResponse = { id: '3', title: 'New Task', status: 'notStarted' };

      mockClient.post.mockResolvedValue(mockResponse);

      const task = await api.addTask(newTask);

      expect(mockClient.api).toHaveBeenCalledWith('/me/todo/lists/defaultList/tasks');
      expect(mockClient.post).toHaveBeenCalledWith({ body: expect.any(Object) });
      expect(task).toEqual(expect.objectContaining({
        id: '3',
        title: 'New Task',
        completed: false
      }));
    });
  });

  describe('updateTask', () => {
    it('updates an existing task', async () => {
      const taskUpdate = { id: '1', title: 'Updated Task', completed: true };
      const mockResponse = { id: '1', title: 'Updated Task', status: 'completed' };

      mockClient.patch.mockResolvedValue(mockResponse);

      const task = await api.updateTask(taskUpdate);

      expect(mockClient.api).toHaveBeenCalledWith('/me/todo/lists/defaultList/tasks/1');
      expect(mockClient.patch).toHaveBeenCalledWith({ body: expect.any(Object) });
      expect(task).toEqual(expect.objectContaining({
        id: '1',
        title: 'Updated Task',
        completed: true
      }));
    });
  });

  describe('deleteTask', () => {
    it('deletes a task', async () => {
      mockClient.delete.mockResolvedValue();

      await api.deleteTask('1');

      expect(mockClient.api).toHaveBeenCalledWith('/me/todo/lists/defaultList/tasks/1');
      expect(mockClient.delete).toHaveBeenCalled();
    });
  });

  describe('completeTask', () => {
    it('marks a task as completed', async () => {
      const taskId = '1';
      const mockResponse = { id: taskId, status: 'completed' };

      mockClient.patch.mockResolvedValue(mockResponse);

      const result = await api.completeTask(taskId);

      expect(mockClient.api).toHaveBeenCalledWith(`/me/todo/lists/defaultList/tasks/${taskId}`);
      expect(mockClient.patch).toHaveBeenCalledWith({ status: 'completed' });
      expect(result).toEqual(mockResponse);
    });

    it('handles API errors when completing task', async () => {
      mockClient.patch.mockRejectedValue(new Error('API Error'));

      await expect(api.completeTask('1'))
        .rejects.toThrow('Failed to complete task');
    });
  });
});
