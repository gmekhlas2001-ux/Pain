import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, UserCircle, LogOut, Search, Users, PlusCircle, Settings, ShoppingCart } from 'lucide-react';

interface HamburgerMenuProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  onProfileClick: () => void;
  onSignOut: () => void;
  onSearchClick: () => void;
  onAdminClick: () => void;
  onCreateStarClick: () => void;
  onSignInClick: () => void;
  onSettingsClick: () => void;
  onShopClick: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isAuthenticated,
  isAdmin,
  onProfileClick,
  onSignOut,
  onSearchClick,
  onAdminClick,
  onCreateStarClick,
  onSignInClick,
  onSettingsClick,
  onShopClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const menuItems = isAuthenticated ? [
    {
      icon: Search,
      label: 'Search',
      action: onSearchClick,
      color: 'text-green-400 hover:text-green-300',
    },
    {
      icon: PlusCircle,
      label: 'Create Star',
      action: onCreateStarClick,
      color: 'text-blue-400 hover:text-blue-300',
    },
    {
      icon: ShoppingCart,
      label: 'Shop',
      action: onShopClick,
      color: 'text-yellow-400 hover:text-yellow-300',
    },
    {
      icon: UserCircle,
      label: 'Profile',
      action: onProfileClick,
      color: 'text-purple-400 hover:text-purple-300',
    },
    {
      icon: Settings,
      label: 'Settings',
      action: onSettingsClick,
      color: 'text-gray-400 hover:text-gray-300',
    },
    ...(isAdmin ? [{
      icon: Users,
      label: 'Admin Panel',
      action: onAdminClick,
      color: 'text-yellow-400 hover:text-yellow-300',
    }] : []),
    {
      icon: LogOut,
      label: 'Sign Out',
      action: onSignOut,
      color: 'text-red-400 hover:text-red-300',
    },
  ] : [
    {
      icon: UserCircle,
      label: 'Sign In',
      action: onSignInClick,
      color: 'text-blue-400 hover:text-blue-300',
    },
  ];

  return (
    <div ref={menuRef} className="relative">
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 glass-ultra text-white rounded-full hover:scale-110 hover:shadow-2xl transition-all duration-300 group backdrop-blur-xl"
        aria-label="Menu"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 15 }}
          className="group-hover:scale-110 transition-transform duration-200"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.div>
      </button>

      {/* Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20, rotateX: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20, rotateX: -15 }}
            transition={{ 
              duration: 0.3, 
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            }}
            className="absolute top-14 right-0 w-52 glass-ultra rounded-2xl shadow-2xl py-3 z-50 overflow-hidden backdrop-blur-xl"
          >
            {/* Subtle animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20" />
            
            {menuItems.map((item, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -30, rotateY: -15 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -30, rotateY: -15 }}
                transition={{ 
                  delay: index * 0.08,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                whileHover={{ 
                  x: 8, 
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMenuItemClick(item.action)}
                className={`relative w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-300 group ${item.color} rounded-lg mx-2`}
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-current opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-r-full" />
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <item.icon size={18} className="drop-shadow-sm" />
                </motion.div>
                <span className="font-medium drop-shadow-sm">{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};