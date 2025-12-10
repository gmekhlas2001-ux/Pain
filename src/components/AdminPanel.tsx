import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, Users, Search, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminUserView } from '../types/profile';
import { Star as StarType } from '../types/star';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [stars, setStars] = useState<StarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [deletingStar, setDeletingStar] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'stars'>('users');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [promotingUser, setPromotingUser] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkSuperAdmin();
      fetchUsers();
      fetchStars();
    }
  }, [isOpen]);

  const checkSuperAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', user.id)
        .maybeSingle();

      setIsSuperAdmin(data?.is_super_admin || false);
    } catch (err) {
      console.error('Error checking super admin status:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .rpc('get_admin_users');

      if (fetchError) throw fetchError;
      setUsers(data || []);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStars = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('stars')
        .select(`
          *,
          profiles (
            username,
            display_name,
            hide_display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setStars(data || []);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to fetch stars');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingUser(userId);
      setError(null);

      const { error: deleteError } = await supabase
        .rpc('delete_user', { user_id: userId });

      if (deleteError) throw deleteError;

      setUsers(users.filter(user => user.user_id !== userId));
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to delete user');
    } finally {
      setDeletingUser(null);
    }
  };

  const handleDeleteStar = async (starId: string) => {
    if (!confirm('Are you sure you want to delete this star? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingStar(starId);
      setError(null);

      const { error: deleteError } = await supabase
        .from('stars')
        .delete()
        .eq('id', starId);

      if (deleteError) throw deleteError;

      setStars(stars.filter(star => star.id !== starId));
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to delete star');
    } finally {
      setDeletingStar(null);
    }
  };

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    try {
      setPromotingUser(userId);
      setError(null);

      const { error: toggleError } = await supabase
        .rpc('toggle_admin_status', { target_user_id: userId, make_admin: makeAdmin });

      if (toggleError) throw toggleError;

      await fetchUsers();
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to update admin status');
    } finally {
      setPromotingUser(null);
    }
  };

  const handleToggleSuperAdmin = async (userId: string, makeSuperAdmin: boolean) => {
    try {
      setPromotingUser(userId);
      setError(null);

      const { error: toggleError } = await supabase
        .rpc('toggle_super_admin_status', { target_user_id: userId, make_super_admin: makeSuperAdmin });

      if (toggleError) throw toggleError;

      await fetchUsers();
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to update super admin status');
    } finally {
      setPromotingUser(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower)
    );
  });

  const filteredStars = stars.filter(star => {
    const searchLower = searchTerm.toLowerCase();
    return (
      star.message.toLowerCase().includes(searchLower) ||
      star.profiles?.username?.toLowerCase().includes(searchLower) ||
      star.profiles?.display_name?.toLowerCase().includes(searchLower)
    );
  });

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 w-full max-w-4xl rounded-xl shadow-2xl border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeTab === 'users' ? (
                <Users className="w-6 h-6 text-blue-400" />
              ) : (
                <Star className="w-6 h-6 text-yellow-400" />
              )}
              <h2 className="text-xl font-semibold text-white">
                {activeTab === 'users' ? 'User Management' : 'Star Management'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Users size={18} />
              Users
            </button>
            <button
              onClick={() => setActiveTab('stars')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'stars'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Star size={18} />
              Stars
            </button>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'users' ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-3 text-gray-400 font-medium">Email</th>
                    <th className="pb-3 text-gray-400 font-medium">Name</th>
                    <th className="pb-3 text-gray-400 font-medium">Username</th>
                    <th className="pb-3 text-gray-400 font-medium">Role</th>
                    <th className="pb-3 text-gray-400 font-medium">Profile</th>
                    {isSuperAdmin && <th className="pb-3 text-gray-400 font-medium">Manage</th>}
                    <th className="pb-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={isSuperAdmin ? 7 : 6} className="py-4 text-center text-gray-400">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={isSuperAdmin ? 7 : 6} className="py-4 text-center text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.user_id} className="border-b border-gray-800">
                        <td className="py-4 text-white">{user.email}</td>
                        <td className="py-4 text-white">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : '-'}
                        </td>
                        <td className="py-4 text-white">
                          {user.username || '-'}
                        </td>
                        <td className="py-4">
                          <div className="flex gap-1">
                            {user.is_super_admin && (
                              <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                Super Admin
                              </span>
                            )}
                            {user.is_admin && !user.is_super_admin && (
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                Admin
                              </span>
                            )}
                            {!user.is_admin && !user.is_super_admin && (
                              <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">
                                User
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              user.is_profile_complete
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {user.is_profile_complete ? 'Complete' : 'Incomplete'}
                          </span>
                        </td>
                        {isSuperAdmin && (
                          <td className="py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleSuperAdmin(user.user_id, !user.is_super_admin)}
                                disabled={promotingUser === user.user_id}
                                className={`px-2 py-1 rounded text-xs transition-colors ${
                                  user.is_super_admin
                                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                                    : 'bg-gray-700 text-gray-300 hover:bg-purple-600 hover:text-white'
                                } ${promotingUser === user.user_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={user.is_super_admin ? 'Remove Super Admin' : 'Make Super Admin'}
                              >
                                Super
                              </button>
                              <button
                                onClick={() => handleToggleAdmin(user.user_id, !user.is_admin)}
                                disabled={promotingUser === user.user_id || user.is_super_admin}
                                className={`px-2 py-1 rounded text-xs transition-colors ${
                                  user.is_admin && !user.is_super_admin
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white'
                                } ${promotingUser === user.user_id || user.is_super_admin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={user.is_admin ? 'Remove Admin' : 'Make Admin'}
                              >
                                Admin
                              </button>
                            </div>
                          </td>
                        )}
                        <td className="py-4">
                          <button
                            onClick={() => handleDeleteUser(user.user_id)}
                            disabled={deletingUser === user.user_id}
                            className={`text-red-400 hover:text-red-300 transition-colors ${
                              deletingUser === user.user_id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-3 text-gray-400 font-medium">Message</th>
                    <th className="pb-3 text-gray-400 font-medium">Author</th>
                    <th className="pb-3 text-gray-400 font-medium">Created</th>
                    <th className="pb-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-400">
                        Loading stars...
                      </td>
                    </tr>
                  ) : filteredStars.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-400">
                        No stars found
                      </td>
                    </tr>
                  ) : (
                    filteredStars.map((star) => (
                      <tr key={star.id} className="border-b border-gray-800">
                        <td className="py-4 text-white">
                          <div className="max-w-xs truncate">{star.message}</div>
                        </td>
                        <td className="py-4 text-white">
                          {star.profiles?.display_name && !star.profiles?.hide_display_name
                            ? star.profiles.display_name
                            : star.profiles?.username || '-'}
                        </td>
                        <td className="py-4 text-gray-400">
                          {new Date(star.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => handleDeleteStar(star.id)}
                            disabled={deletingStar === star.id}
                            className={`text-red-400 hover:text-red-300 transition-colors ${
                              deletingStar === star.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};