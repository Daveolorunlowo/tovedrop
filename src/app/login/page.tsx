"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { auth } from '../../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';

function getFriendlyError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address doesn\'t look right.';
    case 'auth/user-not-found':
      return 'No account found with that email. Sign up instead?';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Sign in instead?';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Popup was blocked. Please allow popups for this site.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method isn\'t enabled. Contact support.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'passenger';

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isDriver = role === 'driver';
  
  // Choose accent color depending on role
  const accentColor = isDriver ? 'text-[#04265E]' : 'text-[#00A3C4]';
  const gradientClass = isDriver ? 'gradient-text-cyan' : 'gradient-text-cyan'; // Same gradient for now

  const destination = isDriver ? '/driver' : '/dashboard';

  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMsg('');
  };

  const handleToggleMode = () => {
    setIsSignUp((prev) => !prev);
    clearForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isSignUp && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(userCredential.user, { displayName: name.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push(destination);
    } catch (error: any) {
      setErrorMsg(getFriendlyError(error.code));
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push(destination);
    } catch (error: any) {
      setErrorMsg(getFriendlyError(error.code));
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A192F] flex flex-col items-center justify-center relative overflow-hidden font-sans">

      {/* ── BACKGROUND ORBS ──────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#00A3C4]/10 blur-[120px] animate-orb-drift-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#04265E]/10 blur-[140px] animate-orb-drift-2" />
        <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full bg-blue-600/10 blur-[100px] animate-orb-drift-3" />
      </div>

      <div className="w-full max-w-md mx-auto z-10 px-6 flex flex-col min-h-screen relative">
        {/* Glow behind the form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[60%] bg-[#112240] rounded-[3rem] blur-[80px] -z-10 opacity-60" />

        {/* Back Button */}
        <div className="pt-12 pb-4 flex items-center relative z-20">
          <button
            onClick={() => router.push('/')}
            className="p-3 -ml-3 rounded-full hover:bg-white/10 transition-colors backdrop-blur-md"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center pb-10">

          {/* ── HEADER ─────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? 'signup-heading' : 'signin-heading'}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-black text-white mb-3 font-heading leading-tight">
                {isSignUp ? (
                  <>Create your<br />account,{' '}
                    <span className="shimmer-text">{isDriver ? 'Driver' : 'Rider'}</span>
                  </>
                ) : (
                  <>Welcome back,<br />
                    <span className="shimmer-text">{isDriver ? 'Driver' : 'Rider'}</span>
                  </>
                )}
              </h1>
              <p className="text-slate-400 text-lg">
                {isSignUp
                  ? 'Join Tove Drop and get moving.'
                  : 'Sign in to continue to Tove Drop.'}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
            className="glass-navy p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-2xl relative"
          >
            {/* Subtle inner top highlight */}
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* ── TOGGLE TABS ────────────────────────────────── */}
          <div className="relative flex mb-8 bg-[#0A192F]/60 backdrop-blur-md rounded-2xl p-1.5 border border-white/5 shadow-inner">
            {/* Sliding Pill Indicator */}
            <div
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-white/15 to-white/5 rounded-xl shadow-sm transition-all duration-300 ease-out z-0"
              style={{ left: isSignUp ? 'calc(50% + 3px)' : '6px' }}
            />
            
            <button
              onClick={() => !isSignUp || handleToggleMode()}
              className={`relative z-10 flex-1 py-3 rounded-xl text-sm font-bold transition-colors duration-300 ${
                !isSignUp ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => isSignUp || handleToggleMode()}
              className={`relative z-10 flex-1 py-3 rounded-xl text-sm font-bold transition-colors duration-300 ${
                isSignUp ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* ── FORM ───────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="relative pt-1">
                    <div className="absolute inset-y-0 top-1 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="input-premium pl-12"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-slate-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="University Email"
                className="input-premium pl-12"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-slate-500" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="input-premium pl-12"
              />
            </div>

            {/* Confirm Password (Sign Up only) */}
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="relative pt-1">
                    <div className="absolute inset-y-0 top-1 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-500" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="input-premium pl-12"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot Password (Sign In only) */}
            {!isSignUp && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium rounded-xl px-4 py-3 shadow-[0_4px_12px_rgba(239,68,68,0.1)]"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className={`w-full py-4 rounded-2xl font-black text-[#0A192F] text-lg transition-all flex justify-center items-center gap-2 ripple-container mt-4
                ${isDriver ? 'btn-glow-cyan' : 'btn-glow-cyan'}
                ${isLoading ? 'opacity-80' : ''}
              `}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-[#0A192F]/30 border-t-[#0A192F] rounded-full animate-spin" />
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* ── GOOGLE BUTTON ──────────────────────────────── */}
          <div className="relative mb-6 mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 py-1 backdrop-blur-md bg-[#0A192F]/80 text-slate-400 font-black uppercase tracking-widest rounded-full border border-white/5 shadow-sm">
                Or continue with
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleAuth}
            type="button"
            disabled={isLoading || isGoogleLoading}
            className="w-full bg-white text-slate-800 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all disabled:opacity-70 shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            {isGoogleLoading ? (
              <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
                {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
              </>
            )}
          </motion.button>
          
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A192F]" />}>
      <LoginContent />
    </Suspense>
  );
}
