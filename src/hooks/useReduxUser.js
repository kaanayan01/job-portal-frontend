import { useSelector } from 'react-redux';

/**
 * Custom hook to get the current user from Redux store.
 * Returns user object if logged in, otherwise null.
 */
export function useReduxUser() {
  const user = useSelector((state) => state.user.user);
  return user;
}

/**
 * Custom hook to get the current token from Redux store.
 * Returns token string if available, otherwise null.
 */
export function useReduxToken() {
  const token = useSelector((state) => state.user.token);
  return token;
}

export function useReduxJobSeeker() {
  return useSelector((state) => state.jobSeeker);
}
export function useReduxEmployer() {
  return useSelector((state) => state.employer);
}