import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import { Profile } from '../types/profile';
import { supabase } from '../lib/supabase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  existingProfile?: Partial<Profile>;
  isNewUser?: boolean;
  onProfileUpdated?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userId,
  existingProfile,
  isNewUser = false,
  onProfileUpdated,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [hideDisplayName, setHideDisplayName] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingProfile) {
      setFirstName(existingProfile.first_name || '');
      setLastName(existingProfile.last_name || '');
      setUsername(existingProfile.username || '');
      setDisplayName(existingProfile.display_name || '');
      setHideDisplayName(existingProfile.hide_display_name || false);
    }
  }, [existingProfile]);

  const validateUsername = (username: string) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!validateUsername(username)) {
      setError('Username must be 3-20 characters long and can only contain letters, numbers, and underscores');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          username,
          display_name: displayName || `${firstName} ${lastName}`,
          hide_display_name: hideDisplayName,
          is_profile_complete: true,
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      if (onProfileUpdated) {
        onProfileUpdated();
      }
      onClose();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isNewUser && existingProfile && !existingProfile.is_profile_complete) {
      localStorage.setItem(`profile_dismissed_${userId}`, 'true');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 w-full max-w-md rounded-xl shadow-2xl border border-gray-700"
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {isNewUser ? 'Complete Your Profile' : 'Edit Profile'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="e.g., john_doe"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you want to be known"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setHideDisplayName(!hideDisplayName)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              {hideDisplayName ? (
                <>
                  <EyeOff size={18} />
                  <span>Name Hidden</span>
                </>
              ) : (
                <>
                  <Eye size={18} />
                  <span>Name Visible</span>
                </>
              )}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={18} />
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};