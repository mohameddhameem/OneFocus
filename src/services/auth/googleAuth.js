// Google Authentication Service
import { gapi } from 'gapi-script';

// Google API configuration
const GOOGLE_CLIENT_ID = process.env.VUE_APP_GOOGLE_CLIENT_ID; // Read from .env file
const API_KEY = process.env.VUE_APP_GOOGLE_API_KEY; // Read from .env file
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest'];
const SCOPES = 'https://www.googleapis.com/auth/tasks';

// Google Auth Service
export const googleAuthService = {
  // Initialize the auth service
  async initialize() {
    return new Promise((resolve, reject) => {
      try {
        gapi.load('client:auth2', async () => {
          try {
            await gapi.client.init({
              apiKey: API_KEY,
              clientId: GOOGLE_CLIENT_ID,
              discoveryDocs: DISCOVERY_DOCS,
              scope: SCOPES
            });
            
            // Check if user is already signed in
            if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
              resolve(true);
            } else {
              resolve(false);
            }
          } catch (error) {
            console.error('Error initializing Google client:', error);
            reject(error);
          }
        });
      } catch (error) {
        console.error('Error loading Google client:', error);
        reject(error);
      }
    });
  },

  // Sign in with Google
  async signIn() {
    try {
      const googleAuth = gapi.auth2.getAuthInstance();
      const googleUser = await googleAuth.signIn();
      return googleUser;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  },

  // Sign out from Google
  async signOut() {
    try {
      const googleAuth = gapi.auth2.getAuthInstance();
      await googleAuth.signOut();
      return true;
    } catch (error) {
      console.error('Error signing out from Google:', error);
      throw error;
    }
  },

  // Get access token for Google APIs
  getAccessToken() {
    try {
      const googleAuth = gapi.auth2.getAuthInstance();
      if (!googleAuth.isSignedIn.get()) {
        throw new Error('No signed-in user! Sign in before requesting an access token.');
      }
      
      const googleUser = googleAuth.currentUser.get();
      const authResponse = googleUser.getAuthResponse(true);
      return authResponse.access_token;
    } catch (error) {
      console.error('Error getting Google access token:', error);
      throw error;
    }
  },

  // Get current user info
  getCurrentUser() {
    try {
      const googleAuth = gapi.auth2.getAuthInstance();
      if (!googleAuth.isSignedIn.get()) {
        return null;
      }
      
      const googleUser = googleAuth.currentUser.get();
      const profile = googleUser.getBasicProfile();
      
      return {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl()
      };
    } catch (error) {
      console.error('Error getting Google user info:', error);
      return null;
    }
  },

  // Check if user is signed in
  isSignedIn() {
    try {
      const googleAuth = gapi.auth2.getAuthInstance();
      return googleAuth.isSignedIn.get();
    } catch (error) {
      console.error('Error checking Google sign-in status:', error);
      return false;
    }
  }
};

export default googleAuthService;