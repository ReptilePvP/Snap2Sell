import React, { useState } from 'react';
import { 
  UserIcon, 
  StarIcon, 
  GiftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { RoleService } from '../services/roleService';

interface UserRoleIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export const UserRoleIndicator: React.FC<UserRoleIndicatorProps> = ({
  showDetails = false,
  className = ''
}) => {
  const { user } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);

  console.log('UserRoleIndicator: user =', user);
  console.log('UserRoleIndicator: user?.role =', user?.role);

  if (!user) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
          <UserIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Guest</span>
        </div>
      </div>
    );
  }

  const roleDisplay = RoleService.getRoleDisplayName(user.role);
  const subscriptionStatus = RoleService.getSubscriptionStatus(user);

  const getRoleIcon = () => {
    switch (user.role) {
      case 'admin':
        return <StarIcon className="h-4 w-4" />;
      case 'paid':
        return <GiftIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getRoleBadgeClasses = () => {
    const baseClasses = "flex items-center space-x-2 px-2 py-1 rounded-md text-sm font-medium";
    
    switch (user.role) {
      case 'admin':
        return `${baseClasses} bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300`;
      case 'paid':
        return `${baseClasses} bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300`;
      case 'user':
        return `${baseClasses} bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400`;
    }
  };

  if (!showDetails) {
    return (
      <div className={`relative ${className}`}>
        <div 
          className={getRoleBadgeClasses()}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {getRoleIcon()}
          <span>{roleDisplay}</span>
        </div>
        
        {showTooltip && (
          <div className="absolute z-10 w-64 p-3 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            <div className="text-sm">
              <div className="font-semibold text-gray-900 dark:text-white mb-1">
                {subscriptionStatus.status}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {subscriptionStatus.description}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const features = RoleService.getAvailableFeatures(user.role);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Role Badge */}
      <div className={getRoleBadgeClasses()}>
        {getRoleIcon()}
        <span>{roleDisplay}</span>
      </div>

      {/* Subscription Status */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-1">
          <div className={`w-2 h-2 rounded-full bg-${subscriptionStatus.color}-500`}></div>
          <span className="font-medium text-gray-900 dark:text-white">
            {subscriptionStatus.status}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {subscriptionStatus.description}
        </p>
      </div>

      {/* Feature Access */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Feature Access</h4>
        <div className="space-y-2">
          {features.map(({ feature, available, description }) => (
            <div key={feature} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {available ? (
                  <CheckIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <XMarkIcon className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    available 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {feature}
                  </span>
                  {!available && user.role !== 'admin' && (
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      Upgrade
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {user.role === 'user' && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button className="w-full btn btn-primary text-sm">
            Upgrade to Premium
          </button>
        </div>
      )}
    </div>
  );
};

export default UserRoleIndicator;
