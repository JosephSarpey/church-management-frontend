'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';

export function QueryProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
      },
    },
  }));

  // Set up axios interceptor to add Clerk session token to requests
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        // Get the session token from Clerk
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      // Clean up the interceptor when the component unmounts
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [getToken]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
