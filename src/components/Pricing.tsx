"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Pricing() {
  const router = useRouter();

  return (
    <section className="py-24 bg-[#050B14]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">Priced for students.</h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">No surprise surges. No hidden fees. Just transparent pricing that fits a student budget.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Solo Tier */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10 hover:border-white/20 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Solo Ride</h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div className="mb-8">
              <span className="text-5xl font-black text-white">₦900</span>
              <span className="text-white/40 font-medium"> / ride</span>
            </div>
            <p className="text-white/60 mb-8">The standard way to get around campus quickly. Private and direct.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-white/80"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C9E8" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Direct to destination</li>
              <li className="flex items-center gap-2 text-white/80"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C9E8" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> No shared stops</li>
            </ul>
            <button onClick={() => router.push('/login?role=passenger')} className="w-full py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors">Book Solo</button>
          </div>

          {/* Pool Tier */}
          <div className="bg-gradient-to-b from-[#00C9E8]/20 to-[#00C9E8]/5 border border-[#00C9E8]/50 rounded-[2rem] p-10 relative overflow-hidden transform md:-translate-y-4 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            <div className="absolute top-4 right-4 bg-[#00C9E8] text-black text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">Most Popular</div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Carpool</h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#00C9E8]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div className="mb-8">
              <span className="text-5xl font-black text-white">₦250</span>
              <span className="text-white/40 font-medium"> / seat</span>
            </div>
            <p className="text-white/80 mb-8">Share the ride with others heading your way and split the cost.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C9E8" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Maximum 4 riders</li>
              <li className="flex items-center gap-2 text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C9E8" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Ultra-affordable</li>
              <li className="flex items-center gap-2 text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C9E8" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Eco-friendly</li>
            </ul>
            <button onClick={() => router.push('/login?role=passenger')} className="w-full py-4 rounded-xl bg-[#00C9E8] text-black font-black hover:bg-[#99F1FF] transition-colors shadow-lg">Book Carpool</button>
          </div>
        </div>
      </div>
    </section>
  );
}
