import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Music, ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { PRODUCTS, PayPalProduct } from '../types/payment';
import { loadPayPalScript, createPurchaseRecord, updatePurchaseStatus, addStarCredits, getUserCredits } from '../lib/paypal';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const starButtonRef = useRef<HTMLDivElement>(null);
  const musicButtonRef = useRef<HTMLDivElement>(null);

  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test';

  useEffect(() => {
    if (isOpen && user) {
      fetchCredits();
      initPayPal();
    }
  }, [isOpen, user]);

  const fetchCredits = async () => {
    if (!user) return;
    try {
      const userCredits = await getUserCredits(user.id);
      setCredits(userCredits);
    } catch (err) {
      console.error('Error fetching credits:', err);
    }
  };

  const initPayPal = async () => {
    try {
      await loadPayPalScript(PAYPAL_CLIENT_ID);
      setPaypalLoaded(true);
      renderPayPalButtons();
    } catch (err) {
      setError('Failed to load PayPal. Please refresh the page.');
    }
  };

  const renderPayPalButtons = () => {
    if (!window.paypal || !user) return;

    if (starButtonRef.current) {
      starButtonRef.current.innerHTML = '';
      window.paypal.Buttons({
        createOrder: async () => {
          try {
            setLoading(true);
            setError(null);
            const purchaseId = await createPurchaseRecord(user.id, PRODUCTS.STAR_CREDITS);

            const order = await window.paypal.order.create({
              purchase_units: [{
                amount: {
                  currency_code: PRODUCTS.STAR_CREDITS.currency,
                  value: PRODUCTS.STAR_CREDITS.price.toFixed(2)
                },
                description: PRODUCTS.STAR_CREDITS.description,
                custom_id: purchaseId
              }]
            });
            return order.id;
          } catch (err) {
            setError('Failed to create order');
            throw err;
          } finally {
            setLoading(false);
          }
        },
        onApprove: async (data: any) => {
          try {
            setLoading(true);
            const details = await window.paypal.order.capture(data.orderID);
            const purchaseId = details.purchase_units[0].custom_id;

            await updatePurchaseStatus(
              purchaseId,
              'completed',
              data.orderID,
              details.id
            );

            await addStarCredits(user.id, PRODUCTS.STAR_CREDITS.quantity);
            await fetchCredits();

            setSuccess(`Successfully purchased ${PRODUCTS.STAR_CREDITS.quantity} star credits!`);
          } catch (err) {
            setError('Payment completed but failed to update credits. Contact support.');
          } finally {
            setLoading(false);
          }
        },
        onError: (err: any) => {
          setError('Payment failed. Please try again.');
          setLoading(false);
        }
      }).render(starButtonRef.current);
    }

    if (musicButtonRef.current) {
      musicButtonRef.current.innerHTML = '';
      window.paypal.Buttons({
        createOrder: async () => {
          try {
            setLoading(true);
            setError(null);
            const purchaseId = await createPurchaseRecord(user.id, PRODUCTS.SKY_MUSIC);

            const order = await window.paypal.order.create({
              purchase_units: [{
                amount: {
                  currency_code: PRODUCTS.SKY_MUSIC.currency,
                  value: PRODUCTS.SKY_MUSIC.price.toFixed(2)
                },
                description: PRODUCTS.SKY_MUSIC.description,
                custom_id: purchaseId
              }]
            });
            return order.id;
          } catch (err) {
            setError('Failed to create order');
            throw err;
          } finally {
            setLoading(false);
          }
        },
        onApprove: async (data: any) => {
          try {
            setLoading(true);
            const details = await window.paypal.order.capture(data.orderID);
            const purchaseId = details.purchase_units[0].custom_id;

            await updatePurchaseStatus(
              purchaseId,
              'completed',
              data.orderID,
              details.id
            );

            setSuccess('Music upload unlocked! You can now upload your music.');
          } catch (err) {
            setError('Payment completed but failed to unlock feature. Contact support.');
          } finally {
            setLoading(false);
          }
        },
        onError: (err: any) => {
          setError('Payment failed. Please try again.');
          setLoading(false);
        }
      }).render(musicButtonRef.current);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Star Shop</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-4 border border-blue-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Your Star Credits</p>
                <p className="text-3xl font-bold text-white">{credits}</p>
              </div>
              <Star className="w-12 h-12 text-yellow-400" />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-300"
              >
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-4 bg-green-900/30 border border-green-500/50 rounded-xl text-green-300"
              >
                <CheckCircle size={18} />
                <span className="text-sm">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">3 Star Credits</h3>
                  <p className="text-gray-400 text-sm mb-2">Create 3 beautiful stars in your sky</p>
                  <p className="text-2xl font-bold text-blue-400">€5.00</p>
                </div>
              </div>
              <div ref={starButtonRef} className="min-h-[45px]"></div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">Sky Music</h3>
                  <p className="text-gray-400 text-sm mb-2">Upload custom music to your personal sky</p>
                  <p className="text-2xl font-bold text-blue-400">€5.00</p>
                </div>
              </div>
              <div ref={musicButtonRef} className="min-h-[45px]"></div>
            </div>
          </div>

          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400 text-center">
              Secure payment powered by PayPal. Your payment information is encrypted and secure.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
