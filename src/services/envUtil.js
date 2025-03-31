// Environment utility to validate required environment variables
const requiredEnvVars = {
  'VUE_APP_MICROSOFT_CLIENT_ID': 'Microsoft Client ID',
  'VUE_APP_GOOGLE_CLIENT_ID': 'Google Client ID',
  'VUE_APP_GOOGLE_API_KEY': 'Google API Key'
};

// Check if all required environment variables are defined
const validateEnv = () => {
  const missingVars = [];
  
  Object.keys(requiredEnvVars).forEach(key => {
    if (!process.env[key]) {
      missingVars.push(requiredEnvVars[key]);
    }
  });
  
  if (missingVars.length > 0) {
    console.warn(`Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('Task integration features might not work correctly.');
    return false;
  }
  
  return true;
};

export default {
  validateEnv
};