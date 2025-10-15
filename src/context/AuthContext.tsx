"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  syncUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: clerkUser, isSignedIn, isLoaded: isClerkLoaded } = useUser();

  const syncUser = useCallback(async () => {
    if (!isClerkLoaded) return;
    
    setIsLoading(true);
    setError(null);

    try {
      if (isSignedIn && clerkUser) {
        // Sync user with backend
        const response = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerkId: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to sync user with backend');
        }

        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error syncing user:', err);
      setError('Failed to sync user with backend');
    } finally {
      setIsLoading(false);
    }
  }, [isClerkLoaded, isSignedIn, clerkUser]);

  useEffect(() => {
    syncUser();
  }, [syncUser]);

  const signOut = async () => {
    try {
      window.location.href = '/api/auth/signout';
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, syncUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}