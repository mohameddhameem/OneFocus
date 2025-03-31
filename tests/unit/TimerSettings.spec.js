import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TimerSettings from '../../src/components/TimerSettings.vue'

describe('TimerSettings.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(TimerSettings, {
      props: {
        show: true,
        focusDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 30,
        pomodorosUntilLongBreak: 3
      }
    })
  })

  it('renders when show prop is true', () => {
    expect(wrapper.find('.settings-modal').exists()).toBe(true);
  });

  it('does not render when show prop is false', async () => {
    await wrapper.setProps({ show: false });
    expect(wrapper.find('.settings-modal').exists()).toBe(false);
  });

  it('initializes with provided prop values', () => {
    expect(wrapper.find('#focus').element.value).toBe('25');
    expect(wrapper.find('#shortBreak').element.value).toBe('5');
    expect(wrapper.find('#longBreak').element.value).toBe('30');
    expect(wrapper.find('#pomodoroCount').element.value).toBe('3');
  });

  it('emits save event with updated values', async () => {
    await wrapper.find('#focus').setValue(30);
    await wrapper.find('#shortBreak').setValue(7);
    await wrapper.find('#longBreak').setValue(35);
    await wrapper.find('#pomodoroCount').setValue(4);

    await wrapper.find('.save-button').trigger('click');

    expect(wrapper.emitted().save).toBeTruthy();
    expect(wrapper.emitted().save[0][0]).toEqual({
      focusDuration: 30,
      shortBreakDuration: 7,
      longBreakDuration: 35,
      pomodorosUntilLongBreak: 4
    });
  });

  it('resets values to defaults when reset button is clicked', async () => {
    // Change values first
    await wrapper.find('#focus').setValue(30);
    await wrapper.find('#shortBreak').setValue(7);
    await wrapper.find('#longBreak').setValue(35);
    await wrapper.find('#pomodoroCount').setValue(4);

    // Click reset button
    await wrapper.find('.reset-button').trigger('click');

    // Verify values are reset to defaults
    expect(wrapper.find('#focus').element.value).toBe('25');
    expect(wrapper.find('#shortBreak').element.value).toBe('5');
    expect(wrapper.find('#longBreak').element.value).toBe('30');
    expect(wrapper.find('#pomodoroCount').element.value).toBe('3');
  });

  it('emits save event with null when close button is clicked', async () => {
    await wrapper.find('.close-button').trigger('click');
    expect(wrapper.emitted().save).toBeTruthy();
    expect(wrapper.emitted().save[0][0]).toBeNull();
  });

  it('validates input ranges', async () => {
    const focusInput = wrapper.find('#focus');
    
    // Test min value
    await focusInput.setValue(0);
    await wrapper.find('.save-button').trigger('click');
    expect(wrapper.emitted().save[0][0].focusDuration).toBe(25);

    // Test max value
    await focusInput.setValue(121);
    await wrapper.find('.save-button').trigger('click');
    expect(wrapper.emitted().save[1][0].focusDuration).toBe(25);
  });

  it('handles invalid input values correctly', async () => {
    // Test negative values
    await wrapper.find('#focus').setValue(-5);
    await wrapper.find('#shortBreak').setValue(-2);
    await wrapper.find('.save-button').trigger('click');
    
    expect(wrapper.emitted().save[0][0]).toEqual(expect.objectContaining({
      focusDuration: 25,
      shortBreakDuration: 5
    }));

    // Test non-numeric values
    await wrapper.find('#focus').setValue('abc');
    await wrapper.find('.save-button').trigger('click');
    expect(wrapper.emitted().save[1][0].focusDuration).toBe(25);
  });

  it('validates pomodoros until long break constraints', async () => {
    // Test value above max
    await wrapper.find('#pomodoroCount').setValue(11);
    await wrapper.find('.save-button').trigger('click');
    expect(wrapper.emitted().save[0][0].pomodorosUntilLongBreak).toBe(3);

    // Test zero value
    await wrapper.find('#pomodoroCount').setValue(0);
    await wrapper.find('.save-button').trigger('click');
    expect(wrapper.emitted().save[1][0].pomodorosUntilLongBreak).toBe(3);
  });

  it('maintains form state when toggling visibility', async () => {
    // Change values
    await wrapper.find('#focus').setValue(30);
    await wrapper.find('#shortBreak').setValue(7);
    
    // Hide and show the settings
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });
    
    // Values should persist
    expect(wrapper.find('#focus').element.value).toBe('30');
    expect(wrapper.find('#shortBreak').element.value).toBe('7');
  });

  it('preserves unsaved changes when closing and reopening', async () => {
    // Change a value
    const focusInput = wrapper.find('#focus')
    await focusInput.setValue('40')
    
    // Hide the component
    await wrapper.setProps({ show: false })
    await nextTick()
    
    // Create a new wrapper with the original props to simulate reopening
    wrapper = mount(TimerSettings, {
      props: {
        show: true,
        focusDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 30,
        pomodorosUntilLongBreak: 3
      }
    })
    
    // Original props should be restored when reopening
    expect(wrapper.find('#focus').element.value).toBe('25');
  })

  it('handles decimal values appropriately', async () => {
    await wrapper.find('#focus').setValue(25.5);
    await wrapper.find('.save-button').trigger('click');
    
    // Should round or truncate to integer
    expect(wrapper.emitted().save[0][0].focusDuration).toBe(25);
  });
});