"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { NotificationDropdown } from './NotificationDropdown';
import Image from 'next/image';
import GradientText from '@/components/GradientText';
import Link from 'next/link';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);

  return matches;
}

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/zion_logo.jpeg"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            {isDesktop && (
              <GradientText
                colors={["#f59e0b", "#9ca3af", "#f59e0b"]}
                animationSpeed={5}
                showBorder={false}
                className="text-3xl font-extrabold"
              >
                ZION CHAPEL WORLDWIDE-THE SOLID CHURCH
              </GradientText>
            )}
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <SignedIn>
            <NotificationDropdown />
            <div className="ml-2">
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}