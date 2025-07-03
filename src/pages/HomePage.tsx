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
import { StatsSkeleton, ListSkeleton } from '../components/Skeleton';
import PullToRefresh from '../components/PullToRefresh';
import MobileCard from '../components/MobileCard';

import { useRecentActivity } from '../hooks/useRecentActivity';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading, refreshStats } = useStats();
  const { recentActivity, isLoading: activityLoading } = useRecentActivity();

  const handleRefresh = async () => {
    refreshStats();
    // Note: useRecentActivity doesn't have a refresh method, so we'll just refresh stats for now
  };

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
      name: 'Image Enhancements',
      description: 'Auto-rotation, background removal, dimensions',
      icon: SparklesIcon,
      href: '/demo/enhancements',
      color: 'bg-pink-500',
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

  const formatTimestamp = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(120,119,198,0.2),transparent_50%)]" />
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
        <div className="relative z-10 space-y-8">
          {/* Welcome Header */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 text-white">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className="text-white/80 text-lg">
                Discover the value of your items instantly with AI-powered analysis
              </p>
            </div>
          </div>

          {/* Stats */}
          {statsLoading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statsData.map((stat) => (
                <MobileCard 
                  key={stat.label} 
                  className="!p-6 bg-white/10 backdrop-blur-lg border-white/20"
                  variant="elevated"
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-300">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/60 mt-1">
                      {stat.label}
                    </div>
                  </div>
                </MobileCard>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Link
                  key={feature.name}
                  to={feature.href}
                >
                  <MobileCard 
                    interactive
                    className="group !p-6 h-full bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300"
                    variant="elevated"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`${feature.color} p-3 rounded-lg shadow-lg`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300">
                          {feature.name}
                        </h3>
                        <p className="text-sm text-white/70">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </MobileCard>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Recent Activity
            </h2>
            <MobileCard variant="elevated" className="overflow-hidden bg-white/10 backdrop-blur-lg border-white/20">
              <div className="divide-y divide-white/10">
                {activityLoading ? (
                  <div className="p-6">
                    <ListSkeleton items={3} />
                  </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-white">
                            {item.title}
                          </h3>
                          <p className="text-sm text-white/60">
                            {formatTimestamp(item.timestamp)}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-green-300">
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-white/60">
                    <p>No recent activity found.</p>
                  </div>
                )}
              </div>
              <div className="p-4 bg-white/5">
                <Link
                  to="/history"
                  className="text-sm font-medium text-blue-300 hover:text-blue-200"
                >
                  View all activity →
                </Link>
              </div>
            </MobileCard>
          </div>
        </div>
      </PullToRefresh>
    </div>
  );
};

export default HomePage;