import { mount } from '@vue/test-utils';
import TaskItem from '../../../src/components/tasks/TaskItem.vue';

describe('TaskItem.vue', () => {
  let wrapper;
  
  const createWrapper = (taskProps = {}) => {
    const defaultTask = {
      id: '123',
      title: 'Test Task',
      status: 'notStarted',
      pomoCount: 3,
      completedPomos: 0,
      ...taskProps
    };

    return mount(TaskItem, {
      props: {
        task: defaultTask,
        integration: 'local'
      }
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('displays pomodoro progress when task has pomoCount', () => {
    expect(wrapper.find('.pomo-progress').exists()).toBe(true);
    expect(wrapper.find('.pomo-count').text()).toBe('0/3 pomos');
  });

  it('calculates progress bar width correctly', () => {
    wrapper = createWrapper({ completedPomos: 2, pomoCount: 4 });
    const progressFill = wrapper.find('.progress-fill');
    expect(progressFill.attributes('style')).toContain('width: 50%');
  });

  it('does not show pomodoro progress for tasks without pomoCount', () => {
    wrapper = createWrapper({ pomoCount: undefined });
    expect(wrapper.find('.pomo-progress').exists()).toBe(false);
  });

  it('displays completed pomodoro count correctly', () => {
    wrapper = createWrapper({ completedPomos: 2, pomoCount: 3 });
    expect(wrapper.find('.pomo-count').text()).toBe('2/3 pomos');
  });

  it('shows full progress when all pomodoros are completed', () => {
    wrapper = createWrapper({ completedPomos: 3, pomoCount: 3 });
    const progressFill = wrapper.find('.progress-fill');
    expect(progressFill.attributes('style')).toContain('width: 100%');
  });

  it('handles pomodoro count with zero completed pomodoros', () => {
    wrapper = createWrapper({ completedPomos: 0, pomoCount: 5 });
    const progressFill = wrapper.find('.progress-fill');
    expect(progressFill.attributes('style')).toContain('width: 0%');
    expect(wrapper.find('.pomo-count').text()).toBe('0/5 pomos');
  });

  // Test data for Microsoft Todo task
  const microsoftTask = {
    id: 'task-123',
    title: 'Test Microsoft Task',
    status: 'notStarted',
    dueDateTime: {
      dateTime: '2025-04-15T12:00:00Z',
      timeZone: 'UTC'
    }
  };

  // Test data for Google Tasks task
  const googleTask = {
    id: 'task-456',
    title: 'Test Google Task',
    status: 'needsAction',
    due: '2025-04-15T12:00:00Z',
    notes: 'Task notes'
  };

  it('renders Microsoft task correctly', () => {
    const wrapper = mount(TaskItem, {
      props: {
        task: microsoftTask,
        integration: 'microsoft'
      }
    });

    expect(wrapper.find('.task-title').text()).toBe('Test Microsoft Task');
    expect(wrapper.find('.task-due-date').text()).toContain('Due:');
    expect(wrapper.find('.task-due-date').text()).toContain('15');
    expect(wrapper.find('.task-due-date').text()).toContain('2025');
    expect(wrapper.classes()).not.toContain('completed');
  });

  it('renders Google task correctly', () => {
    const wrapper = mount(TaskItem, {
      props: {
        task: googleTask,
        integration: 'google'
      }
    });

    expect(wrapper.find('.task-title').text()).toBe('Test Google Task');
    expect(wrapper.find('.task-due-date').text()).toContain('Due:');
    expect(wrapper.find('.task-due-date').text()).toContain('15');
    expect(wrapper.find('.task-due-date').text()).toContain('2025');
    expect(wrapper.classes()).not.toContain('completed');
  });

  it('shows completed status for Microsoft task', () => {
    const completedTask = { ...microsoftTask, status: 'completed' };
    
    const wrapper = mount(TaskItem, {
      props: {
        task: completedTask,
        integration: 'microsoft'
      }
    });

    expect(wrapper.classes()).toContain('completed');
    expect(wrapper.find('.completed-icon').exists()).toBe(true);
    expect(wrapper.find('.task-title').classes()).toContain('completed-title');
  });

  it('shows completed status for Google task', () => {
    const completedTask = { ...googleTask, status: 'completed' };
    
    const wrapper = mount(TaskItem, {
      props: {
        task: completedTask,
        integration: 'google'
      }
    });

    expect(wrapper.classes()).toContain('completed');
    expect(wrapper.find('.completed-icon').exists()).toBe(true);
    expect(wrapper.find('.task-title').classes()).toContain('completed-title');
  });

  it('shows in-progress status for Microsoft task', () => {
    const inProgressTask = { ...microsoftTask, status: 'inProgress' };
    
    const wrapper = mount(TaskItem, {
      props: {
        task: inProgressTask,
        integration: 'microsoft'
      }
    });

    expect(wrapper.classes()).toContain('in-progress');
    expect(wrapper.find('.in-progress-indicator').exists()).toBe(true);
  });

  it('shows in-progress status for Google task with started note', () => {
    const inProgressTask = { 
      ...googleTask, 
      notes: 'Task notes\nStarted: Fri Mar 21 2025' 
    };
    
    const wrapper = mount(TaskItem, {
      props: {
        task: inProgressTask,
        integration: 'google'
      }
    });

    expect(wrapper.classes()).toContain('in-progress');
    expect(wrapper.find('.in-progress-indicator').exists()).toBe(true);
  });

  it('emits start event when start button is clicked', async () => {
    const wrapper = mount(TaskItem, {
      props: {
        task: microsoftTask,
        integration: 'microsoft'
      }
    });

    await wrapper.find('.start-btn').trigger('click');
    
    expect(wrapper.emitted('start')).toBeTruthy();
    expect(wrapper.emitted('start')[0][0]).toEqual(microsoftTask);
  });

  it('emits complete event when complete button is clicked', async () => {
    const wrapper = mount(TaskItem, {
      props: {
        task: microsoftTask,
        integration: 'microsoft'
      }
    });

    await wrapper.find('.complete-btn').trigger('click');
    
    expect(wrapper.emitted('complete')).toBeTruthy();
    expect(wrapper.emitted('complete')[0][0]).toEqual('task-123');
  });

  it('emits delete event when delete button is clicked', async () => {
    const wrapper = mount(TaskItem, {
      props: {
        task: microsoftTask,
        integration: 'microsoft'
      }
    });

    await wrapper.find('.delete-btn').trigger('click');
    
    expect(wrapper.emitted('delete')).toBeTruthy();
    expect(wrapper.emitted('delete')[0][0]).toEqual('task-123');
  });

  it('handles tasks without due dates', () => {
    const noDueDateProps = {
      task: {
        id: '2',
        title: 'Task without due date',
        status: 'notStarted'
      },
      integration: 'local'
    };
    const wrapper = mount(TaskItem, {
      props: noDueDateProps
    });
    expect(wrapper.find('.task-due-date').exists()).toBe(false);
  });

  it('displays pomodoro progress when task has pomoCount', () => {
    const pomoProps = {
      task: {
        id: '3',
        title: 'Task with pomodoros',
        status: 'notStarted',
        pomoCount: 3,
        completedPomos: 0
      },
      integration: 'local'
    };
    const wrapper = mount(TaskItem, {
      props: pomoProps
    });
    expect(wrapper.find('.pomo-progress').exists()).toBe(true);
    expect(wrapper.find('.pomo-count').text()).toBe('0/3 pomos');
  });

  it('calculates progress bar width correctly', () => {
    const pomoProps = {
      task: {
        id: '4',
        title: 'Task with pomodoro progress',
        status: 'notStarted',
        pomoCount: 4,
        completedPomos: 2
      },
      integration: 'local'
    };
    const wrapper = mount(TaskItem, {
      props: pomoProps
    });
    const progressFill = wrapper.find('.progress-fill');
    expect(progressFill.attributes('style')).toContain('width: 50%');
  });

  it('does not show pomodoro progress for tasks without pomoCount', () => {
    const wrapper = mount(TaskItem, {
      props: {
        task: {
          id: '1',
          title: 'Test Task',
          status: 'notStarted',
          dueDate: '2025-04-15T00:00:00.000Z'
        },
        integration: 'local'
      }
    });
    expect(wrapper.find('.pomo-progress').exists()).toBe(false);
  });
});