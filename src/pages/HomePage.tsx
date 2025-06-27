import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CameraIcon, 
  PhotoIcon, 
  ClockIcon, 
  StarIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useStats } from '../hooks/useStats';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useStats();

  const features = [
    {
      name: 'Quick Scan',
      description: 'Instantly analyze items with your camera',
      icon: CameraIcon,
      href: '/camera',
      color: 'bg-blue-500',
    },
    {
      name: 'Upload Photo',
      description: 'Select from your photo library',
      icon: PhotoIcon,
      href: '/camera',
      color: 'bg-green-500',
    },
    {
      name: 'AI Analysis',
      description: 'Choose from multiple AI providers',
      icon: SparklesIcon,
      href: '/analyze',
      color: 'bg-purple-500',
    },
    {
      name: 'Recent Scans',
      description: 'View your analysis history',
      icon: ClockIcon,
      href: '/history',
      color: 'bg-orange-500',
    },
    {
      name: 'Saved Items',
      description: 'Access your favorite analyses',
      icon: StarIcon,
      href: '/saved',
      color: 'bg-yellow-500',
    },
    {
      name: 'Analytics',
      description: 'Track your scanning activity',
      icon: ChartBarIcon,
      href: '/analyze',
      color: 'bg-indigo-500',
    },
  ];

  // Transform real stats into the format expected by the UI
  const statsData = [
    { label: 'Total Scans', value: statsLoading ? '...' : stats.totalScans.toString() },
    { label: 'Saved Items', value: statsLoading ? '...' : stats.savedItems.toString() },
    { label: 'This Month', value: statsLoading ? '...' : stats.thisMonth.toString() },
  ];

  const recentActivity = [
    { name: 'Vintage Lamp Analysis', time: '2 hours ago', value: '$45-65' },
    { name: 'Old Book Valuation', time: '1 day ago', value: '$15-25' },
    { name: 'Sneaker Price Check', time: '2 days ago', value: '$120-180' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-blue-100 text-lg">
            Discover the value of your items instantly with AI-powered analysis
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.name}
              to={feature.href}
              className="group relative bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`${feature.color} p-3 rounded-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Recent Activity
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentActivity.map((item, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.time}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-green-600 dark:text-green-400">
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700">
            <Link
              to="/history"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
            >
              View all activity →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;