import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  ShieldCheckIcon,
  PencilIcon,
  UserIcon,
  StarIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';
import { UserRole } from '../types';
import { useToast } from '../hooks/useToast';
import RoleGuard from '../components/RoleGuard';
import LoadingSpinner from '../components/LoadingSpinner';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  subscription_end_date?: string;
}

interface UserStatistics {
  role: UserRole;
  user_count: number;
  total_scans: number;
  unique_providers_used: number;
  avg_monthly_activity: number;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, email, role, created_at, subscription_end_date')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Load statistics
      const { data: statsData, error: statsError } = await supabase
        .from('user_statistics')
        .select('*');

      if (statsError) throw statsError;
      setStatistics(statsData || []);

    } catch (error) {
      console.error('Error loading admin data:', error);
      showToast('error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      showToast('success', `User role updated to ${newRole}`);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      showToast('error', 'Failed to update user role');
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <ShieldExclamationIcon className="h-5 w-5 text-purple-600" />;
      case 'paid': return <StarIcon className="h-5 w-5 text-yellow-600" />;
      case 'user': return <UserIcon className="h-5 w-5 text-blue-600" />;
      default: return <UserIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'paid': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'user': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin']} fallback={
      <div className="text-center py-12">
        <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          You need admin privileges to access this page.
        </p>
      </div>
    }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Panel
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage users, roles, and view system statistics
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statistics.map((stat) => (
            <div key={stat.role} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getRoleIcon(stat.role)}
                  <h3 className="ml-2 font-semibold text-gray-900 dark:text-white capitalize">
                    {stat.role} Users
                  </h3>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.user_count}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Total Scans:</span>
                  <span>{stat.total_scans}</span>
                </div>
                <div className="flex justify-between">
                  <span>Providers Used:</span>
                  <span>{stat.unique_providers_used}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              User Management
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((userProfile) => (
                  <tr key={userProfile.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {userProfile.name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {userProfile.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(userProfile.role)}`}>
                        {getRoleIcon(userProfile.role)}
                        <span className="ml-1 capitalize">{userProfile.role}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(userProfile.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {userProfile.subscription_end_date ? (
                        <span className={`px-2 py-1 rounded text-xs ${
                          new Date(userProfile.subscription_end_date) > new Date() 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {new Date(userProfile.subscription_end_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingUser === userProfile.id ? (
                        <div className="flex space-x-2">
                          <select
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                            defaultValue={userProfile.role}
                            onChange={(e) => updateUserRole(userProfile.id, e.target.value as UserRole)}
                          >
                            <option value="guest">Guest</option>
                            <option value="user">User</option>
                            <option value="paid">Paid</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingUser(userProfile.id)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit Role
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default AdminPanel;
