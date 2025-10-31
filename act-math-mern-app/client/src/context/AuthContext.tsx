import React, { useContext, useState, useEffect, createContext, ReactNode } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  isNewUser: boolean | null;
  setIsNewUser: React.Dispatch<React.SetStateAction<boolean | null>>;
  logout: () => Promise<void>;
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      // The loading state will be managed by the initializeUser effect
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const initializeUser = async (user: User) => {
      try {
        const response = await authenticatedFetch('/api/init-user', { method: 'POST' });
        setIsNewUser(response.isNewUser);
      } catch (error) {
        console.error("Failed to initialize user:", error);
        // If init fails, user might be logged out or there's a server issue.
        // In either case, we should stop loading.
        setIsNewUser(null); 
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      initializeUser(currentUser);
    } else {
      // If there's no user, we are not loading anymore.
      setLoading(false);
      setIsNewUser(null);
    }
  }, [currentUser]);

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    isNewUser,
    setIsNewUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
