import React, { useContext, useState, useEffect, createContext, ReactNode } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

import { authenticatedFetch } from '../utils/api';

// ... (imports and context creation)

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const initializeUser = async (user: User) => {
      try {
        await authenticatedFetch('/api/users/init', { method: 'POST' });
      } catch (error) {
        console.error("Failed to initialize user:", error);
      }
    };

    if (currentUser) {
      initializeUser(currentUser);
    }
  }, [currentUser]);

  const value = {
    currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
