import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';

// Contextes optimisés
import { ThemeProvider } from '../contexts/ThemeContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { AuthProvider } from '../contexts/AuthContext';
import { PostesProvider } from '../contexts/PostesContext';
import { SessionsProvider } from '../contexts/SessionsContext';
import { GamingCenterMapProvider } from '../contexts/GamingCenterMapContext';
import { PaymentProvider } from '../contexts/PaymentContext';

// ✅ Configuration optimisée de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // ✅ Pas de refetch au focus
      refetchOnReconnect: true,
      refetchInterval: false, // ✅ Pas de refetch automatique
      refetchIntervalInBackground: false,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// ✅ Provider principal avec ordre optimal des contextes
const AppProviders = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <PaymentProvider>
                <PostesProvider>
                  <SessionsProvider>
                    <GamingCenterMapProvider>
                      {children}
                      {/* DevTools seulement en développement */}
                      {import.meta.env.DEV && (
                        <ReactQueryDevtools initialIsOpen={false} />
                      )}
                    </GamingCenterMapProvider>
                  </SessionsProvider>
                </PostesProvider>
              </PaymentProvider>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default AppProviders;