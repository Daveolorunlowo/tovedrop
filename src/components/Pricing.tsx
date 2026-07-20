"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00C9E8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Pricing() {
  const router = useRouter();

  return (
    <section className="py-28 bg-[#030712] border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-14"
        >
          <p className="text-[#00C9E8] text-xs font-bold uppercase tracking-[0.2em] mb-4">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
            Transparent pricing.<br />No surprises.
          </h2>
        </motion.div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-2 gap-6 items-start">

          {/* ── Carpool — Featured ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="relative rounded-2xl border border-[#00C9E8]/35 bg-gradient-to-b from-[#00C9E8]/8 to-transparent p-8"
            style={{ boxShadow: '0 0 0 1px rgba(0,201,232,0.1), 0 20px 50px rgba(0,0,0,0.4)' }}
          >
            {/* Most popular banner */}
            <div className="absolute -top-3.5 left-8">
              <span className="bg-[#00C9E8] text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                Most Popular
              </span>
            </div>

            <div className="mt-4">
              {/* Plan name */}
              <p className="text-white font-bold text-lg mb-6">Carpool</p>

              {/* Price */}
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-black text-white tracking-tight">₦250</span>
                <span className="text-white/40 text-sm pb-1.5">/ seat</span>
              </div>
              <p className="text-white/40 text-sm mb-8">Per shared seat. Up to 4 riders per trip.</p>

              {/* CTA */}
              <button
                onClick={() => router.push('/login?role=passenger')}
                className="w-full py-3.5 rounded-xl bg-[#00C9E8] text-black text-sm font-bold hover:bg-[#00C9E8]/90 transition-colors mb-8"
              >
                Book Carpool
              </button>

              {/* Divider */}
              <div className="border-t border-white/8 mb-6" />

              {/* Features */}
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-5">What&apos;s included</p>
              <ul className="space-y-4">
                {[
                  'Share with up to 4 riders',
                  'Lowest fare on campus',
                  'Real-time driver tracking',
                  'Eco-friendly routing',
                  'Instant digital receipt',
                  'In-app campus navigation',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckIcon />
                    <span className="text-white/70 text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* ── Solo Ride ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.18 }}
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-8"
          >
            {/* Plan name */}
            <p className="text-white/70 font-bold text-lg mb-6">Solo Ride</p>

            {/* Price */}
            <div className="flex items-end gap-2 mb-1">
              <span className="text-5xl font-black text-white/60 tracking-tight">₦900</span>
              <span className="text-white/25 text-sm pb-1.5">/ ride</span>
            </div>
            <p className="text-white/30 text-sm mb-8">Private ride, direct routing, no shared stops.</p>

            {/* CTA */}
            <button
              onClick={() => router.push('/login?role=passenger')}
              className="w-full py-3.5 rounded-xl border border-white/15 text-white/70 text-sm font-semibold hover:bg-white/5 hover:text-white hover:border-white/30 transition-all mb-8"
            >
              Book Solo
            </button>

            {/* Divider */}
            <div className="border-t border-white/5 mb-6" />

            {/* Features */}
            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-5">What&apos;s included</p>
            <ul className="space-y-4">
              {[
                'Private, direct route',
                'No shared stops',
                'Priority driver matching',
                'Real-time driver tracking',
                'Instant digital receipt',
                'In-app campus navigation',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-white/40 text-sm">{f}</span>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>

        {/* Bottom trust line */}
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="text-center text-white/20 text-xs mt-10"
        >
          No surge pricing · No hidden fees · Cancel anytime
        </motion.p>

      </div>
    </section>
  );
}
