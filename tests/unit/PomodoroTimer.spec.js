import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { nextTick } from 'vue'
import PomodoroTimer from '../../src/components/PomodoroTimer.vue'

describe('PomodoroTimer.vue', () => {
  let wrapper;
  
  beforeEach(() => {
    // Setup fake timers
    vi.useFakeTimers();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    // Mock Audio
    window.Audio = vi.fn().mockImplementation(() => ({
      play: vi.fn()
    }));

    // Mock Notification API
    const notificationMock = vi.fn();
    Object.defineProperty(window, 'Notification', {
      value: class {
        constructor(title, options) {
          notificationMock(title, options);
        }
        static permission = 'granted';
        static requestPermission = vi.fn().mockResolvedValue('granted');
      },
      writable: true
    });

    wrapper = mount(PomodoroTimer, {
      props: {
        showSettings: false
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    wrapper.unmount();
  });

  it('initializes with default timer values', () => {
    expect(wrapper.find('.timer').text()).toBe('25:00');
    expect(wrapper.find('.pomodoro-count').text()).toContain('0');
  });

  it('starts and pauses the timer', async () => {
    const startButton = wrapper.find('button.start');
    
    // Start timer
    await startButton.trigger('click');
    expect(wrapper.vm.isRunning).toBe(true);
    expect(startButton.text()).toContain('Pause');
    
    // Pause timer
    await startButton.trigger('click');
    expect(wrapper.vm.isRunning).toBe(false);
    expect(startButton.text()).toContain('Start');
  });

  it('switches between different timer modes', async () => {
    // Short break mode
    await wrapper.find('button.mode-btn:nth-child(2)').trigger('click');
    expect(wrapper.find('.timer').text()).toBe('05:00');
    expect(wrapper.vm.timerMode).toBe('shortBreak');
    
    // Long break mode
    await wrapper.find('button.mode-btn:nth-child(3)').trigger('click');
    expect(wrapper.find('.timer').text()).toBe('30:00');
    expect(wrapper.vm.timerMode).toBe('longBreak');
    
    // Back to pomodoro mode
    await wrapper.find('button.mode-btn:nth-child(1)').trigger('click');
    expect(wrapper.find('.timer').text()).toBe('25:00');
    expect(wrapper.vm.timerMode).toBe('pomodoro');
  });

  it('shows skip button only during breaks', async () => {
    // Initially no skip button in pomodoro mode
    expect(wrapper.find('button.skip').exists()).toBe(false);
    
    // Switch to short break
    await wrapper.find('button.mode-btn:nth-child(2)').trigger('click');
    expect(wrapper.find('button.skip').exists()).toBe(true);
    
    // Switch back to pomodoro
    await wrapper.find('button.mode-btn:nth-child(1)').trigger('click');
    expect(wrapper.find('button.skip').exists()).toBe(false);
  });

  it('resets the timer correctly', async () => {
    // Start timer and wait
    await wrapper.find('button.start').trigger('click');
    vi.advanceTimersByTime(5000); // Advance 5 seconds
    
    // Reset timer
    await wrapper.find('button.reset').trigger('click');
    expect(wrapper.find('.timer').text()).toBe('25:00');
    expect(wrapper.vm.isRunning).toBe(false);
  });

  it('completes a pomodoro and transitions to break', async () => {
    await wrapper.find('button.start').trigger('click');
    await nextTick();
    
    // Force the timer to complete immediately
    wrapper.vm.timeLeft = 0;
    wrapper.vm.updateTimer();
    await nextTick();
    
    expect(wrapper.vm.completedPomodoros).toBe(1);
    expect(wrapper.vm.timerMode).toBe('shortBreak');
  });

  it('saves settings to localStorage', async () => {
    const newSettings = {
      focusDuration: 30,
      shortBreakDuration: 7,
      longBreakDuration: 35,
      pomodorosUntilLongBreak: 4
    };
    
    await wrapper.vm.updateSettings(newSettings);
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'pomodoro-settings',
      JSON.stringify(newSettings)
    );
  });
});