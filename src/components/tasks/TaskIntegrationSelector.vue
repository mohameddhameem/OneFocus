<script setup>
import { ref, onMounted } from 'vue';
import microsoftAuthService from '../../services/auth/microsoftAuth';
import googleAuthService from '../../services/auth/googleAuth';

// Integration state
const activeIntegration = ref('local'); // 'microsoft', 'google', or 'local'
const isAuthenticated = ref(false);
const isLoading = ref(false);
const error = ref(null);
const showIntegrationOptions = ref(false);

// Emit events to parent component
const emit = defineEmits(['integration-changed']);

// Check if the user is already authenticated on component mount
onMounted(async () => {
  isLoading.value = true;
  
  try {
    // Try to initialize Microsoft auth - silently handle errors
    try {
      const microsoftInitialized = await microsoftAuthService.initialize();
      if (microsoftInitialized && microsoftAuthService.isSignedIn()) {
        activeIntegration.value = 'microsoft';
        isAuthenticated.value = true;
        emit('integration-changed', 'microsoft');
        isLoading.value = false;
        return;
      }
    } catch (msError) {
      // Silently handle Microsoft auth errors - user doesn't need to see these
      console.log('Microsoft auth not available:', msError.message);
    }
    
    // Try to initialize Google auth - silently handle errors
    try {
      const googleInitialized = await googleAuthService.initialize();
      if (googleInitialized && googleAuthService.isSignedIn()) {
        activeIntegration.value = 'google';
        isAuthenticated.value = true;
        emit('integration-changed', 'google');
        isLoading.value = false;
        return;
      }
    } catch (googleError) {
      // Silently handle Google auth errors - user doesn't need to see these
      console.log('Google auth not available:', googleError.message);
    }
    
    // If no auth is active, use local storage - this is the default
    activeIntegration.value = 'local';
    emit('integration-changed', 'local');
  } catch (err) {
    // Silently handle any other errors and default to local
    console.log('Auth initialization error (falling back to local):', err.message);
    activeIntegration.value = 'local';
    emit('integration-changed', 'local');
  } finally {
    isLoading.value = false;
  }
});

// Sign in with Microsoft
const signInWithMicrosoft = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    await microsoftAuthService.signIn();
    activeIntegration.value = 'microsoft';
    isAuthenticated.value = true;
    emit('integration-changed', 'microsoft');
    showIntegrationOptions.value = false;
  } catch (err) {
    error.value = 'Microsoft sign-in failed: ' + err.message;
  } finally {
    isLoading.value = false;
  }
};

// Sign in with Google
const signInWithGoogle = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    await googleAuthService.signIn();
    activeIntegration.value = 'google';
    isAuthenticated.value = true;
    emit('integration-changed', 'google');
    showIntegrationOptions.value = false;
  } catch (err) {
    error.value = 'Google sign-in failed: ' + err.message;
  } finally {
    isLoading.value = false;
  }
};

// Sign out
const signOut = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    if (activeIntegration.value === 'microsoft') {
      await microsoftAuthService.signOut();
    } else if (activeIntegration.value === 'google') {
      await googleAuthService.signOut();
    }
    
    activeIntegration.value = 'local';
    isAuthenticated.value = false;
    emit('integration-changed', 'local');
    showIntegrationOptions.value = false;
  } catch (err) {
    error.value = 'Sign-out failed: ' + err.message;
  } finally {
    isLoading.value = false;
  }
};

// Toggle showing integration options
const toggleIntegrationOptions = () => {
  showIntegrationOptions.value = !showIntegrationOptions.value;
};

// Use local tasks (default)
const useLocalTasks = () => {
  activeIntegration.value = 'local';
  isAuthenticated.value = false;
  emit('integration-changed', 'local');
  showIntegrationOptions.value = false;
};
</script>

<template>
  <div class="task-integration-selector">
    <button @click="toggleIntegrationOptions" class="integration-toggle-btn" :disabled="isLoading">
      <span v-if="isLoading" class="loading-dots">
        <span></span><span></span><span></span>
      </span>
      <template v-else>
        <svg v-if="activeIntegration === 'local'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="9" x2="15" y2="9"></line>
          <line x1="9" y1="12" x2="15" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        <svg v-else-if="activeIntegration === 'microsoft'" width="18" height="18" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
          <path fill="#f25022" d="M1 1h10v10H1z"/>
          <path fill="#00a4ef" d="M1 12h10v10H1z"/>
          <path fill="#7fba00" d="M12 1h10v10H12z"/>
          <path fill="#ffb900" d="M12 12h10v10H12z"/>
        </svg>
        <svg v-else-if="activeIntegration === 'google'" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      </template>
    </button>
    
    <div v-if="showIntegrationOptions" class="integration-dropdown">
      <div class="integration-option" @click="useLocalTasks" :class="{ active: activeIntegration === 'local' }">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="9" x2="15" y2="9"></line>
          <line x1="9" y1="12" x2="15" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        <span>Local Tasks</span>
      </div>
      
      <template v-if="!isAuthenticated">
        <div class="integration-option" @click="signInWithMicrosoft">
          <svg width="18" height="18" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
            <path fill="#f25022" d="M1 1h10v10H1z"/>
            <path fill="#00a4ef" d="M1 12h10v10H1z"/>
            <path fill="#7fba00" d="M12 1h10v10H12z"/>
            <path fill="#ffb900" d="M12 12h10v10H12z"/>
          </svg>
          <span>Microsoft Todo</span>
        </div>
        
        <div class="integration-option" @click="signInWithGoogle">
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Google Tasks</span>
        </div>
      </template>
      
      <div v-else class="integration-option sign-out" @click="signOut">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span>Sign Out</span>
      </div>
    </div>
    
    <div v-if="error" class="error-toast">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.task-integration-selector {
  position: relative;
}

.integration-toggle-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--color-text);
  opacity: 0.6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.integration-toggle-btn:hover {
  opacity: 1;
  background-color: var(--color-background-soft);
}

.integration-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 0.5rem;
  overflow: hidden;
}

.integration-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.integration-option:hover {
  background-color: var(--color-background-soft);
}

.integration-option.active {
  background-color: var(--color-background-mute);
  font-weight: 500;
}

.integration-option.sign-out {
  border-top: 1px solid var(--color-border);
  color: #d32f2f;
}

.loading-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.loading-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--color-text);
  animation: dot-flashing 1s infinite alternate;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-flashing {
  0% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
}

.error-toast {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: #ffebee;
  color: #d32f2f;
  border-radius: 4px;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-width: 250px;
  z-index: 1001;
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .integration-dropdown {
    width: 180px;
  }
  
  .integration-option {
    padding: 0.6rem 0.75rem;
    font-size: 0.9rem;
  }
}
</style>