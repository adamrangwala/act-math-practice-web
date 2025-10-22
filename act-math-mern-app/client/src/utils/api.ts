import { auth } from '../config/firebase';

const baseURL = import.meta.env.PROD ? import.meta.env.VITE_API_URL : '';

export const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No user is signed in to make this request.');
  }

  const token = await currentUser.getIdToken();

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
};
