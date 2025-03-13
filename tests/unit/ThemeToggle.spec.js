import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ThemeToggle from '../../src/components/ThemeToggle.vue'

describe('ThemeToggle.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(ThemeToggle);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('initializes with light theme by default', async () => {
    await nextTick();
    expect(document.documentElement.classList.toggle).toHaveBeenLastCalledWith('dark-theme', false);
    expect(wrapper.find('button').attributes('title')).toBe('Switch to Dark Mode');
  });

  it('toggles theme when button is clicked', async () => {
    await wrapper.find('button').trigger('click');
    await nextTick();
    
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    expect(wrapper.find('button').attributes('title')).toBe('Switch to Light Mode');

    await wrapper.find('button').trigger('click');
    await nextTick();
    
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark-theme', false);
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    expect(wrapper.find('button').attributes('title')).toBe('Switch to Dark Mode');
  });

  it('loads theme from localStorage on mount', async () => {
    wrapper.unmount();
    
    localStorage.getItem.mockReturnValue('dark');
    wrapper = mount(ThemeToggle);
    await nextTick();
    
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
    expect(wrapper.find('button').attributes('title')).toBe('Switch to Light Mode');
  });

  it('uses system preference when no localStorage value exists', async () => {
    wrapper.unmount();
    
    localStorage.getItem.mockReturnValue(null);
    window.matchMedia.mockImplementation(query => ({
      matches: true,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }));
    
    wrapper = mount(ThemeToggle);
    await nextTick();
    
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
    expect(wrapper.find('button').attributes('title')).toBe('Switch to Light Mode');
  });
});