import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, User, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/profile';
import { Star as StarType } from '../types/star';

interface UnifiedSearchProps {
  onClose: () => void;
  onUserSelect?: (userId: string) => void;
  onStarSelect?: (star: StarType) => void;
  onUserSkyView?: (userId: string) => void;
}

interface SearchResult {
  type: 'user' | 'star';
  data: Profile | StarType;
}

export const UnifiedSearch: React.FC<UnifiedSearchProps> = ({
  onClose,
  onUserSelect,
  onStarSelect,
  onUserSkyView,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchAll();
      } else {
        setResults([]);
        setLoading(false);
      }
    }, 300);

    if (searchTerm.trim()) {
      setLoading(true);
    }

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const searchAll = async () => {
    setLoading(true);
    setError(null);
    
    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      // Search users
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${trimmedSearch}%,display_name.ilike.%${trimmedSearch}%,first_name.ilike.%${trimmedSearch}%,last_name.ilike.%${trimmedSearch}%`)
        .limit(5);

      if (userError) throw userError;

      // Search stars
      const { data: stars, error: starError } = await supabase
        .from('stars')
        .select(`
          *,
          profiles (
            username,
            display_name,
            hide_display_name
          )
        `)
        .or(`star_name.ilike.%${trimmedSearch}%,message.ilike.%${trimmedSearch}%`)
        .limit(5);

      if (starError) throw starError;

      const combinedResults: SearchResult[] = [
        ...(users || []).map(user => ({ type: 'user' as const, data: user })),
        ...(stars || []).map(star => ({ type: 'star' as const, data: star }))
      ];

      setResults(combinedResults);
    } catch (err: any) {
      console.error('Error searching:', err);
      setError('Failed to search');
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'user' && onUserSelect) {
      onUserSelect((result.data as Profile).id);
    } else if (result.type === 'user' && onUserSkyView) {
      onUserSkyView((result.data as Profile).id);
    } else if (result.type === 'star' && onStarSelect) {
      onStarSelect(result.data as StarType);
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: -20 }}
        className="bg-gray-900 w-full max-w-md rounded-xl shadow-2xl border border-gray-700 unified-search"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Search</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users or stars..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-gray-400">
              Searching...
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && searchTerm && results.length === 0 && (
            <div className="p-4 text-center text-gray-400">
              No results found
            </div>
          )}

          {results.map((result, index) => (
            <button
              key={`${result.type}-${index}`}
              onClick={() => handleResultClick(result)}
              className="w-full p-4 text-left hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  result.type === 'user' 
                    ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                    : 'bg-gradient-to-br from-yellow-500 to-orange-500'
                }`}>
                  {result.type === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Star className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  {result.type === 'user' ? (
                    <div>
                      <div className="text-white font-medium">
                        {(result.data as Profile).hide_display_name 
                          ? (result.data as Profile).username 
                          : (result.data as Profile).display_name}
                      </div>
                      <div className="text-gray-400 text-sm">
                        @{(result.data as Profile).username} • User
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-white font-medium">
                        {(result.data as StarType).star_name || 'Unnamed Star'}
                      </div>
                      <div className="text-gray-400 text-sm truncate">
                        {(result.data as StarType).message} • Star
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {!searchTerm && (
          <div className="p-4 text-center text-gray-400">
            Start typing to search for users and stars...
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};