import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser as setUserAction, clearUser } from '../store/userSlice';
import { clearJobSeeker } from '../store/jobSeekerSlice';
import { clearEmployer } from '../store/employerSlice';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.user.user);
  const [user, setUser] = useState(null);

  // Sync Redux user to local state
  useEffect(() => {
    if (reduxUser) {
      setUser(reduxUser);
    }
  }, [reduxUser]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const reduxStored = localStorage.getItem('reduxUserState');
    
    // Try Redux persisted state first, then fall back to old 'user' key
    let userToRestore = null;
    if (reduxStored) {
      try {
        const reduxState = JSON.parse(reduxStored);
        userToRestore = reduxState.user;
      } catch (e) {
        console.error('Failed to parse Redux user state', e);
      }
    }
    
    // Fall back to old localStorage key if Redux state not found
    if (!userToRestore && stored) {
      try {
        userToRestore = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }

    if (userToRestore) {
      setUser(userToRestore);
      // Sync to Redux
      dispatch(setUserAction(userToRestore));
    }
  }, [dispatch]);

  const login = (userData, token) => {
    setUser(userData);
    dispatch(setUserAction(userData));
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      if (token) localStorage.setItem('token', token);
    } catch (e) {
      console.error('Failed to store user', e);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (e) {
      console.error('Failed during logout localStorage cleanup', e);
    }
    setUser(null);
    dispatch(clearUser());
    dispatch(clearJobSeeker());
    dispatch(clearEmployer());
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;
