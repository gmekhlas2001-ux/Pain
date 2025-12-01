import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { Logo } from './Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset-sent';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { signIn, signUp } = useAuthStore();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    setMode('signin');
    onClose();
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      handleClose();
    } catch (err: any) {
      if (err.message === 'Invalid login credentials') {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link before signing in.');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password);
      setSuccess('Account created successfully! Please check your email to confirm your account before signing in.');
      setMode('signin');
      resetForm();
    } catch (err: any) {
      if (err.message.includes('User already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (err.message.includes('weak_password')) {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message.includes('email_send_rate_limit') || error.message.includes('rate limit')) {
          throw new Error('Please wait a moment before requesting another password reset email.');
        }
        throw error;
      }

      setMode('reset-sent');
      setSuccess('Password reset email sent! Please check your inbox and spam folder.');
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('email_send_rate_limit') || error.message.includes('rate limit')) {
        setError('Please wait a moment before requesting another password reset email.');
      } else if (error.message.includes('SMTP')) {
        setError('Email service is not configured. Please contact the administrator or use the Supabase dashboard to reset your password.');
      } else {
        setError(error.message || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Reset Password';
      case 'reset-sent': return 'Check Your Email';
      default: return 'Welcome';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signin': return 'Sign in to your account to continue';
      case 'signup': return 'Create a new account to get started';
      case 'forgot': return 'Enter your email to receive a password reset link';
      case 'reset-sent': return 'We\'ve sent you a password reset link';
      default: return '';
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-black p-8 text-white overflow-hidden">
          {/* Animated stars in header */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={`header-star-${i}`}
                className="absolute bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  opacity: Math.random() * 0.8 + 0.2,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                }}
              />
            ))}
          </div>
          
          {/* Cosmic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20" />
          
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
          >
            <X size={24} />
          </button>
          
          {mode === 'forgot' && (
            <button
              onClick={() => setMode('signin')}
              className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors z-10"
            >
              <ArrowLeft size={24} />
            </button>
          )}

          <div className="text-center relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
              }}
            >
              {mode === 'reset-sent' ? (
                <CheckCircle size={32} className="text-gray-900" />
              ) : mode === 'forgot' ? (
                <Mail size={32} className="text-gray-900" />
              ) : (
                <User size={32} className="text-gray-900" />
              )}
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">{getTitle()}</h2>
            <p className="text-white/90 text-sm">{getSubtitle()}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 bg-gradient-to-b from-gray-900 to-black">
          <AnimatePresence mode="wait">
            {mode === 'reset-sent' ? (
              <motion.div
                key="reset-sent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                       style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}>
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-300 mb-4">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <div className="space-y-2 text-sm text-gray-400 text-left bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                    <p className="font-medium text-gray-300">What to do next:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Check your email inbox for the reset link</li>
                      <li>Check your spam/junk folder if you don't see it</li>
                      <li>Click the link to set a new password</li>
                      <li>The link expires in 1 hour</li>
                    </ul>
                    <p className="mt-3 text-xs text-yellow-400 flex items-start gap-2">
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                      <span>Note: If you don't receive an email, your Supabase project may need email service configuration. Contact your administrator or check the Supabase dashboard.</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMode('signin')}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg"
                  style={{ boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}
                >
                  Back to Sign In
                </button>
              </motion.div>
            ) : (
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={mode === 'signin' ? handleSignIn : mode === 'signup' ? handleSignUp : handleForgotPassword}
                className="space-y-6"
              >
                {/* Error/Success Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-300 backdrop-blur-sm"
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
                      className="flex items-center gap-2 p-4 bg-green-900/30 border border-green-500/50 rounded-xl text-green-300 backdrop-blur-sm"
                    >
                      <CheckCircle size={18} />
                      <span className="text-sm">{success}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Fields */}
                {mode === 'signup' && (
                  <>
                  </>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {mode === 'signup' && (
                      <p className="text-xs text-gray-400">
                        Must contain uppercase, lowercase, number, and be 6+ characters
                      </p>
                    )}
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg relative overflow-hidden"
                  style={{ boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' }}
                >
                  {/* Subtle star animation on button */}
                  <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={`btn-star-${i}`}
                        className="absolute bg-white rounded-full animate-pulse"
                        style={{
                          left: `${20 + i * 30}%`,
                          top: '50%',
                          width: '2px',
                          height: '2px',
                          animationDelay: `${i * 0.5}s`,
                          animationDuration: '2s',
                        }}
                      />
                    ))}
                  </div>
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Please wait...
                    </span>
                  ) : mode === 'signin' ? (
                    'Sign In'
                  ) : mode === 'signup' ? (
                    'Create Account'
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                {/* Footer Links */}
                <div className="space-y-4">
                  {mode === 'signin' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="block w-full text-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Forgot your password?
                      </button>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-gradient-to-b from-gray-900 to-black text-gray-400">Don't have an account?</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signup');
                          setError(null);
                          setSuccess(null);
                        }}
                        className="w-full py-3 border-2 border-purple-500 text-purple-400 rounded-xl hover:bg-purple-500/10 transition-all duration-200 font-medium backdrop-blur-sm"
                      >
                        Create New Account
                      </button>
                    </>
                  )}

                  {mode === 'signup' && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-gradient-to-b from-gray-900 to-black text-gray-400">Already have an account?</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signin');
                          setError(null);
                          setSuccess(null);
                        }}
                        className="w-full py-3 border-2 border-purple-500 text-purple-400 rounded-xl hover:bg-purple-500/10 transition-all duration-200 font-medium backdrop-blur-sm"
                      >
                        Sign In Instead
                      </button>
                    </>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};