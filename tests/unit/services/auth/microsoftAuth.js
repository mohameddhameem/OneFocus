// Mock implementation of Microsoft Auth service for testing
export default {
  getAccessToken: jest.fn().mockResolvedValue('mock-access-token'),
  initialize: jest.fn().mockResolvedValue(true),
  signIn: jest.fn().mockResolvedValue(true),
  signOut: jest.fn().mockResolvedValue(true),
  isAuthenticated: jest.fn().mockReturnValue(false)
};