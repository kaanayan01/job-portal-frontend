import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import jobSeekerReducer from './jobSeekerSlice';
import employerReducer from './employerSlice';

// Load persisted state from localStorage
let persistedUserState = { user: null, token: null };
let persistedJobSeekerState = { jobSeeker: null };
let persistedEmployerState = { employer: null };
console.log("Store initialization - checking localStorage...");
try {
  const stored = localStorage.getItem('reduxUserState');
  console.log("Found reduxUserState in localStorage:", stored);
  if (stored) {
    persistedUserState = JSON.parse(stored);
    console.log("✓ Successfully loaded persisted Redux state:", persistedUserState);
  } else {
    console.log("✗ No reduxUserState in localStorage");
  }
  
  // Also check if token exists in jwtToken key (from api.js)
  const jwtToken = localStorage.getItem('jwtToken');
  console.log("Found jwtToken in localStorage:", jwtToken ? "yes" : "no");
  if (jwtToken && !persistedUserState.token) {
    persistedUserState.token = jwtToken;
    console.log("✓ Synced jwtToken to Redux state");
  }
} catch (e) {
  console.error('Failed to load persisted Redux state:', e);
}

console.log("Redux store initialized with preloadedState:", persistedUserState);

const store = configureStore({
  reducer: {
    user: userReducer,
    jobSeeker: jobSeekerReducer,
    employer: employerReducer,
  },

  preloadedState: {
    user: persistedUserState || { user: null, token: null },
    jobSeeker: persistedJobSeekerState || { jobSeeker: null },
    employer: persistedEmployerState || { employer: null },
  },
});

// Subscribe to store changes and persist user state to localStorage
store.subscribe(() => {
  const state = store.getState();
  console.log("Redux state changed, persisting:", state.user);
  try {
    localStorage.setItem('reduxUserState', JSON.stringify(state.user));
    // Also sync token to jwtToken key for api.js compatibility
    if (state.user.token) {
      localStorage.setItem('jwtToken', state.user.token);
    }
  } catch (e) {
    console.error('Failed to persist Redux state:', e);
  }
});

export default store;
