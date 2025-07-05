import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { RoleService } from '../services/roleService';
import { UserRole, ApiProvider } from '../types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireProvider?: ApiProvider;
  requireImageEnhancer?: boolean;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

/**
 * Role-based access control component
 * Conditionally renders children based on user role and permissions
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requireProvider,
  requireImageEnhancer = false,
  fallback = null,
  showUpgradePrompt = false
}) => {
  const { user, permissions } = useAuth();

  // Check role-based access
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    if (showUpgradePrompt) {
      return <UpgradePrompt missingFeature="role" />;
    }
    return <>{fallback}</>;
  }

  // Check API provider access
  if (requireProvider && !RoleService.canUseProvider(user, requireProvider)) {
    if (showUpgradePrompt) {
      return <UpgradePrompt missingFeature="provider" provider={requireProvider} />;
    }
    return <>{fallback}</>;
  }

  // Check image enhancer access
  if (requireImageEnhancer && !permissions.canUseImageEnhancer) {
    if (showUpgradePrompt) {
      return <UpgradePrompt missingFeature="enhancer" />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface UpgradePromptProps {
  missingFeature: 'role' | 'provider' | 'enhancer';
  provider?: ApiProvider;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ missingFeature, provider }) => {
  const { user } = useAuth();

  const getPromptContent = () => {
    if (!user) {
      return {
        title: 'Sign In Required',
        description: 'Please sign in to access this feature.',
        action: 'Sign In'
      };
    }

    switch (missingFeature) {
      case 'provider':
        return {
          title: 'Premium Feature',
          description: `${provider} analysis is available with Premium plan.`,
          action: 'Upgrade to Premium'
        };
      case 'enhancer':
        return {
          title: 'Premium Feature',
          description: 'Image enhancement tools are available with Premium plan.',
          action: 'Upgrade to Premium'
        };
      default:
        return {
          title: 'Access Restricted',
          description: 'This feature requires a higher access level.',
          action: 'Contact Support'
        };
    }
  };

  const { title, description, action } = getPromptContent();

  return (
    <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
        <svg
          className="w-8 h-8 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-4V9m0 0V7m0 2h2m-2 0H10m12 5a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>
      <button 
        className="btn btn-primary"
        onClick={() => {
          // TODO: Implement navigation to upgrade/sign-in page
          console.log('Navigate to upgrade/signin');
        }}
      >
        {action}
      </button>
    </div>
  );
};

export default RoleGuard;
