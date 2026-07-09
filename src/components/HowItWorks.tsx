"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  return (
    <section className="py-24 bg-[#030712] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00C9E8]/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 relative z-10">
          <h2 className="text-[#00C9E8] font-bold tracking-widest uppercase text-sm mb-3">Simple & Fast</h2>
          <h3 className="text-4xl md:text-5xl font-black text-white">How it works</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          {[
            { step: "01", title: "Request", desc: "Set your campus location. See upfront pricing immediately.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
            { step: "02", title: "Match", desc: "We instantly connect you with the nearest verified student driver.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
            { step: "03", title: "Ride", desc: "Enjoy a stress-free, affordable ride to your dorm or class.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
          ].map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[2rem] hover:bg-white/10 transition-colors group relative overflow-hidden"
            >
              <div className="text-8xl font-black text-white/5 absolute -right-4 -bottom-4 group-hover:text-white/10 transition-colors">{s.step}</div>
              <div className="w-14 h-14 rounded-2xl bg-[#00C9E8]/20 flex items-center justify-center text-[#00C9E8] mb-8 group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
              <h4 className="text-2xl font-bold text-white mb-4 relative z-10">{s.title}</h4>
              <p className="text-white/60 text-lg relative z-10">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
