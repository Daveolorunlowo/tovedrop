"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';

const PICKUP_LOCATIONS = [
  "University Library",
  "Main Gate",
  "Faculty of Sciences",
  "Faculty of Law",
  "Sports Complex",
  "Chapel",
];

export default function Hero() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 80]);
  const [pickup, setPickup] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = PICKUP_LOCATIONS.filter(l =>
    l.toLowerCase().includes(pickup.toLowerCase())
  );

  return (
    <header className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image — parallax */}
      <motion.div
        className="absolute inset-0 z-0 bg-[url('/cab_bg.png')] bg-cover bg-center bg-no-repeat scale-110"
        style={{ y: bgY }}
      />
      {/* Dark scrim for legibility */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center">

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(3rem,9vw,7rem)] font-black text-white leading-[0.95] tracking-tighter mb-10"
        >
          Get there.<br />
          <span className="text-[#00C9E8]">On time.</span>
        </motion.h1>

        {/* ── Uber-style Booking Widget ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl relative"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-2 flex items-center gap-2">
            {/* Pickup dot */}
            <div className="pl-3 pr-1 shrink-0">
              <div className="w-3 h-3 rounded-full border-2 border-black" />
            </div>

            {/* Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Where are you now?"
                value={pickup}
                onChange={e => { setPickup(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="w-full text-black text-base font-medium placeholder-gray-400 outline-none py-3 bg-transparent"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {filtered.map(loc => (
                    <button
                      key={loc}
                      onMouseDown={() => { setPickup(loc); setShowSuggestions(false); }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-8 bg-gray-200 shrink-0" />

            {/* Book CTA */}
            <button
              onClick={() => router.push('/login?role=passenger')}
              className="shrink-0 bg-black text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#00C9E8] hover:text-black transition-colors duration-200"
            >
              Book a Ride
            </button>
          </div>

          {/* Drive CTA below widget */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/50 text-sm mt-4 text-center"
          >
            Driving on campus?{' '}
            <button
              onClick={() => router.push('/login?role=driver')}
              className="text-white font-semibold underline underline-offset-2 hover:text-[#00C9E8] transition-colors"
            >
              Sign up to drive →
            </button>
          </motion.p>
        </motion.div>
      </div>

      {/* ── Glassmorphic Stats Bar — floats at the bottom ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 w-full max-w-lg px-6"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-8 py-4 flex items-center justify-between gap-6">
          <div className="text-center">
            <p className="text-xl font-black text-white">2.4<span className="text-[#00C9E8]">m</span></p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Avg. Pickup</p>
          </div>
          <div className="w-px h-8 bg-white/15" />
          <div className="text-center">
            <p className="text-xl font-black text-white">₦250<span className="text-[#00C9E8]">+</span></p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Per Seat</p>
          </div>
          <div className="w-px h-8 bg-white/15" />
          <div className="text-center">
            <p className="text-xl font-black text-white">150<span className="text-[#00C9E8]">+</span></p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Active Drivers</p>
          </div>
          <div className="w-px h-8 bg-white/15" />
          <div className="text-center">
            <p className="text-xl font-black text-white">24<span className="text-[#00C9E8]">/7</span></p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">On-Campus</p>
          </div>
        </div>
      </motion.div>
    </header>
  );
}
