"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';

// Dynamically import, without SSR
const NotificationDropdown = dynamic(
  () => import('./ui/NotificationDropdown'),
  { ssr: false, loading: () => <div className="w-6 h-6"></div> }
);

interface NavLink {
  name: string;
  href: string;
  isProtected: boolean;
}

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  
  const navLinks: NavLink[] = [
    { name: 'Home', href: '/', isProtected: false },
    { name: 'Packages', href: '/stake-packages', isProtected: false },
    { name: 'About Us', href: '/about', isProtected: false },
    { name: 'Dashboard', href: '/dashboard', isProtected: true },
    { name: 'My Stakes', href: '/dashboard/my-stakes', isProtected: true },
    { name: 'Profile', href: '/profile', isProtected: true },
  ];

  // Don't show protected links if user is not logged in
  const filteredLinks = navLinks.filter(link => !link.isProtected || isAuthenticated);

  const handleLogout = () => {
    logout();
  };

  // Safe function to render NotificationDropdown component
  const renderNotificationDropdown = () => {
    try {
      // Show if authentication is ready and user is logged in
      if (isAuthenticated && user) {
        return <NotificationDropdown />;
      }
      return null;
    } catch (error) {
      console.error('NotificationDropdown render error:', error);
      return null; // Show nothing in case of error
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 py-2 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="tracking-widest text-teal-400 font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500">
                XEIN 
              </Link>
              
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {filteredLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${
                    pathname === link.href
                      ? 'border-teal-500 text-white'
                      : 'border-transparent text-gray-300 hover:border-gray-400 hover:text-white'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Social Media Icons - Always visible */}
            <div className="flex space-x-2 mr-4">
              <a href="https://web3.binance.com/en/token/bsc/0x31c38e4ebf378b3292e15871c7ed8b86537cd564"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Binance"
                className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition"
                title="Binance"
              >
                <img
                  src="/images/binance-logo.svg"
                  alt="Binance Logo"
                  className="w-5 h-5 object-contain"
                  loading="lazy"
                />
              </a>
              <a href="https://t.me/+A9xCNCQDbzU0YzE0"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram Kanalı"
                className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition"
                title="Telegram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-current"
                >
                  <path d="M9.036 14.534 8.88 18.3c.34 0 .49-.146.667-.32l1.6-1.54 3.314 2.43c.607.334 1.04.16 1.207-.56l2.187-10.25v-.001c.2-.934-.34-1.3-.94-1.073L4.56 9.64c-.9.35-.887.855-.153 1.084l3.1.965 7.216-4.55c.34-.206.65-.092.395.114l-6.082 5.28z" />
                </svg>
              </a>
            </div>

            {/* User Authentication Section */}
            {isAuthenticated ? (
              <div className="flex space-x-4 items-center">
                {renderNotificationDropdown()}
                
                <span className="text-white font-medium text-sm">
                  {user?.firstName ? user.firstName.toUpperCase() : ''}
                </span>
                
                <button 
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-teal-600 text-white hover:bg-teal-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            {/* Mobile Social Media Icons */}
            <div className="flex space-x-2 mr-3">
              <a href="https://web3.binance.com/en/token/bsc/0x31c38e4ebf378b3292e15871c7ed8b86537cd564"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Binance"
                className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition"
                title="Binance"
              >
                <img
                  src="/images/binance-logo.svg"
                  alt="Binance Logo"
                  className="w-4 h-4 object-contain"
                  loading="lazy"
                />
              </a>
              <a href="https://t.me/+A9xCNCQDbzU0YzE0"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram Kanalı"
                className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition"
                title="Telegram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-4 h-4 fill-current"
                >
                  <path d="M9.036 14.534 8.88 18.3c.34 0 .49-.146.667-.32l1.6-1.54 3.314 2.43c.607.334 1.04.16 1.207-.56l2.187-10.25v-.001c.2-.934-.34-1.3-.94-1.073L4.56 9.64c-.9.35-.887.855-.153 1.084l3.1.965 7.216-4.55c.34-.206.65-.092.395.114l-6.082 5.28z" />
                </svg>
              </a>
            </div>

            {/* Mobile Notification Dropdown */}
            {isAuthenticated && (
              <div className="block px-2 py-1 mr-2">
                <NotificationDropdown />
              </div>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden bg-black/70 backdrop-blur-md">
          <div className="pt-2 pb-3 space-y-1">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${
                  pathname === link.href
                    ? 'bg-gray-900 border-teal-500 text-white'
                    : 'border-transparent text-gray-300 hover:bg-gray-800 hover:border-gray-600 hover:text-white'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-800">
            {isAuthenticated ? (
              <div className="space-y-1">
                {user && (
                  <div className="block pl-3 pr-4 py-2 text-base font-medium text-gray-200">
                    {user.firstName} {user.lastName}
                  </div>
                )}
                
               
                
                <Link
                  href="/profile"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-300 hover:bg-gray-800 hover:border-gray-600 hover:text-white"
                >
                  My Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-300 hover:bg-gray-800 hover:border-gray-600 hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/login"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-300 hover:bg-gray-800 hover:border-gray-600 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-300 hover:bg-gray-800 hover:border-gray-600 hover:text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}; 