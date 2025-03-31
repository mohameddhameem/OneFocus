// Microsoft Authentication Service
import * as msal from '@azure/msal-browser';

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: process.env.VUE_APP_MICROSOFT_CLIENT_ID, // Read from .env file
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  }
};

// Create MSAL instance
const msalInstance = new msal.PublicClientApplication(msalConfig);

// Login request parameters
const loginRequest = {
  scopes: ['User.Read', 'Tasks.ReadWrite']
};

// Microsoft Auth Service
export const microsoftAuthService = {
  // Initialize the auth service
  async initialize() {
    try {
      // Check if user is already logged in
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error initializing Microsoft auth:', error);
      return false;
    }
  },

  // Sign in with Microsoft
  async signIn() {
    try {
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      msalInstance.setActiveAccount(loginResponse.account);
      return loginResponse.account;
    } catch (error) {
      console.error('Error signing in with Microsoft:', error);
      throw error;
    }
  },

  // Sign out from Microsoft
  async signOut() {
    try {
      await msalInstance.logoutPopup();
      return true;
    } catch (error) {
      console.error('Error signing out from Microsoft:', error);
      throw error;
    }
  },

  // Get access token for Microsoft Graph API
  async getAccessToken() {
    try {
      const account = msalInstance.getActiveAccount();
      if (!account) {
        throw new Error('No active account! Sign in before requesting an access token.');
      }

      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: account
      });

      return response.accessToken;
    } catch (error) {
      // If silent token acquisition fails, try popup
      if (error instanceof msal.InteractionRequiredAuthError) {
        try {
          const response = await msalInstance.acquireTokenPopup(loginRequest);
          return response.accessToken;
        } catch (popupError) {
          console.error('Error acquiring token via popup:', popupError);
          throw popupError;
        }
      }
      console.error('Error acquiring token silently:', error);
      throw error;
    }
  },

  // Get current user info
  async getCurrentUser() {
    const account = msalInstance.getActiveAccount();
    return account;
  },

  // Check if user is signed in
  isSignedIn() {
    const account = msalInstance.getActiveAccount();
    return !!account;
  }
};

export default microsoftAuthService;