// Main application component that orchestrates the entire Star Letter app
// Handles authentication, star management, modals, and overall app state
import React, { useState, useEffect, useCallback } from 'react';
import { StarrySky } from './components/StarrySky';
import { CreateStarModal } from './components/CreateStarModal';
import { ShopModal } from './components/ShopModal';
import { MusicPlayer } from './components/MusicPlayer';
import { ProfileModal } from './components/ProfileModal';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { PasswordResetPage } from './components/PasswordResetPage';
import { UnifiedSearch } from './components/UnifiedSearch';
import { SkySelector } from './components/SkySelector';
import { HamburgerMenu } from './components/HamburgerMenu';
import { SettingsModal } from './components/SettingsModal';
import { InstallPrompt } from './components/InstallPrompt';
import { useLocationTime } from './hooks/useLocationTime';
import { Star } from './types/star';
import { Profile } from './types/profile';
import { useAuthStore } from './store/useAuthStore';
import { supabase, checkSupabaseConnection, testNetworkConnectivity } from './lib/supabase';
import { Trash2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Check if environment variables are available
const hasSupabaseCredentials = !!(
  import.meta.env.VITE_SUPABASE_URL?.trim() &&
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
);

// Main App component - the root component of the application
function App() {
  // Check early conditions before hooks
  const isPasswordResetPage = window.location.pathname === '/reset-password' ||
                              window.location.hash.includes('type=recovery');

  // If it's password reset page, render only that
  if (isPasswordResetPage) {
    return <PasswordResetPage />;
  }

  // If no Supabase credentials, show setup message
  if (!hasSupabaseCredentials) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 p-8 rounded-lg max-w-2xl w-full text-center">
          <div className="mb-6">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">
              Setup Required
            </h1>
          </div>

          <div className="text-gray-300 text-left mb-6 space-y-4">
            <p>This application requires Supabase credentials to function properly.</p>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Missing Environment Variables:</h3>
              <ul className="text-sm space-y-1">
                <li>• VITE_SUPABASE_URL</li>
                <li>• VITE_SUPABASE_ANON_KEY</li>
              </ul>
            </div>

            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
              <h3 className="text-blue-400 font-semibold mb-2">For Netlify Deployment:</h3>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Go to your Netlify dashboard</li>
                <li>Select this site</li>
                <li>Go to Site settings → Environment variables</li>
                <li>Add the required Supabase credentials</li>
                <li>Redeploy the site</li>
              </ol>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry After Setup
          </button>
        </div>
      </div>
    );
  }

  // Render the main app with all hooks
  return <MainApp />;
}

// Separate component for main app logic to ensure hooks are always called
function MainApp() {
  const [stars, setStars] = useState<Star[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [currentSky, setCurrentSky] = useState<'general' | 'user'>('general');
  const { user, signOut, initialize } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [userProfile, setUserProfile] = useState<Partial<Profile> | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const { isDayTime } = useLocationTime();
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [prevUser, setPrevUser] = useState<typeof user | null>(null);

  const [characterBodyType, setCharacterBodyType] = useState<'cat' | 'human' | 'bear' | 'fox'>('cat');
  const [characterGender, setCharacterGender] = useState<'masculine' | 'feminine' | 'neutral'>('neutral');
  const [characterColor, setCharacterColor] = useState('#5dade2');

  // Define all callbacks first before using them in effects
  const fetchStars = useCallback(async () => {
    if (!isConnected) return;

    try {
      let query = supabase
        .from('stars')
        .select(`
          *,
          profiles (
            username,
            display_name,
            hide_display_name
          )
        `);

      if (currentSky === 'general') {
        query = query.eq('sky_type', 'general');
      } else if (currentSky === 'user' && user) {
        const targetUserId = viewingUserId || user.id;
        query = query.eq('sky_type', 'user').eq('profile_id', targetUserId);
      }

      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false });

      if (fetchError) {
        if (fetchError.code === '42P01') {
          setStars([]);
          setError('Database tables not yet configured. Please run migrations.');
          return;
        }

        setError('Failed to load stars. Please try again.');
        return;
      }

      setStars(data || []);
      setError(null);
    } catch {
      setError('Failed to load stars. Please try again.');
    }
  }, [isConnected, currentSky, user, viewingUserId]);

  const checkProfileCompletion = useCallback(async () => {
    if (!user || !isConnected) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      setUserProfile(profile);
      if (profile) {
        setCharacterBodyType(profile.character_body_type || 'cat');
        setCharacterGender(profile.character_gender || 'neutral');
        setCharacterColor(profile.character_color || '#5dade2');
      }
      if (!profile) {
        setShowProfileModal(true);
      }
    } catch {
      setError('Failed to load profile. Please try again.');
    }
  }, [user, isConnected]);

  const checkAdminStatus = useCallback(async () => {
    if (!user || !isConnected) return;

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (error) {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    }
  }, [user, isConnected]);

  useEffect(() => {
    if (prevUser && !user) {
      setCurrentSky('general');
      setViewingUserId(null);
    }
    setPrevUser(user);
  }, [user, prevUser]);

  useEffect(() => {
    const checkConnection = async () => {
      setIsRetrying(true);

      const networkResult = await testNetworkConnectivity();
      if (!networkResult.success) {
        setIsConnected(false);
        setConnectionError(networkResult.error || 'Network connectivity issue');
        setIsRetrying(false);
        return;
      }

      const connectionResult = await checkSupabaseConnection();
      setIsConnected(connectionResult.success);

      if (!connectionResult.success) {
        setConnectionError(connectionResult.error || 'Database connection failed');
      } else {
        setConnectionError(null);
        setError(null);
        initialize();
        fetchStars();
      }

      setIsRetrying(false);
    };

    checkConnection();
  }, [initialize, fetchStars]);

  useEffect(() => {
    if (!isConnected) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.star-message') && !target.closest('.interactive-star')) {
        setSelectedStar(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected || !user) {
      setUserProfile(null);
      setIsAdmin(false);
      return;
    }

    checkProfileCompletion();
    checkAdminStatus();
  }, [user, isConnected, checkProfileCompletion, checkAdminStatus]);

  useEffect(() => {
    if (isConnected) {
      fetchStars();
    }
  }, [isConnected, fetchStars]);

  useEffect(() => {
    if (isConnected) {
      fetchStars();
    }
  }, [isConnected, fetchStars]);

  const handleCreateStar = async (starName: string, message: string): Promise<void> => {
    if (!isConnected) {
      setError('Unable to connect to the database. Please try again later.');
      throw new Error('Database connection error');
    }

    if (!user) {
      setError('Please sign in to create stars');
      setIsModalOpen(false);
      setIsAuthModalOpen(true);
      throw new Error('Authentication required');
    }

    try {
      let x, y, attempts = 0;
      const maxAttempts = 100;
      const minDistance = 5;

      while (attempts < maxAttempts) {
        x = Math.random() * 100;
        y = Math.random() * 60 + 20;
        attempts++;

        const screenX = (x * window.innerWidth / 100) % window.innerWidth;
        const conflictsWithUI = (
          (screenX > window.innerWidth * 0.75 && y < 35) ||
          (screenX < window.innerWidth * 0.25 && y < 25) ||
          (screenX > window.innerWidth * 0.75 && y > 75)
        );

        const tooCloseToExistingStar = stars.some(existingStar => {
          const distance = Math.sqrt(
            Math.pow(existingStar.x - x, 2) + Math.pow(existingStar.y - y, 2)
          );
          return distance < minDistance;
        });

        if (!conflictsWithUI && !tooCloseToExistingStar) {
          break;
        }
      }

      if (attempts >= maxAttempts) {
        throw new Error('Unable to find a suitable location for the star. The sky might be too crowded.');
      }

      const newStar = {
        star_name: starName,
        message,
        x,
        y,
        size: Math.random() * 2 + 1,
        brightness: Math.random() * 0.5 + 0.5,
        profile_id: user.id,
        sky_type: currentSky
      };

      const { error: insertError } = await supabase
        .from('stars')
        .insert([newStar]);

      if (insertError) {
        setError('Failed to create star. Please try again.');
        throw new Error('Failed to create star');
      }

      setIsModalOpen(false);
      setError(null);
      await fetchStars();
    } catch (err) {
      setError('Failed to create star. Please try again.');
      throw err;
    }
  };

  const handleDeleteStar = async (starId: string) => {
    if (!isConnected || !user) return;

    try {
      const { error: deleteError } = await supabase
        .from('stars')
        .delete()
        .eq('id', starId);

      if (deleteError) {
        setError('Failed to delete star. Please try again.');
        return;
      }

      setSelectedStar(null);
      await fetchStars();
    } catch {
      setError('Failed to delete star. Please try again.');
    }
  };

  const handleStarClick = (star: Star) => {
    setSelectedStar(star);
  };

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    setConnectionError(null);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const networkResult = await testNetworkConnectivity();
    if (!networkResult.success) {
      setConnectionError(networkResult.error || 'Network connectivity issue');
      setIsRetrying(false);
      return;
    }

    const connectionResult = await checkSupabaseConnection();
    setIsConnected(connectionResult.success);

    if (!connectionResult.success) {
      setConnectionError(connectionResult.error || 'Database connection failed');
    } else {
      setConnectionError(null);
      initialize();
      fetchStars();
    }

    setIsRetrying(false);
  };

  const handleSearchClick = () => {
    setShowSearch(true);
  };

  const handleSearchClose = () => {
    setShowSearch(false);
  };

  const handleUserSkyView = (userId: string) => {
    setViewingUserId(userId);
    setCurrentSky('user');
    setShowSearch(false);
  };

  if (!isConnected) {
    const isCorsError = connectionError?.includes('CORS Configuration Required');

    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full">
          <div className="text-center mb-6">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              {isCorsError ? 'Setup Required' : 'Connection Error'}
            </h1>
          </div>

          <div className="text-gray-300 text-left mb-6 whitespace-pre-line leading-relaxed">
            {connectionError || 'Unable to connect to the database.'}
          </div>

          {isCorsError && (
            <div className="mb-6 p-4 bg-blue-900 bg-opacity-50 rounded-lg border border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-medium">Quick Setup Link</span>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 underline transition-colors"
              >
                Open Supabase Dashboard →
              </a>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleRetryConnection}
              disabled={isRetrying}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Retry Connection'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      <StarrySky
        stars={stars}
        onStarClick={handleStarClick}
        isDayTime={isDayTime}
        characterBodyType={characterBodyType}
        characterGender={characterGender}
        characterColor={characterColor}
      />
      <MusicPlayer />

      <SkySelector
        currentSky={currentSky}
        onSkyChange={(skyType) => {
          setCurrentSky(skyType);
          if (skyType === 'general') {
            setViewingUserId(null);
          } else if (skyType === 'user' && user) {
            setViewingUserId(user.id);
          }
        }}
        isAuthenticated={!!user}
        isDayTime={isDayTime}
        viewingUserId={viewingUserId}
      />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 glass-dark border border-red-500/30 text-red-300 px-6 py-3 rounded-xl shadow-2xl z-50 max-w-[90%] sm:max-w-md text-center backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 justify-center">
            <AlertCircle className="w-4 h-4 animate-pulse" />
            <span className="font-medium">{error}</span>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showSettings && user && (
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            onCharacterUpdate={() => checkProfileCompletion()}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-4 right-4 z-10"
      >
        <HamburgerMenu
          isAuthenticated={!!user}
          isAdmin={isAdmin}
          onProfileClick={() => setShowProfileModal(true)}
          onSignOut={() => signOut()}
          onSearchClick={handleSearchClick}
          onAdminClick={() => setShowAdminPanel(true)}
          onCreateStarClick={() => setIsModalOpen(true)}
          onSignInClick={() => setIsAuthModalOpen(true)}
          onSettingsClick={() => setShowSettings(true)}
          onShopClick={() => setShowShop(true)}
        />
      </motion.div>

      <AnimatePresence>
        {selectedStar && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 50, rotateX: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 50, rotateX: -15 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
              duration: 0.4
            }}
            className="fixed bottom-20 sm:bottom-8 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50 star-message"
            style={{ perspective: '1000px' }}
          >
            <div className="relative glass-dark p-6 rounded-2xl sm:max-w-lg shadow-2xl overflow-hidden border border-white/10">
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={`msg-star-${i}`}
                    className="absolute bg-white rounded-full animate-pulse opacity-30"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      width: `${Math.random() * 2 + 1}px`,
                      height: `${Math.random() * 2 + 1}px`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${Math.random() * 2 + 2}s`,
                    }}
                  />
                ))}
              </div>

              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 rounded-2xl" />

              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-glow">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <h3 className="text-yellow-300 font-bold text-xl bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    {selectedStar.star_name}
                  </h3>
                </motion.div>

                {(user && (selectedStar.profile_id === user.id || isAdmin)) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteStar(selectedStar.id)}
                    className="absolute -top-2 -right-2 text-red-400 hover:text-red-300 transition-all duration-300 glass-dark hover:bg-red-900/30 rounded-full p-2 border border-red-500/30 hover:border-red-500/60 shadow-lg"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass rounded-xl p-5 mb-5 border border-white/20 shadow-inner"
                >
                  <p className="text-white text-base sm:text-lg font-medium leading-relaxed tracking-wide">
                    "{selectedStar.message}"
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-between"
                >
                  <div className="text-gray-300 text-sm">
                    {selectedStar.profiles?.display_name && !selectedStar.profiles?.hide_display_name ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
                        <span className="font-medium">By: {selectedStar.profiles.display_name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Anonymous Star</span>
                      </div>
                    )}
                  </div>

                  <div className="text-gray-400 text-xs font-medium">
                    {new Date(selectedStar.created_at).toLocaleDateString()}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-5 pt-4 border-t border-white/20 text-center"
                >
                  <div className="text-gray-400 text-xs flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="font-medium">Click anywhere to close</span>
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateStarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateStar}
        onOpenShop={() => setShowShop(true)}
      />

      <ShopModal
        isOpen={showShop}
        onClose={() => setShowShop(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <AnimatePresence>
        {showProfileModal && user && (
          <ProfileModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            userId={user.id}
            existingProfile={userProfile || undefined}
            isNewUser={!userProfile}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdminPanel && isAdmin && (
          <AdminPanel
            isOpen={showAdminPanel}
            onClose={() => setShowAdminPanel(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSearch && user && (
          <UnifiedSearch
            onClose={handleSearchClose}
            onStarSelect={(star) => {
              setSelectedStar(star);
              handleSearchClose();
            }}
            onUserSkyView={handleUserSkyView}
          />
        )}
      </AnimatePresence>

      <InstallPrompt />
    </div>
  );
}

export default App;
