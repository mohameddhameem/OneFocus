import { mount } from '@vue/test-utils'
import TaskList from '../../../src/components/tasks/TaskList.vue'
import localTasksApi from '../../../src/services/api/localTasksApi'

// Increase the Jest timeout
jest.setTimeout(15000);

// Mock the task APIs
jest.mock('../../../src/services/api/localTasksApi', () => ({
  getTaskLists: jest.fn().mockResolvedValue([{ id: 'default', name: 'Default List' }]),
  getTasks: jest.fn().mockResolvedValue([
    { id: '1', title: 'Task 1', completed: false, completedDate: null, pomodorosRequired: 2, pomodorosCompleted: 0 },
    { id: '2', title: 'Task 2', completed: false, completedDate: null, pomodorosRequired: 3, pomodorosCompleted: 1 }
  ]),
  createTask: jest.fn().mockImplementation((listId, task) => 
    Promise.resolve({ ...task, id: 'new-task-id' })),
  completeTask: jest.fn().mockResolvedValue(true),
  startTask: jest.fn().mockResolvedValue(true),
  deleteTask: jest.fn().mockResolvedValue(true),
  updateTaskPomodoros: jest.fn().mockResolvedValue(true)
}));

// Mock the API dependencies
jest.mock('../../../src/services/api/microsoftTodoApi', () => ({}), { virtual: true });
jest.mock('../../../src/services/api/googleTasksApi', () => ({}), { virtual: true });

// Test suite
describe('TaskList.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Use mount with stubs option instead of trying to modify component state
    wrapper = mount(TaskList, {
      props: {
        integration: 'local'
      },
      global: {
        stubs: {
          TaskItem: true
        },
        mocks: {
          $emit: jest.fn()
        }
      }
    });
    
    // Wait for the component to complete its mount hooks
    await localTasksApi.getTaskLists.mock.results[0].value;
    await localTasksApi.getTasks.mock.results[0].value;
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('loads task lists on mount', () => {
    expect(localTasksApi.getTaskLists).toHaveBeenCalled();
  });

  it('loads tasks when a task list is selected', async () => {
    // Reset the mock count
    localTasksApi.getTasks.mockClear();
    
    // Call method directly
    wrapper.vm.currentTaskList = { id: 'default', name: 'Default List' };
    await wrapper.vm.loadTasks();
    
    // Verify
    expect(localTasksApi.getTasks).toHaveBeenCalledWith('default');
  });

  it('creates a new task', async () => {
    // Setup - set values directly in the component
    wrapper.vm.newTaskTitle = 'New Test Task';
    wrapper.vm.newTaskPomodoros = 2;
    
    // Execute - call method directly
    await wrapper.vm.createTask();
    
    // Verify
    expect(localTasksApi.createTask).toHaveBeenCalledWith('default', expect.objectContaining({
      title: 'New Test Task',
      pomodorosRequired: 2
    }));
  });

  it('completes a task', async () => {
    // Execute - call the method directly
    await wrapper.vm.completeTask('1');
    
    // Verify
    expect(localTasksApi.completeTask).toHaveBeenCalledWith('default', '1');
  });

  it('handles pomodoro completion', async () => {
    // Setup - set current task directly
    wrapper.vm.currentTask = { id: '1', title: 'Current Task', completed: false, pomodorosRequired: 2, pomodorosCompleted: 0 };
    
    // Execute - call the method directly
    await wrapper.vm.handlePomodoroComplete();
    
    // Verify
    expect(localTasksApi.updateTaskPomodoros).toHaveBeenCalledWith(
      'default', 
      '1', 
      expect.objectContaining({ 
        pomodorosCompleted: 1 
      })
    );
  });
});