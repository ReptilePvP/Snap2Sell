import { UserRole, UserPermissions, User, ApiProvider } from '../types';

/**
 * Role-based access control utility service
 * Manages permissions and access levels for different user roles
 */
export class RoleService {
  /**
   * Get permissions for a user role
   */
  static getPermissions(user: User | null): UserPermissions {
    if (!user) {
      // Guest permissions - can preview but not use functions
      return {
        canUseGemini: false,
        canUseSerpAPI: false,
        canUseSearchAPI: false,
        canUseOpenLens: false,
        canUseImageEnhancer: false,
        canAccessAdminPanel: false,
        allowedProviders: []
      };
    }

    const role = user.role;
    const isSubscriptionActive = this.isSubscriptionActive(user);

    switch (role) {
      case 'admin':
        return {
          canUseGemini: true,
          canUseSerpAPI: true,
          canUseSearchAPI: true,
          canUseOpenLens: true,
          canUseImageEnhancer: true,
          canAccessAdminPanel: true,
          allowedProviders: [ApiProvider.GEMINI, ApiProvider.SERPAPI, ApiProvider.SEARCHAPI, ApiProvider.OPENLENS]
        };

      case 'paid':
        return {
          canUseGemini: true,
          canUseSerpAPI: isSubscriptionActive,
          canUseSearchAPI: isSubscriptionActive,
          canUseOpenLens: isSubscriptionActive,
          canUseImageEnhancer: isSubscriptionActive,
          canAccessAdminPanel: false,
          allowedProviders: isSubscriptionActive 
            ? [ApiProvider.GEMINI, ApiProvider.SERPAPI, ApiProvider.SEARCHAPI, ApiProvider.OPENLENS]
            : [ApiProvider.GEMINI]
        };

      case 'user':
        return {
          canUseGemini: true,
          canUseSerpAPI: false,
          canUseSearchAPI: false,
          canUseOpenLens: false,
          canUseImageEnhancer: false,
          canAccessAdminPanel: false,
          allowedProviders: [ApiProvider.GEMINI]
        };

      default:
        // Default to guest permissions
        return {
          canUseGemini: false,
          canUseSerpAPI: false,
          canUseSearchAPI: false,
          canUseOpenLens: false,
          canUseImageEnhancer: false,
          canAccessAdminPanel: false,
          allowedProviders: []
        };
    }
  }

  /**
   * Check if user's subscription is active
   */
  static isSubscriptionActive(user: User): boolean {
    if (!user.subscription_end_date) {
      // No end date means permanent subscription
      return true;
    }
    
    const endDate = new Date(user.subscription_end_date);
    const now = new Date();
    return endDate > now;
  }

  /**
   * Check if user can access a specific API provider
   */
  static canUseProvider(user: User | null, provider: ApiProvider): boolean {
    const permissions = this.getPermissions(user);
    return permissions.allowedProviders.includes(provider);
  }

  /**
   * Check if user can access image enhancement features
   */
  static canUseImageEnhancer(user: User | null): boolean {
    if (!user) return false;
    const permissions = this.getPermissions(user);
    return permissions.canUseImageEnhancer;
  }

  /**
   * Get user role display name
   */
  static getRoleDisplayName(role: UserRole): string {
    const roleNames = {
      guest: 'Guest',
      user: 'Free User',
      paid: 'Premium User',
      admin: 'Administrator'
    };
    return roleNames[role] || 'Unknown';
  }

  /**
   * Get user role description
   */
  static getRoleDescription(role: UserRole): string {
    const descriptions = {
      guest: 'Can preview the site but cannot use analysis functions',
      user: 'Can use Gemini AI analysis only',
      paid: 'Can use all analysis providers and image enhancer',
      admin: 'Full access to all features and admin panel'
    };
    return descriptions[role] || 'Unknown role';
  }

  /**
   * Get role color for UI display
   */
  static getRoleColor(role: UserRole): string {
    const colors = {
      guest: 'gray',
      user: 'blue',
      paid: 'purple',
      admin: 'red'
    };
    return colors[role] || 'gray';
  }

  /**
   * Get subscription status text
   */
  static getSubscriptionStatus(user: User): { status: string; color: string; description: string } {
    if (user.role === 'admin') {
      return {
        status: 'Administrator',
        color: 'red',
        description: 'Full access to all features'
      };
    }

    if (user.role === 'paid') {
      const isActive = this.isSubscriptionActive(user);
      if (isActive) {
        return {
          status: 'Premium Active',
          color: 'green',
          description: user.subscription_end_date 
            ? `Access until ${new Date(user.subscription_end_date).toLocaleDateString()}`
            : 'Unlimited premium access'
        };
      } else {
        return {
          status: 'Premium Expired',
          color: 'orange',
          description: 'Subscription has expired. Renew to access premium features.'
        };
      }
    }

    if (user.role === 'user') {
      return {
        status: 'Free Plan',
        color: 'blue',
        description: 'Upgrade to premium for access to all analysis providers'
      };
    }

    return {
      status: 'Guest',
      color: 'gray',
      description: 'Sign up to start analyzing images'
    };
  }

  /**
   * Get available features for user role
   */
  static getAvailableFeatures(role: UserRole): { feature: string; available: boolean; description: string }[] {
    const allFeatures = [
      { feature: 'Gemini AI Analysis', key: 'gemini' },
      { feature: 'SerpAPI Analysis', key: 'serpapi' },
      { feature: 'SearchAPI Analysis', key: 'searchapi' },
      { feature: 'OpenLens Analysis', key: 'openlens' },
      { feature: 'Image Enhancement', key: 'enhancer' },
      { feature: 'Admin Panel', key: 'admin' }
    ];

    const permissions = this.getPermissions({ role } as User);

    return allFeatures.map(({ feature, key }) => {
      let available = false;
      let description = 'Not available in your plan';

      switch (key) {
        case 'gemini':
          available = permissions.canUseGemini;
          description = available ? 'Advanced AI-powered image analysis' : 'Sign up to access Gemini AI';
          break;
        case 'serpapi':
          available = permissions.canUseSerpAPI;
          description = available ? 'Google Lens technology for web search' : 'Upgrade to premium for SerpAPI access';
          break;
        case 'searchapi':
          available = permissions.canUseSearchAPI;
          description = available ? 'Visual search for market comparisons' : 'Upgrade to premium for SearchAPI access';
          break;
        case 'openlens':
          available = permissions.canUseOpenLens;
          description = available ? 'Comprehensive analysis with web scraping' : 'Upgrade to premium for OpenLens access';
          break;
        case 'enhancer':
          available = permissions.canUseImageEnhancer;
          description = available ? 'Professional image enhancement tools' : 'Upgrade to premium for image enhancement';
          break;
        case 'admin':
          available = permissions.canAccessAdminPanel;
          description = available ? 'Administrative controls and user management' : 'Admin access only';
          break;
      }

      return { feature, available, description };
    });
  }

  /**
   * Check if user needs to upgrade for a feature
   */
  static needsUpgradeFor(user: User | null, feature: 'serpapi' | 'searchapi' | 'openlens' | 'enhancer'): boolean {
    if (!user) return true;
    
    const permissions = this.getPermissions(user);
    
    switch (feature) {
      case 'serpapi':
        return !permissions.canUseSerpAPI;
      case 'searchapi':
        return !permissions.canUseSearchAPI;
      case 'openlens':
        return !permissions.canUseOpenLens;
      case 'enhancer':
        return !permissions.canUseImageEnhancer;
      default:
        return false;
    }
  }
}
