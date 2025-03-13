import { jest } from '@jest/globals';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
};

const mockClassList = {
  toggle: jest.fn(),
};

// Set up global mocks before each test
beforeEach(() => {
  // Setup localStorage mock
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  Object.defineProperty(document.documentElement, 'classList', { value: mockClassList });

  // Mock window.matchMedia
  window.matchMedia = jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));

  // Mock Audio
  window.Audio = jest.fn().mockImplementation(() => ({
    play: jest.fn(),
  }));

  // Mock Notification API
  window.Notification = class {
    constructor(title, options) {
      jest.fn()(title, options);
    }
    static permission = 'granted';
    static requestPermission = jest.fn().mockResolvedValue('granted');
  };

  // Clear all mocks
  jest.clearAllMocks();
});

afterEach(() => {
  // Reset all mocks
  jest.resetAllMocks();
});