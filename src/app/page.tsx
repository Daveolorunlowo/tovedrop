"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Extracted Components
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

const LiveMap = dynamic(() => import('../components/LiveMap'), { ssr: false });

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-[#00C9E8] selection:text-[#030712] overflow-hidden">
      
      {/* ─── PREMIUM NAVBAR ─── */}
      <Navbar />

      {/* ─── DYNAMIC HERO SECTION ─── */}
      <Hero />

      {/* ─── HOW IT WORKS (Upgraded) ─── */}
      <HowItWorks />

      {/* ─── LIVE CAMPUS MAP PREVIEW ─── */}
      <section className="py-24 bg-[#050B14] border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Watch the campus move in <span className="text-[#00C9E8]">real-time.</span>
            </h2>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Our intelligent dispatch system positions drivers near high-demand hotspots before you even request a ride, ensuring sub-3-minute pickup times across the entire campus.
            </p>
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-black text-white mb-1">2.4m</p>
                <p className="text-white/50 text-sm font-medium uppercase tracking-widest">Avg Pickup</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white mb-1">150+</p>
                <p className="text-white/50 text-sm font-medium uppercase tracking-widest">Active Drivers</p>
              </div>
            </div>
          </div>

          <div className="relative h-[400px] w-full rounded-[2rem] bg-[#0A0A0A] border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center group">
            <LiveMap />
            {/* Overlay Gradient to make it look like a screen */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ─── SAFETY FIRST TRUST BLOCK ─── */}
      <section className="py-24 bg-[#030712] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#0A101C] border border-[#00C9E8]/20 rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-[0_0_40px_rgba(0, 201, 232,0.05)]">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00C9E8]/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <div className="w-16 h-16 bg-[#00C9E8]/20 rounded-2xl flex items-center justify-center mb-8 border border-[#00C9E8]/30">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00C9E8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Zero chaos. <br/> <span className="text-[#00C9E8]">Perfectly scheduled.</span></h2>
                <p className="text-white/60 text-lg mb-8 leading-relaxed max-w-lg">
                  Say goodbye to scrambling at the hostel gates. Tove Drop brings order to your daily commute, allowing you to schedule rides in advance for a completely stress-free experience.
                </p>
                <ul className="space-y-4">
                  {[
                    "Schedule rides up to 24 hours in advance.",
                    "Guaranteed pick-up times for those 8 AM lectures.",
                    "No more chaotic scrambles or rushing for seats.",
                    "Automated, orderly digital queues during peak hours."
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-white font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Clock Visual */}
              <div className="relative h-[400px] flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-[#00C9E8]/5 rounded-full blur-[80px]"
                />
                <div className="relative w-64 h-72 bg-gradient-to-b from-white/10 to-transparent border border-white/20 rounded-t-full rounded-b-3xl backdrop-blur-xl flex items-center justify-center shadow-2xl">
                   <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#00C9E8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_15px_rgba(0, 201, 232,0.8)]"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STUDENT-FRIENDLY PRICING ─── */}
      <Pricing />

      {/* ─── DRIVER RECRUITMENT ─── */}
      <section className="py-24 bg-[#030712]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#0A101C] rounded-[3rem] overflow-hidden relative border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-[#0A101C] to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070')] bg-cover bg-center opacity-30 mix-blend-luminosity" />
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-transparent to-[#0A101C]" />
            
            <div className="relative z-10 p-12 md:p-20 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">Got a car? <br/> <span className="text-[#00C9E8]">Get paid to drive to class.</span></h2>
              <p className="text-white/80 text-lg mb-10 leading-relaxed">
                Turn your empty seats into passive income. Drive whenever you want, set your own schedule, and earn money helping your fellow students get around campus.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#00C9E8]/10 flex items-center justify-center backdrop-blur-md border border-[#00C9E8]/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00C9E8" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <div>
                    <p className="text-white font-bold">Earn instantly</p>
                    <p className="text-white/50 text-sm">Same-day payouts.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#00C9E8]/10 flex items-center justify-center backdrop-blur-md border border-[#00C9E8]/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00C9E8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <p className="text-white font-bold">Total flexibility</p>
                    <p className="text-white/50 text-sm">Be your own boss.</p>
                  </div>
                </div>
              </div>
              
              <button onClick={() => router.push('/login?role=driver')} className="bg-[#00C9E8] text-black font-black text-lg px-10 py-4 rounded-full hover:bg-[#99F1FF] transition-all hover:scale-105 shadow-[0_10px_30px_rgba(0, 201, 232,0.3)]">
                Apply to Drive
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/bg-cta.png')] bg-cover bg-center bg-no-repeat opacity-30 mix-blend-lighten" />
        <div className="absolute inset-0 bg-[#00C9E8]/5" />
        <div className="max-w-5xl mx-auto bg-[#030712]/80 backdrop-blur-xl rounded-[3rem] p-12 md:p-20 text-center border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#00C9E8]/10 via-transparent to-transparent" />
          
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10">Ready to move smarter?</h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10 relative z-10">
            Join thousands of Bowen students already experiencing the future of campus transit. First ride is on us.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <button 
              onClick={() => router.push('/login?role=passenger')}
              className="bg-white text-black font-bold text-lg px-10 py-4 rounded-full hover:bg-gray-200 transition-colors"
            >
              Get Started
            </button>
            <button 
              onClick={() => router.push('/login?role=driver')}
              className="bg-transparent border border-white/20 text-white font-bold text-lg px-10 py-4 rounded-full hover:bg-white/5 transition-colors"
            >
              Drive & Earn
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
}
