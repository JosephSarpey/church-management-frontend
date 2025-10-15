"use client";

import { useState } from 'react';
import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  CalendarCheck, 
  Wallet, 
  FileText,
  ChevronLeft,
  ChevronRight,
  GaugeCircle,
  CalendarDays,
  Settings,
} from 'lucide-react';
import Image from 'next/image';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}

const NavItem = ({ href, icon, label, isCollapsed }: NavItemProps) => (
  <Link 
    href={href} 
    className={`group flex items-center px-3 py-2.5 rounded-lg transition-all ${
      isCollapsed ? 'justify-center' : 'space-x-3'
    } text-amber-900 dark:text-amber-100 hover:bg-gradient-to-r from-amber-400/80 to-amber-300/80 dark:from-amber-700/70 dark:to-amber-800/60 hover:text-amber-900 dark:hover:text-white`}
    title={isCollapsed ? label : undefined}
  >
    <span className="flex-shrink-0">{icon}</span>
    {!isCollapsed && <span className="truncate">{label}</span>}
  </Link>
);

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { href: "/", icon: <GaugeCircle size={20} />, label: "Dashboard" },
    { href: "/members", icon: <Users size={20} />, label: "Members" },
    { href: "/attendance", icon: <CalendarCheck size={20} />, label: "Attendance" },
    { href: "/tithes", icon: <Wallet size={20} />, label: "Tithes" },
    { href: "/events", icon: <CalendarDays size={20} />, label: "Events" },
    { href: "/reports", icon: <FileText size={20} />, label: "Reports" },
  ];

  const bottomNavItems = [
    { href: "/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <aside 
      className={`h-screen sticky top-0 flex flex-col flex-shrink-0 overflow-y-auto transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-gradient-to-br from-amber-300 via-amber-100 to-amber-50 dark:from-amber-800 dark:via-amber-900/90 dark:to-stone-900 border-r border-amber-400/30 dark:border-amber-700/40`}
    >
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/zion_logo.jpeg"
                alt="Logo"
                width={32}
                height={32}
                className='rounded-full border-2 border-amber-500/30'
              />
              <span className="text-xl font-bold whitespace-nowrap text-amber-900 dark:text-amber-200">ZCW</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-full hover:bg-amber-100/50 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-amber-400/30 dark:border-amber-700/40">
        <nav className="space-y-1">
          {bottomNavItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
