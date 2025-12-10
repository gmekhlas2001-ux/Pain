import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { getUserCredits, deductStarCredit } from '../lib/paypal';

interface CreateStarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (starName: string, message: string) => Promise<void>;
  onOpenShop: () => void;
}

export const CreateStarModal: React.FC<CreateStarModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onOpenShop,
}) => {
  const { user } = useAuthStore();
  const [starName, setStarName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchCredits();
      checkSuperAdmin();
    }
  }, [isOpen, user]);

  const checkSuperAdmin = async () => {
    if (!user) return;
    try {
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

  const fetchCredits = async () => {
    if (!user) return;
    try {
      const userCredits = await getUserCredits(user.id);
      setCredits(userCredits);
    } catch (err) {
      console.error('Error fetching credits:', err);
    }
  };

  const checkStarNameExists = async (name: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('stars')
        .select('id')
        .eq('star_name', name)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (err) {
      console.error('Error checking star name:', err);
      throw new Error('Failed to check star name availability');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!user) {
        setError('You must be logged in to create a star');
        setIsSubmitting(false);
        return;
      }

      if (!isSuperAdmin && credits < 1) {
        setError('You need star credits to create a star. Purchase credits in the shop.');
        setIsSubmitting(false);
        return;
      }

      if (!starName.trim()) {
        setError('Star name is required');
        setIsSubmitting(false);
        return;
      }

      if (!message.trim()) {
        setError('Message is required');
        setIsSubmitting(false);
        return;
      }

      const nameExists = await checkStarNameExists(starName.trim());
      if (nameExists) {
        setError('This star name has already been taken. Please choose a different name.');
        setIsSubmitting(false);
        return;
      }

      if (!isSuperAdmin) {
        const deducted = await deductStarCredit(user.id);
        if (!deducted) {
          setError('Failed to deduct credit. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      await onSubmit(starName.trim(), message.trim());
      setStarName('');
      setMessage('');
      setError(null);
      await fetchCredits();
    } catch (err: any) {
      setError(err.message || 'Failed to create star');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 p-6 rounded-lg w-full max-w-md relative border border-gray-700"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Create a New Star</h2>

        <div className="mb-4 flex items-center justify-between p-3 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-700/30">
          <div>
            <p className="text-xs text-gray-400">Your Star Credits</p>
            <p className="text-xl font-bold text-white">{isSuperAdmin ? '∞ Unlimited' : credits}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenShop();
            }}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <ShoppingCart size={16} />
            Buy More
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <input
            type="text"
            value={starName}
            onChange={(e) => setStarName(e.target.value)}
            placeholder="Star name (required)"
            maxLength={50}
            className="w-full p-3 mb-4 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
          
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message (max 500 characters)"
            maxLength={500}
            required
            className="w-full h-32 p-3 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
          />
          
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={!message.trim() || !starName.trim() || isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Star'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};