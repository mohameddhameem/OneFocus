import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import PomodoroTimer from '../../src/components/PomodoroTimer.vue'

describe('PomodoroTimer.vue', () => {
  let wrapper;
  
  beforeEach(() => {
    jest.useFakeTimers();
    wrapper = mount(PomodoroTimer, {
      props: {
        showSettings: false
      }
    });
  });

  afterEach(() => {
    jest.useRealTimers();
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
});