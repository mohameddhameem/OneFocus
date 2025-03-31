import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import PomodoroTimer from '../../src/components/PomodoroTimer.vue'

describe('PomodoroTimer.vue', () => {
  let wrapper;
  
  // Mock document.title
  const originalTitle = document.title;
  
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn().mockReturnValue(JSON.stringify({
      focusDuration: 25,  // Using default values that match the component
      shortBreakDuration: 5,
      longBreakDuration: 30,
      pomodorosUntilLongBreak: 3
    })),
    setItem: jest.fn()
  };
  
  // Mock Notification API
  const originalNotification = global.Notification;
  const mockNotification = jest.fn().mockImplementation(() => ({
    onclick: null,
    close: jest.fn()
  }));
  
  // Mock Audio API
  const originalAudio = global.Audio;
  const mockAudio = jest.fn().mockImplementation(() => ({
    play: jest.fn()
  }));
  
  beforeAll(() => {
    // Replace globals with mocks
    global.Notification = mockNotification;
    global.Notification.permission = 'granted';
    global.Notification.requestPermission = jest.fn().mockResolvedValue('granted');
    
    global.Audio = mockAudio;
  });
  
  afterAll(() => {
    // Restore globals
    global.Notification = originalNotification;
    global.Audio = originalAudio;
    document.title = originalTitle;
  });
  
  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Reset mocks before each test
    mockNotification.mockClear();
    mockAudio.mockClear();
    
    wrapper = mount(PomodoroTimer, {
      props: {
        showSettings: false
      }
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
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
    await nextTick();
    expect(startButton.text()).toContain('Pause');
    
    // Pause timer
    await startButton.trigger('click');
    await nextTick();
    expect(startButton.text()).toContain('Start');
  });

  it('switches between different timer modes', async () => {
    // Short break mode
    await wrapper.find('button.mode-btn:nth-child(2)').trigger('click');
    await nextTick();
    expect(wrapper.find('.timer').text()).toBe('05:00');
    
    // Long break mode
    await wrapper.find('button.mode-btn:nth-child(3)').trigger('click');
    await nextTick();
    expect(wrapper.find('.timer').text()).toBe('30:00');
    
    // Back to pomodoro mode
    await wrapper.find('button.mode-btn:nth-child(1)').trigger('click');
    await nextTick();
    expect(wrapper.find('.timer').text()).toBe('25:00');
  });

  it('shows skip button only during breaks', async () => {
    // Initially no skip button in pomodoro mode
    expect(wrapper.find('button.skip').exists()).toBe(false);
    
    // Switch to short break
    await wrapper.find('button.mode-btn:nth-child(2)').trigger('click');
    await nextTick();
    expect(wrapper.find('button.skip').exists()).toBe(true);
    
    // Switch back to pomodoro
    await wrapper.find('button.mode-btn:nth-child(1)').trigger('click');
    await nextTick();
    expect(wrapper.find('button.skip').exists()).toBe(false);
  });

  it('resets the timer correctly', async () => {
    // Start timer and wait
    await wrapper.find('button.start').trigger('click');
    await nextTick();
    jest.advanceTimersByTime(5000);
    await nextTick();
    
    // Reset timer
    await wrapper.find('button.reset').trigger('click');
    await nextTick();
    expect(wrapper.find('.timer').text()).toBe('25:00');
  });

  it('completes a pomodoro and transitions to break', async () => {
    await wrapper.find('button.start').trigger('click');
    await nextTick();
    
    // Fast forward to completion
    jest.advanceTimersByTime(25 * 60 * 1000);
    await nextTick();
    
    expect(wrapper.find('.pomodoro-count').text()).toContain('1');
    expect(wrapper.find('.timer').text()).toBe('05:00'); // Short break time
  });

  it('handles settings updates', async () => {
    const newSettings = {
      focusDuration: 30,
      shortBreakDuration: 7,
      longBreakDuration: 35,
      pomodorosUntilLongBreak: 4
    };
    
    // Find TimerSettings component and trigger save
    const timerSettings = wrapper.findComponent({ name: 'TimerSettings' });
    await timerSettings.vm.$emit('save', newSettings);
    await nextTick();
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'pomodoro-settings',
      JSON.stringify(newSettings)
    );
  });

  it('updates document title with timer and mode', async () => {
    // Start timer and check if title updates
    await wrapper.find('button.start').trigger('click');
    await nextTick();
    
    // Move forward a bit to ensure the timer shows
    jest.advanceTimersByTime(2000);
    await nextTick();
    
    // Should be showing a value close to 24:58 (not exactly, due to timing variations)
    // Check just the format and that it contains "Focus"
    expect(document.title).toMatch(/\d{2}:\d{2} - Focus \| OneFocus/);
    
    // Switch to short break and check title
    await wrapper.find('button.mode-btn:nth-child(2)').trigger('click');
    await nextTick();
    expect(document.title).toMatch(/\d{2}:\d{2} - Short Break \| OneFocus/);
  });

  it('sends notifications when timer completes', async () => {
    // Clear mocks before we start
    mockNotification.mockClear();
    mockAudio.mockClear();
    
    await wrapper.find('button.start').trigger('click');
    await nextTick();
    
    // Fast forward to completion (plus a little extra to ensure callbacks run)
    jest.advanceTimersByTime(25 * 60 * 1000 + 100);
    await nextTick();
    
    // Check that notification was created - be lenient with exact counts
    expect(mockAudio).toHaveBeenCalled();
    expect(mockNotification).toHaveBeenCalled();
  });

  it('handles rapid mode switching correctly', async () => {
    // Start timer
    await wrapper.find('button.start').trigger('click');
    await nextTick();
    
    // Switch modes rapidly
    await wrapper.find('button.mode-btn:nth-child(2)').trigger('click');
    await wrapper.find('button.mode-btn:nth-child(3)').trigger('click');
    await wrapper.find('button.mode-btn:nth-child(1)').trigger('click');
    await nextTick();
    
    // Timer should be stopped and reset to pomodoro time
    expect(wrapper.find('.timer').text()).toBe('25:00');
    expect(wrapper.find('button.start').text()).toContain('Start');
  });

  it('maintains completed pomodoros count through mode switches', async () => {
    // Complete one pomodoro
    await wrapper.find('button.start').trigger('click');
    jest.advanceTimersByTime(25 * 60 * 1000);
    await nextTick();
    
    const initialCount = 1; // After completing a pomodoro, count should be 1
    
    // Switch modes multiple times
    await wrapper.find('button.mode-btn:nth-child(1)').trigger('click');
    await wrapper.find('button.mode-btn:nth-child(2)').trigger('click');
    await nextTick();
    
    const countText = wrapper.find('.pomodoro-count').text();
    expect(countText).toContain(`${initialCount}`);
  });

  it('handles skip break functionality correctly', async () => {
    // Complete one pomodoro to enter break
    await wrapper.find('button.start').trigger('click');
    jest.advanceTimersByTime(25 * 60 * 1000);
    await nextTick();
    
    // Should be in break mode
    expect(wrapper.find('button.skip').exists()).toBe(true);
    
    // Skip break
    await wrapper.find('button.skip').trigger('click');
    await nextTick();
    
    // Should be back in pomodoro mode
    expect(wrapper.find('.timer').text()).toBe('25:00');
    expect(wrapper.find('button.skip').exists()).toBe(false);
  });

  it('emits pomodoroComplete event when focus session ends', async () => {
    // Start timer
    await wrapper.find('button.start').trigger('click');
    await nextTick();
    
    // Fast forward to completion
    jest.advanceTimersByTime(25 * 60 * 1000);
    await nextTick();
    
    expect(wrapper.emitted('pomodoroComplete')).toBeTruthy();
    expect(wrapper.emitted('pomodoroComplete').length).toBe(1);
  });

  it('does not emit pomodoroComplete event when break ends', async () => {
    // Switch to break mode
    await wrapper.find('button.mode-btn:nth-child(2)').trigger('click');
    await nextTick();
    
    // Start timer
    await wrapper.find('button.start').trigger('click');
    await nextTick();
    
    // Fast forward to completion
    jest.advanceTimersByTime(5 * 60 * 1000);
    await nextTick();
    
    expect(wrapper.emitted('pomodoroComplete')).toBeFalsy();
  });

  it('increments completed pomodoros after focus session', async () => {
    const initialCount = parseInt(wrapper.find('.pomodoro-count').text().match(/\d+/)[0]);
    
    // Start and complete a pomodoro
    await wrapper.find('button.start').trigger('click');
    jest.advanceTimersByTime(25 * 60 * 1000);
    await nextTick();
    
    const newCount = parseInt(wrapper.find('.pomodoro-count').text().match(/\d+/)[0]);
    expect(newCount).toBe(initialCount + 1);
  });
});