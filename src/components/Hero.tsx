"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Hero() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 100]);

  return (
    <header className="relative min-h-[90vh] flex items-center justify-center pt-24 overflow-visible">
      {/* Main Background Image */}
      <div className="absolute inset-0 z-0 bg-[url('/cab_bg.png')] bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen" />

      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00C9E8]/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#4F46E5]/20 rounded-full blur-[150px] mix-blend-screen" />
        
        {/* Subtle Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial="hidden" animate="visible" variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
          className="text-left relative z-10 w-full max-w-xl"
        >
          <div className="mb-10">
            <motion.h1 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-white leading-[1.05] tracking-tight mb-6"
            >
              Campus transit, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C9E8] via-[#99F1FF] to-white italic font-serif">reimagined.</span>
            </motion.h1>
            
            <motion.p 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
              className="text-white/60 text-lg md:text-xl font-light max-w-lg mb-12 leading-relaxed"
            >
              Experience the most orderly, predictable ride-hailing service built specifically for students. Powered by intelligent scheduling, verified drivers, and premium technology.
            </motion.p>
          </div>
          
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
            className="flex flex-col sm:flex-row items-center gap-5"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login?role=passenger')} 
              className="w-full sm:w-auto bg-white text-black font-extrabold text-lg px-10 py-4 rounded-full hover:bg-[#00C9E8] hover:shadow-[0_0_40px_rgba(0, 201, 232,0.6)] transition-all duration-300 ease-out shadow-xl border border-transparent"
            >
              Book a Ride
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login?role=driver')}
              className="w-full sm:w-auto bg-transparent border-2 border-white/20 text-white font-bold text-lg px-10 py-4 rounded-full hover:border-[#00C9E8] hover:bg-[#00C9E8]/10 hover:text-[#00C9E8] hover:shadow-[0_0_20px_rgba(0, 201, 232,0.2),inset_0_0_15px_rgba(0, 201, 232,0.2)] transition-all duration-300 ease-out flex items-center justify-center gap-2 group"
            >
              Become a Driver
              <svg className="group-hover:translate-x-2 transition-transform duration-300" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Floating Hero UI Mockup */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden lg:block h-[600px] w-full"
          style={{ y }}
        >
          {/* Phone Mockup Frame */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[580px] bg-[#0A0A0A] rounded-[40px] border-[8px] border-gray-900 shadow-2xl shadow-black/50 overflow-hidden relative">
            {/* Dynamic Map BG */}
            <div className="absolute inset-0 bg-[#111] overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              {/* Route Line */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M20,80 Q50,50 80,20" stroke="#00C9E8" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite]" />
                <circle cx="20" cy="80" r="3" fill="#4F46E5" />
                <circle cx="80" cy="20" r="3" fill="#00C9E8" />
              </svg>
            </div>

            {/* Top Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl" />

            {/* Floating UI Elements inside phone */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
              className="absolute bottom-6 left-4 right-4 bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-white/50 font-medium">Pickup</p>
                  <p className="text-sm text-white font-bold">University Library</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/50 font-medium">Drop-off</p>
                  <p className="text-sm text-white font-bold">Block C Hostels</p>
                </div>
              </div>
              <button className="w-full bg-[#00C9E8] text-black font-bold py-2 rounded-xl text-sm">Confirm Ride</button>
            </motion.div>

            {/* Driver incoming popup */}
            <motion.div
              initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1, type: "spring" }}
              className="absolute top-16 left-4 right-4 bg-[#111]/80 backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border border-[#00C9E8]">
                <span className="text-xs font-bold text-white">JD</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">John is arriving in 2 mins</p>
                <p className="text-xs text-[#00C9E8] font-medium">Toyota Camry • ABC 123</p>
              </div>
            </motion.div>
          </div>
          
          {/* Floating decorative elements outside phone */}
          <motion.div 
            animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-20 right-0 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00C9E8]/20 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C9E8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
              <div>
                <p className="text-xs text-white/60">Always on time</p>
                <p className="text-sm font-bold text-white">100% Predictable</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
}
