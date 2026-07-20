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

      {/* ─── LIVE MAP SECTION — Framed Dashboard ─── */}
      <section className="border-t border-white/5 bg-[#030712] py-24">
        <div className="max-w-6xl mx-auto px-6">

          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#00C9E8] animate-pulse" />
            <span className="text-[#00C9E8] text-xs font-bold uppercase tracking-[0.25em]">Live Dispatch</span>
          </motion.div>

          {/* Headline row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
              The whole campus,<br />
              <span className="text-[#00C9E8]">always moving.</span>
            </h2>
            <div className="flex items-center gap-6 md:pb-1">
              <div className="text-right">
                <p className="text-2xl font-black text-white">2.4<span className="text-[#00C9E8]">m</span></p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Avg Pickup</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-right">
                <p className="text-2xl font-black text-white">150<span className="text-[#00C9E8]">+</span></p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Drivers Online</p>
              </div>
            </div>
          </motion.div>

          {/* Map frame */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-[500px] rounded-3xl overflow-hidden"
            style={{ boxShadow: '0 0 0 1px rgba(0,201,232,0.2), 0 0 60px rgba(0,201,232,0.05), 0 30px 80px rgba(0,0,0,0.6)' }}
          >
            {/* Cyan corner accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#00C9E8]/60 rounded-tl-3xl z-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#00C9E8]/60 rounded-tr-3xl z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#00C9E8]/60 rounded-bl-3xl z-20 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#00C9E8]/60 rounded-br-3xl z-20 pointer-events-none" />

            {/* The actual map */}
            <LiveMap />

            {/* Dark scrim — bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none z-10" />

            {/* Top-left overlay: status */}
            <div className="absolute top-5 left-5 z-20 flex items-center gap-2 bg-black/70 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
              </span>
              <span className="text-white text-xs font-semibold">System Operational</span>
            </div>

            {/* Bottom-right overlay: last-updated */}
            <div className="absolute bottom-5 right-5 z-20 bg-black/70 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-xl">
              <p className="text-white/30 text-[10px] uppercase tracking-widest">Updated</p>
              <p className="text-white text-xs font-bold">Just now</p>
            </div>
          </motion.div>
        </div>
      </section>



      {/* ─── SCHEDULING — Boarding Pass Layout ─── */}
      <section className="border-t border-white/5 bg-[#030712] py-28 overflow-hidden relative">

        {/* Radial glow behind content */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-[#00C9E8]/5 blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">

          {/* Centered headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black text-white tracking-tighter leading-[1.05] mb-4">
              Your ride.<br />
              <span className="text-[#00C9E8]">Already waiting.</span>
            </h2>
            <p className="text-white/30 text-base max-w-sm mx-auto">
              Schedule up to 24h ahead. Guaranteed seats, zero gate chaos.
            </p>
          </motion.div>

          {/* Boarding pass cards + connecting timeline */}
          <div className="relative">
            {/* Horizontal connecting line */}
            <div className="hidden lg:block absolute top-[4.5rem] left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-[#00C9E8]/20 to-transparent z-0" />

            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  time: "7:45 AM",
                  from: "Block A Hostel",
                  to: "Faculty of Sciences",
                  seats: "2 seats left",
                  status: "Boarding",
                  active: true,
                },
                {
                  time: "10:00 AM",
                  from: "Main Gate",
                  to: "University Library",
                  seats: "4 seats",
                  status: "Upcoming",
                  active: false,
                },
                {
                  time: "2:30 PM",
                  from: "Sports Complex",
                  to: "Block C Hostels",
                  seats: "6 seats",
                  status: "Open",
                  active: false,
                },
              ].map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative rounded-3xl p-6 flex flex-col gap-5 transition-all ${
                    r.active
                      ? 'bg-gradient-to-b from-[#00C9E8]/15 to-[#00C9E8]/5 border border-[#00C9E8]/40 shadow-[0_0_40px_rgba(0,201,232,0.1)]'
                      : 'bg-white/[0.03] border border-white/8 hover:border-white/15'
                  }`}
                >
                  {/* Timeline node */}
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 ${
                    r.active ? 'bg-[#00C9E8] border-[#00C9E8]' : 'bg-[#030712] border-white/20'
                  }`}>
                    {r.active && (
                      <span className="absolute w-full h-full rounded-full bg-[#00C9E8] animate-ping opacity-40" />
                    )}
                    <div className={`w-2 h-2 rounded-full ${r.active ? 'bg-black' : 'bg-white/20'}`} />
                  </div>

                  {/* Top: time + status */}
                  <div className="flex items-start justify-between pt-2">
                    <div>
                      <p className={`text-3xl font-black tracking-tight ${r.active ? 'text-[#00C9E8]' : 'text-white/50'}`}>{r.time}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mt-1 ${
                      r.active
                        ? 'bg-[#00C9E8] text-black'
                        : 'border border-white/10 text-white/25'
                    }`}>{r.status}</span>
                  </div>

                  {/* Divider with dashes */}
                  <div className="flex items-center gap-1.5 my-1">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${r.active ? 'bg-[#00C9E8]' : 'bg-white/20'}`} />
                    <div className="flex-1 h-px border-t border-dashed border-white/10" />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={r.active ? '#00C9E8' : 'rgba(255,255,255,0.2)'} strokeWidth="2" strokeLinecap="round"><path d="M5 12h14m-4-4 4 4-4 4"/></svg>
                  </div>

                  {/* Route */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-white/25 uppercase tracking-widest mb-0.5">From</p>
                      <p className="text-white/70 text-sm font-medium">{r.from}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/25 uppercase tracking-widest mb-0.5">To</p>
                      <p className={`text-sm font-bold ${r.active ? 'text-white' : 'text-white/60'}`}>{r.to}</p>
                    </div>
                  </div>

                  {/* Footer: seats */}
                  <div className={`flex items-center justify-between pt-4 border-t ${r.active ? 'border-[#00C9E8]/20' : 'border-white/5'}`}>
                    <p className="text-xs text-white/30">{r.seats}</p>
                    <button className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all ${
                      r.active
                        ? 'bg-[#00C9E8] text-black hover:bg-[#00C9E8]/80'
                        : 'border border-white/10 text-white/30 hover:border-white/20 hover:text-white/50'
                    }`}>
                      {r.active ? 'Book now' : 'Reserve'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* ─── PRICING ─── */}
      <Pricing />

      {/* ─── DRIVER RECRUITMENT — Simple & Unique ─── */}
      <section className="py-32 bg-[#030712] border-t border-white/5 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#00C9E8]/5 to-transparent rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-center">
            
            {/* Left: Statement */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="lg:col-span-5 z-20"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8">
                <span className="w-2 h-2 rounded-full bg-[#00C9E8] animate-pulse" />
                <span className="text-white/70 text-xs font-bold tracking-widest uppercase">Now onboarding</span>
              </div>
              
              <h2 className="text-[clamp(3rem,6vw,4.5rem)] font-black text-white tracking-tighter leading-[1.05] mb-6">
                Your car.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C9E8] to-blue-400">Your rules.</span>
              </h2>
              
              <p className="text-white/40 text-lg leading-relaxed mb-10 max-w-md">
                Turn your daily commute into a flexible opportunity. No quotas, no rigid schedules — just open roads and verified campus riders.
              </p>

              <button
                onClick={() => router.push('/login?role=driver')}
                className="group relative px-8 py-4 bg-white text-black text-sm font-black rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-[#00C9E8] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center gap-2 group-hover:text-black">
                  Start Driving Today
                  <svg className="group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14m-4-4 4 4-4 4"/></svg>
                </span>
              </button>
            </motion.div>

            {/* Right: Floating Digital Pass Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="lg:col-span-7 flex justify-center lg:justify-end relative z-10"
            >
              {/* Decorative concentric circles behind */}
              <div className="absolute top-1/2 left-1/2 lg:left-[60%] -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square max-w-[500px] border border-white/[0.03] rounded-full animate-[spin_60s_linear_infinite]" />
              <div className="absolute top-1/2 left-1/2 lg:left-[60%] -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square max-w-[380px] border border-[#00C9E8]/10 rounded-full border-dashed animate-[spin_40s_linear_infinite_reverse]" />
              
              {/* Floating Pass Card */}
              <motion.div
                animate={{ y: [-12, 12, -12], rotate: [-1, 1, -1] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-full max-w-[380px] aspect-[4/5] rounded-[2rem] bg-[#0A101C]/80 backdrop-blur-2xl p-8 flex flex-col justify-between shadow-2xl"
                style={{
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                {/* Glow inside card */}
                <div className="absolute -top-24 -right-24 w-56 h-56 bg-[#00C9E8]/20 rounded-full blur-[60px] pointer-events-none" />
                
                {/* Top: Header */}
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Driver Status</p>
                    <div className="flex items-center gap-2 bg-[#00C9E8]/10 border border-[#00C9E8]/20 px-3 py-1.5 rounded-full w-max">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00C9E8] shadow-[0_0_8px_#00C9E8]" />
                      <p className="text-[#00C9E8] text-xs font-bold tracking-wide">Online & Ready</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center bg-white/[0.02]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white/50" strokeWidth="1.5" strokeLinecap="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                </div>

                {/* Middle: Perks */}
                <div className="space-y-5 relative z-10 my-auto pt-8">
                  {[
                    { icon: "⚡", title: "Instant Payouts", desc: "Cash out after every shift" },
                    { icon: "🛡️", title: "Verified Riders", desc: "Campus community only" },
                    { icon: "🎯", title: "Zero Commission", desc: "Keep 100% on first 30 rides" }
                  ].map((perk, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0">
                        <span className="text-[#00C9E8] text-lg">{perk.icon}</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold">{perk.title}</p>
                        <p className="text-white/40 text-[11px] mt-0.5">{perk.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom: Barcode aesthetic */}
                <div className="relative z-10 pt-6 border-t border-white/5 flex justify-between items-end mt-8">
                  <div>
                    <p className="text-white/30 text-[9px] uppercase tracking-[0.2em] font-bold mb-1.5">Access Code</p>
                    <p className="text-white/70 font-mono text-sm tracking-widest">BWN-88X</p>
                  </div>
                  {/* Fake barcode lines */}
                  <div className="flex gap-[3px] h-8 opacity-30">
                    {[1,2,1,3,1,2,2,1,1,2,1].map((w, i) => (
                      <div key={i} className="bg-white rounded-sm h-full" style={{ width: `${w * 2}px` }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>



      {/* ─── CTA ─── */}
      <section className="py-28 bg-[#030712] border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
              Ready to move?
            </h2>
            <p className="text-white/40 text-lg mb-10 max-w-md mx-auto">
              Join the students already riding smarter around Bowen.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => router.push('/login?role=passenger')}
                className="bg-white text-black font-semibold text-base px-10 py-4 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Book a Ride
              </button>
              <button
                onClick={() => router.push('/login?role=driver')}
                className="border border-white/20 text-white font-semibold text-base px-10 py-4 rounded-xl hover:bg-white/5 transition-colors"
              >
                Drive & Earn
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
}
