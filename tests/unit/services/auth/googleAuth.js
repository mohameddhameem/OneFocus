// Mock implementation of Google Auth service for testing
export default {
  initialize: jest.fn().mockResolvedValue(true),
  signIn: jest.fn().mockResolvedValue(true),
  signOut: jest.fn().mockResolvedValue(true),
  isAuthenticated: jest.fn().mockReturnValue(false),
  isSignedIn: jest.fn().mockReturnValue(false)
};