import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from './providers';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Zion Chapel Management System',
  description: 'Manage members, attendance, tithes, events, and reports',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-amber-600 hover:bg-amber-700 text-sm normal-case',
          footerActionLink: 'text-amber-600 hover:text-amber-700',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <QueryProvider>
            <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
          </QueryProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
