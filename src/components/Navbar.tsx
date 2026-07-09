"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-[#030712]/80 backdrop-blur-lg border-white/10 py-4 shadow-2xl' 
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center cursor-pointer"
          onClick={() => router.push('/')}
        >
          <img src="/Tovedrop-removebg-preview.png" alt="Tove Drop Logo" className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
        </motion.div>
        
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 bg-white/5 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10">
          <button onClick={() => router.push('/login?role=passenger')} className="text-sm font-medium text-white/80 hover:text-white transition-colors">Ride</button>
          <button onClick={() => router.push('/login?role=driver')} className="text-sm font-medium text-white/80 hover:text-white transition-colors">Drive</button>
          <button onClick={() => router.push('/about')} className="text-sm font-medium text-white/80 hover:text-white transition-colors">Schedule</button>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => router.push('/login?role=passenger')}
            className="text-sm font-semibold text-white hover:text-[#00C9E8] transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={() => router.push('/login?role=passenger')}
            className="bg-white text-[#030712] text-sm font-bold px-6 py-2.5 rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? ( <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> ) : ( <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></> )}
          </svg>
        </button>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full left-0 w-full bg-[#030712]/95 backdrop-blur-xl border-b border-white/10 px-6 py-8 flex flex-col gap-6"
          >
            <button onClick={() => router.push('/login?role=passenger')} className="text-left font-semibold text-lg text-white">Ride</button>
            <button onClick={() => router.push('/login?role=driver')} className="text-left font-semibold text-lg text-white">Drive</button>
            <div className="h-px w-full bg-white/10 my-2" />
            <button onClick={() => router.push('/login?role=passenger')} className="bg-[#00C9E8] text-[#030712] font-bold py-3.5 rounded-xl text-center w-full">Sign In</button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
