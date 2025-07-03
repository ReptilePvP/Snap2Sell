import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon,
  KeyIcon,
  BellIcon,
  TrashIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/LoadingSpinner';
import ThemeToggle from '../components/ThemeToggle';

const AccountSettingsPage: React.FC = () => {
  const { user, updateProfile, updatePassword, deleteAccount } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    analysisComplete: true,
    weeklyDigest: true,
  });

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setIsLoading(true);
    try {
      if (updateProfile) {
        await updateProfile(profileData);
        showToast('success', 'Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      showToast('error', 'Failed to update profile', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      if (updatePassword) {
        await updatePassword(passwordData.newPassword);
        showToast('success', 'Password updated successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      }
    } catch (error) {
      showToast('error', 'Failed to update password', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure? This action cannot be undone.')) {
      setShowDeleteConfirm(false);
      return;
    }

    setIsLoading(true);
    try {
      if (deleteAccount) {
        await deleteAccount();
        showToast('success', 'Account deleted successfully');
        navigate('/welcome');
      }
    } catch (error) {
      showToast('error', 'Failed to delete account', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and security</p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <UserIcon className="h-6 w-6 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
          </div>
        </div>
        
        <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                disabled={!isEditing}
                className="input"
                placeholder="Enter your username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                disabled={!isEditing}
                className="input"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
            </div>
            <div className="flex space-x-3">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setProfileData({ name: user?.name || '', email: user?.email || '' });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary flex items-center space-x-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : isEditing ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <span>Edit Profile</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Password & Security */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <KeyIcon className="h-6 w-6 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Password & Security</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {!showPasswordForm ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Password</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last updated recently</p>
              </div>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="btn btn-secondary"
              >
                Change Password
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input pr-10"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.current ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input pr-10"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.new ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="input pr-10"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.confirm ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <BellIcon className="h-6 w-6 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {Object.entries({
            emailNotifications: 'Email Notifications',
            pushNotifications: 'Push Notifications',
            analysisComplete: 'Analysis Complete Alerts',
            weeklyDigest: 'Weekly Digest'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {key === 'emailNotifications' && 'Receive notifications via email'}
                  {key === 'pushNotifications' && 'Receive push notifications in your browser'}
                  {key === 'analysisComplete' && 'Get notified when analysis is complete'}
                  {key === 'weeklyDigest' && 'Receive weekly summary of your activity'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings[key as keyof typeof notificationSettings]}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    [key]: e.target.checked
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>



      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Theme</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose between light and dark mode</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 overflow-hidden">
        <div className="p-6 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-400">Danger Zone</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-900 dark:text-red-400">Delete Account</h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Delete Account
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <TrashIcon className="h-4 w-4" />
                      <span>Confirm Delete</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
