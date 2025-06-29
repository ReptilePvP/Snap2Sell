import React from 'react';
import { 
  Cog6ToothIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useStats } from '../hooks/useStats';
import ThemeToggle from '../components/ThemeToggle';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const { stats, isLoading: statsLoading } = useStats();

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await signOut();
        showToast('success', 'Signed out successfully');
      } catch (error) {
        showToast('error', 'Failed to sign out');
      }
    }
  };

  const menuItems = [
    {
      icon: Cog6ToothIcon,
      title: 'Account Settings',
      description: 'Manage your account preferences',
      onClick: () => showToast('info', 'Coming soon', 'Account settings will be available soon'),
    },
    {
      icon: BellIcon,
      title: 'Notifications',
      description: 'Configure notification preferences',
      onClick: () => showToast('info', 'Coming soon', 'Notification settings will be available soon'),
    },
    {
      icon: ShieldCheckIcon,
      title: 'Privacy & Security',
      description: 'Manage your privacy settings',
      onClick: () => showToast('info', 'Coming soon', 'Privacy settings will be available soon'),
    },
    {
      icon: QuestionMarkCircleIcon,
      title: 'Help & Support',
      description: 'Get help and contact support',
      onClick: () => showToast('info', 'Coming soon', 'Help center will be available soon'),
    },
    {
      icon: InformationCircleIcon,
      title: 'About',
      description: 'Learn more about Snap2Sell',
      onClick: () => showToast('info', 'Snap2Sell v1.0.0', 'AI-powered item analysis platform'),
    },
  ];

  // Transform real stats into the format expected by the UI
  const statsData = [
    { label: 'Total Scans', value: statsLoading ? '...' : stats.totalScans.toString() },
    { label: 'Saved Items', value: statsLoading ? '...' : stats.savedItems.toString() },
    { label: 'This Month', value: statsLoading ? '...' : stats.thisMonth.toString() },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center space-x-6">
          <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.name || 'User'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {user?.email || 'user@example.com'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Theme:</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stat.value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Menu Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center space-x-4 p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <item.icon className="h-6 w-6 text-gray-400" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
              <div className="text-gray-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sign Out */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Snap2Sell v1.0.0
      </div>
    </div>
  );
};

export default ProfilePage;