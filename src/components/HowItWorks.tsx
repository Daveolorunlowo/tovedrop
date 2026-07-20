"use client";

import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    number: "01",
    title: "Set your pickup.",
    detail: "Type where you are. Prices are upfront — no surprises.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    number: "02",
    title: "Get matched instantly.",
    detail: "A verified student driver near you accepts in seconds.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    number: "03",
    title: "Ride. Done.",
    detail: "Door to door. Every time. No chaos, no waiting.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="py-28 bg-[#030712]">
      <div className="max-w-5xl mx-auto px-6">

        {/* Section header — minimal, no uppercase badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Three taps.<br />
            <span className="text-[#00C9E8]">You&apos;re moving.</span>
          </h2>
        </motion.div>

        {/* Steps — horizontal list with numbered dividers */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-7 left-0 right-0 h-px bg-white/5" />

          <div className="grid md:grid-cols-3 gap-10 relative z-10">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-7 h-7 rounded-full border border-[#00C9E8]/40 flex items-center justify-center text-[#00C9E8] shrink-0">
                    <span className="text-xs font-black">{s.number}</span>
                  </div>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="text-white/40 mb-4">{s.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                <p className="text-white/50 text-base leading-relaxed">{s.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
