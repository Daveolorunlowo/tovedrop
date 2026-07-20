"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, User, Clock, CreditCard, HelpCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'PASSENGER' | 'DRIVER';
  userName?: string;
}

export default function Sidebar({ isOpen, onClose, userRole, userName = 'User' }: SidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', action: () => onClose() },
    { icon: User, label: 'Profile', action: () => { onClose(); router.push(userRole === 'DRIVER' ? '/driver/profile' : '/dashboard?view=PROFILE'); } },
    { icon: Clock, label: 'History', action: () => { onClose(); } },
    { icon: CreditCard, label: 'Wallet', action: () => { onClose(); } },
    { icon: HelpCircle, label: 'Support', action: () => { onClose(); } },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-3/4 max-w-sm bg-white z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#000000] to-slate-800 flex items-center justify-center text-white font-bold text-lg">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 truncate max-w-[150px]">{userName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{userRole === 'DRIVER' ? 'Driver Partner' : 'Passenger'}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Nav Items */}
            <div className="flex-1 overflow-y-auto py-4 px-3">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-slate-50 transition-colors text-slate-700 hover:text-[#000000] group"
                >
                  <item.icon className="w-6 h-6 text-slate-400 group-hover:text-[#000000]" />
                  <span className="font-bold">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-6 h-6" />
                Logout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
