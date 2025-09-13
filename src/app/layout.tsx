import './globals.css';
import { ReactNode } from 'react';
import { ThemeProvider } from './providers';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { headers } from 'next/headers';

export const metadata = {
  title: 'Zion Chapel Management System',
  description: 'Manage members, attendance, tithes, events, and reports',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAuthPage = pathname.startsWith('/auth');

  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full bg-gradient-to-br from-amber-100/90 via-amber-50/95 to-amber-50 dark:from-amber-900/30 dark:via-amber-900/20 dark:to-stone-900 text-stone-800 dark:text-stone-200">
        <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(circle_at_center,#f59e0b20_0,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,#92400e10_0,transparent_70%)]"></div>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {isAuthPage ? (
            <>{children}</>
          ) : (
            <div className="flex h-full relative">
              {/* Sidebar */}
              <div className="relative z-10">
                <Sidebar />
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
                <Navbar />
                <main className="flex-1 overflow-auto p-6">
                  {children}
                </main>
              </div>
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
