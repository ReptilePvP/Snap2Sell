import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  CameraIcon, 
  ClockIcon, 
  StarIcon, 
  UserIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  CameraIcon as CameraIconSolid, 
  ClockIcon as ClockIconSolid, 
  StarIcon as StarIconSolid, 
  UserIcon as UserIconSolid,
  ChartBarIcon as ChartBarIconSolid
} from '@heroicons/react/24/solid';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [isGestureActive, setIsGestureActive] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const navigation = [
    { 
      name: 'Home', 
      href: '/', 
      icon: HomeIcon, 
      iconSolid: HomeIconSolid 
    },
    { 
      name: 'Camera', 
      href: '/camera', 
      icon: CameraIcon, 
      iconSolid: CameraIconSolid 
    },
    { 
      name: 'Analyze', 
      href: '/analyze', 
      icon: ChartBarIcon, 
      iconSolid: ChartBarIconSolid 
    },
    { 
      name: 'History', 
      href: '/history', 
      icon: ClockIcon, 
      iconSolid: ClockIconSolid 
    },
    { 
      name: 'Saved', 
      href: '/saved', 
      icon: StarIcon, 
      iconSolid: StarIconSolid 
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: UserIcon, 
      iconSolid: UserIconSolid 
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // Handle gesture-based navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth < 1024) { // Only on mobile/tablet
      const touch = e.touches[0];
      setTouchStartX(touch.clientX);
      
      // Only start gesture if touching near left edge (within 20px)
      if (touch.clientX <= 20) {
        setIsGestureActive(true);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isGestureActive) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    
    // Open menu when swiping right from left edge
    if (deltaX > 50 && !isMobileMenuOpen) {
      setIsMobileMenuOpen(true);
      setIsGestureActive(false);
    }
  };

  const handleTouchEnd = () => {
    setIsGestureActive(false);
    setTouchStartX(0);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && overlayRef.current && 
          !drawerRef.current?.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  return (
    <div 
      className="min-h-screen bg-gray-50 dark:bg-gray-900 page-transition"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 pb-4 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-16 shrink-0 items-center">
            <Link to="/" className="flex items-center space-x-2 touch-feedback">
              <Logo size="md" />
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const active = isActive(item.href);
                    const Icon = active ? item.iconSolid : item.icon;
                    
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-all duration-200 touch-feedback ${
                            active
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Icon className="h-6 w-6 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <ThemeToggle />
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden safe-area-top">
        <div className="flex h-16 items-center justify-between px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="touch-target p-2 text-gray-700 dark:text-gray-300 touch-feedback rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center space-x-2 touch-feedback rounded-lg p-2">
              <Logo size="sm" />
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div 
            ref={overlayRef}
            className="mobile-nav-overlay active" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div 
            ref={drawerRef}
            className="mobile-nav-drawer active safe-area-top"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <Link 
                to="/" 
                className="flex items-center space-x-2 touch-feedback rounded-lg p-2" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Logo size="sm" />
              </Link>
              <button
                type="button"
                className="touch-target p-2 text-gray-700 dark:text-gray-300 touch-feedback rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 px-4 py-6">
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const active = isActive(item.href);
                  const Icon = active ? item.iconSolid : item.icon;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex gap-x-3 rounded-xl p-4 text-base font-semibold transition-all duration-200 touch-feedback ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-6 w-6 shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-3 p-3">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-72 safe-area-bottom">
        <main className="py-6 lg:py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
