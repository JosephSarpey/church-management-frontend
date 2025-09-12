"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CalendarCheck, 
  Wallet, 
  Calendar, 
  FileText,
  ChevronLeft,
  ChevronRight,
  GaugeCircle
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
    className={`flex items-center px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
      isCollapsed ? 'justify-center' : 'space-x-3'
    }`}
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
    { href: "/events", icon: <Calendar size={20} />, label: "Events" },
    { href: "/reports", icon: <FileText size={20} />, label: "Reports" },
  ];

  return (
    <aside 
      className={`h-screen sticky top-0 flex-shrink-0 bg-white dark:bg-gray-800 shadow-md overflow-y-auto transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/zion_logo.jpeg"
                alt="Logo"
                width={32}
                height={32}
                className='rounded-full'
              />
              <span className="text-xl font-bold whitespace-nowrap">ZCW-Admin</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
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
    </aside>
  );
}
