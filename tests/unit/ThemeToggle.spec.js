import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import ThemeToggle from '../../src/components/ThemeToggle.vue'

describe('ThemeToggle.vue', () => {
  let wrapper;

  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }))
    });

    // Create a proper spy for classList.toggle using vi.spyOn
    const toggleSpy = vi.fn();
    document.documentElement.classList = { toggle: toggleSpy };
    vi.spyOn(document.documentElement.classList, 'toggle');

    wrapper = mount(ThemeToggle);
  });

  it('initializes with light theme by default', () => {
    expect(wrapper.vm.isDark).toBe(false);
    expect(wrapper.find('svg').attributes('viewBox')).toBe('0 0 24 24');
  });

  it('toggles theme when button is clicked', async () => {
    await wrapper.find('button').trigger('click');
    expect(wrapper.vm.isDark).toBe(true);
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');

    await wrapper.find('button').trigger('click');
    expect(wrapper.vm.isDark).toBe(false);
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark-theme', false);
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('loads theme from localStorage on mount', async () => {
    localStorage.getItem.mockReturnValue('dark');
    
    const wrapper = mount(ThemeToggle);
    expect(wrapper.vm.isDark).toBe(true);
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
  });

  it('uses system preference when no localStorage value exists', async () => {
    localStorage.getItem.mockReturnValue(null);
    window.matchMedia.mockImplementation(query => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));

    const wrapper = mount(ThemeToggle);
    expect(wrapper.vm.isDark).toBe(true);
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
  });

  it('displays correct button title based on current theme', async () => {
    expect(wrapper.find('button').attributes('title')).toBe('Switch to Dark Mode');
    
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('button').attributes('title')).toBe('Switch to Light Mode');
  });
});