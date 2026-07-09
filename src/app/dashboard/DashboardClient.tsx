"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, ArrowLeft, Car, Bus, Wallet, Shield, History, User, 
  MapPin, Clock, PhoneCall, Bell, ChevronRight, AlertTriangle, 
  CheckCircle2, AlertCircle, LogOut, Search, Edit2, Bookmark, CreditCard, ShieldAlert,
  HelpCircle, MoreHorizontal, X, Plus
} from 'lucide-react';
import { requestRide, listenToRides, fetchRideHistory, fetchScheduledRides, cancelRide, RideRequest, getUserWalletBalance, fundWallet } from '../../lib/rideService';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { usePaystackPayment } from 'react-paystack';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('../../components/LiveMap'), { ssr: false });

type ViewState = 'RIDE' | 'ACTIVITY' | 'SCHEDULE' | 'PROFILE';

export default function PassengerDashboard() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewState>('RIDE');
  const [selectedService, setSelectedService] = useState<'SOLO' | 'CARPOOL'>('SOLO');
  const [isWaitingForDriver, setIsWaitingForDriver] = useState(false);
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTimeOfDay, setScheduledTimeOfDay] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Wallet State
  const [walletBalance, setWalletBalance] = useState(2450);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');

  // History & Schedule State
  const [historyRides, setHistoryRides] = useState<RideRequest[]>([]);
  const [scheduledRidesList, setScheduledRidesList] = useState<RideRequest[]>([]);

  // Fetch History / Schedule when view changes
  useEffect(() => {
    if (!userId) return;
    getUserWalletBalance(userId).then(setWalletBalance);
    
    if (currentView === 'ACTIVITY') {
      fetchRideHistory(userId, 'passenger').then(setHistoryRides);
    } else if (currentView === 'SCHEDULE') {
      fetchScheduledRides(userId, 'passenger').then(setScheduledRidesList);
    }
  }, [currentView, userId]);

  // Profile State
  const [profileName, setProfileName] = useState('Alex B.');
  const [profileEmail, setProfileEmail] = useState('alex.b@bowen.edu.ng');
  const [profilePhone, setProfilePhone] = useState('+234 800 000 0000');
  const [profileDept, setProfileDept] = useState('Computer Science');
  const [profileMatric, setProfileMatric] = useState('BU25MCT1045');
  const [profilePic, setProfilePic] = useState('https://i.pravatar.cc/150?img=11');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paystack Integration
  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: profileEmail || "passenger@bowen.edu.ng",
    amount: (parseInt(topUpAmount) || 0) * 100, // Paystack requires kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_b8eb4ce01eabfaef2f1e29cbb8dc8e2353063db1', // Use actual key in .env or fallback
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaystackSuccess = async (reference: any) => {
    if (userId) {
      const amount = parseInt(topUpAmount) || 0;
      await fundWallet(userId, amount);
      setWalletBalance(prev => prev + amount);
      setShowTopUp(false);
      setTopUpAmount('');
      alert(`Wallet funded successfully with ₦${amount}!`);
    }
  };

  const handlePaystackClose = () => {
    console.log('Payment modal closed');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePic(url);
    }
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem('bowen_passenger_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.phone) setProfilePhone(parsed.phone);
        if (parsed.dept) setProfileDept(parsed.dept);
        if (parsed.matric) setProfileMatric(parsed.matric);
        if (parsed.pic) setProfilePic(parsed.pic);
      } catch (e) {
        console.error("Error parsing profile data", e);
      }
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        if (user.displayName) {
          setProfileName(user.displayName);
          setPassengerName(user.displayName);
        }
        if (user.email) {
          setProfileEmail(user.email);
        }
      } else {
        router.push('/login?role=passenger');
      }
      setIsAuthChecking(false);
    });
    
    return () => unsubscribe();
  }, [router]);

  const handleSaveProfile = () => {
    const profileData = {
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
      dept: profileDept,
      matric: profileMatric,
      pic: profilePic
    };
    localStorage.setItem('bowen_passenger_profile', JSON.stringify(profileData));
    setPassengerName(profileName);
    setIsEditingProfile(false);
  };

  useEffect(() => {
    if (!activeRideId) return;

    const unsubscribe = listenToRides((rides) => {
      const myRide = rides.find(r => r.id === activeRideId);
      if (myRide && myRide.status === 'accepted') {
        router.push(`/tracking?rideId=${myRide.id}`);
      }
    });

    return () => unsubscribe();
  }, [activeRideId, router]);

  const handleRequestRide = async () => {
    if (!userId) return;
    if (!passengerName.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!pickup.trim()) {
      alert("Please enter a pickup location.");
      return;
    }
    if (!dropoff.trim()) {
      alert("Please enter a drop-off location.");
      return;
    }
    if (isScheduling && (!scheduledDate || !scheduledTimeOfDay)) {
      alert("Please select both a valid date and time.");
      return;
    }
    
    let timestamp: number | undefined = undefined;
    if (isScheduling) {
      timestamp = new Date(`${scheduledDate}T${scheduledTimeOfDay}`).getTime();
      const now = Date.now();
      if (timestamp <= now || timestamp > now + 24 * 60 * 60 * 1000) {
        alert("Please schedule a time within the next 24 hours.");
        return;
      }
    }

    setIsWaitingForDriver(true);
    try {
      const rideId = await requestRide(userId, selectedService, pickup, dropoff, timestamp, notes, passengerName);
      
      if (isScheduling) {
        alert("Ride scheduled successfully!");
        setIsWaitingForDriver(false);
        setIsScheduling(false);
        setScheduledDate('');
        setScheduledTimeOfDay('');
        setNotes('');
        setPickup('');
        setDropoff('');
        // We don't push to tracking immediately for a scheduled ride
      } else {
        setActiveRideId(rideId);
      }
    } catch (e: any) {
      console.error(e);
      alert("Error requesting ride: " + e.message);
      setIsWaitingForDriver(false);
    }
  };

  const handleCancelSearch = async () => {
    if (activeRideId) {
      try {
        await cancelRide(activeRideId);
      } catch (e) {
        console.error("Error cancelling ride:", e);
      }
      setActiveRideId(null);
    }
    setIsWaitingForDriver(false);
  };

  // -------------------------------------------------------------
  // RIDE VIEW
  // -------------------------------------------------------------
  const renderRide = () => (
    <div className="w-full h-full relative bg-gray-100 flex flex-col pb-24 overflow-hidden">
      {/* Real-time Map Background */}
      <div className="absolute inset-0 z-0">
        <LiveMap />
      </div>

      {/* Header - Glassmorphism */}
      <div className="absolute top-0 w-full z-10 glass-navy px-4 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Menu className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/Tovedrop-removebg-preview.png" alt="Tove Drop Logo" className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
          <MapPin className="w-4 h-4 text-[#00A3C4]" />
          <span className="text-xs font-bold text-white">Main Campus</span>
        </div>
      </div>

      {/* Floating GPS Button */}
      <div className="absolute right-4 bottom-80 z-10 flex flex-col gap-3">
        <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#0A192F] hover:bg-gray-50 active:scale-95 transition-transform">
          <Search className="w-5 h-5" />
        </button>
        <button className="w-12 h-12 bg-[#0A192F] rounded-full shadow-[0_4px_20px_rgba(10,25,47,0.4)] flex items-center justify-center text-[#04265E] hover:bg-[#112240] active:scale-95 transition-transform relative">
          <span className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-[#04265E]" />
          <MapPin className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Sheet UI */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute bottom-[72px] w-full z-20 bg-white rounded-t-[2.5rem] shadow-[0_-20px_40px_rgba(0,0,0,0.15)] flex flex-col pt-3 pb-6 px-6 max-h-[85vh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
        
        <div className="mb-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Name</label>
            <input 
              type="text" 
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#0A192F] font-medium focus:outline-none focus:border-[#04265E] focus:ring-1 focus:ring-[#04265E]"
            />
          </div>

          {/* Saved Places */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Saved Places</label>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {['Male Hostel', 'Library', 'Main Gate', 'Clinic'].map((place) => (
                <button
                  key={place}
                  onClick={() => setDropoff(place)}
                  className="bg-gray-100 hover:bg-gray-200 text-[#0A192F] px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors"
                >
                  📍 {place}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pickup</label>
              <input 
                type="text" 
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="e.g. Main Gate"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#0A192F] font-medium focus:outline-none focus:border-[#04265E] focus:ring-1 focus:ring-[#04265E]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Drop-off</label>
              <input 
                type="text" 
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="e.g. Block A"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#0A192F] font-medium focus:outline-none focus:border-[#04265E] focus:ring-1 focus:ring-[#04265E]"
              />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-black text-[#0A192F] mb-6 font-heading">Select Service</h2>

        <div className="space-y-4 mb-6">
          {/* Solo Card */}
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedService('SOLO')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all relative overflow-hidden mb-3 ${
              selectedService === 'SOLO' 
                ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-[#04265E] shadow-[0_4px_20px_rgba(4, 38, 94,0.15)]' 
                : 'bg-white border-2 border-gray-100 shadow-sm hover:border-orange-200'
            }`}
          >
            {selectedService === 'SOLO' && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#04265E]/0 via-[#04265E]/5 to-[#04265E]/0 animate-shimmer pointer-events-none" />
            )}
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                selectedService === 'SOLO' ? 'bg-[#04265E] text-white shadow-md' : 'bg-gray-100 text-[#0A192F]'
              }`}>
                <Car className="w-7 h-7" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-[#0A192F] text-lg">Solo Ride</span>
                </div>
                <p className="text-sm text-gray-500 font-medium">1-4 seats • Private</p>
              </div>
            </div>
            <div className="text-right relative z-10">
              <span className="text-2xl font-black text-[#0A192F]">₦900</span>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Flat Rate</p>
            </div>
          </motion.button>

          {/* Carpool Card */}
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 24 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedService('CARPOOL')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all relative overflow-hidden ${
              selectedService === 'CARPOOL' 
                ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-[#04265E] shadow-[0_4px_20px_rgba(4, 38, 94,0.15)]' 
                : 'bg-white border-2 border-gray-100 shadow-sm hover:border-orange-200'
            }`}
          >
            {selectedService === 'CARPOOL' && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#04265E]/0 via-[#04265E]/5 to-[#04265E]/0 animate-shimmer pointer-events-none" />
            )}
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                selectedService === 'CARPOOL' ? 'bg-[#04265E] text-white shadow-md' : 'bg-gray-100 text-[#0A192F]'
              }`}>
                <Bus className="w-7 h-7" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-[#0A192F] text-lg">Carpool</span>
                </div>
                <p className="text-sm text-gray-500 font-medium">Shared • Affordable</p>
              </div>
            </div>
            <div className="text-right relative z-10">
              <span className="text-2xl font-black text-[#0A192F]">₦250</span>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Per Seat</p>
            </div>
          </motion.button>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6"></div>

        {/* Payment Method */}
        <div className="bg-[#112240] rounded-2xl p-4 flex items-center justify-between mb-6 shadow-md border border-[#112240]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[#00A3C4]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Tove Wallet</p>
              <p className="text-xs text-[#00A3C4] font-medium">Balance: ₦{walletBalance.toLocaleString()}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowTopUp(true)}
            className="flex items-center gap-1 text-white hover:text-white font-bold text-sm bg-cyan-500/20 text-cyan-400 px-3 py-1.5 rounded-lg transition-colors border border-cyan-500/30"
          >
            <Plus className="w-4 h-4" /> Top Up
          </button>
        </div>

        {/* Schedule Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
          <button 
            onClick={() => setIsScheduling(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isScheduling ? 'bg-white shadow-sm text-[#0A192F]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Ride Now
          </button>
          <button 
            onClick={() => setIsScheduling(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isScheduling ? 'bg-white shadow-sm text-[#0A192F]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Schedule
          </button>
        </div>

        {/* Date Time Picker */}
        <AnimatePresence>
          {isScheduling && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-visible"
            >
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Date & Time</label>
              <div className="flex gap-3">
                <input 
                  type="date" 
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#0A192F] font-medium focus:outline-none focus:border-[#04265E] focus:ring-1 focus:ring-[#04265E]"
                />
                <input 
                  type="time" 
                  value={scheduledTimeOfDay}
                  onChange={(e) => setScheduledTimeOfDay(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#0A192F] font-medium focus:outline-none focus:border-[#04265E] focus:ring-1 focus:ring-[#04265E]"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                You can schedule up to 24 hours in advance.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Essential Details (Notes) */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Essential Details</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any essential details (e.g. luggage, exact pickup spot...)"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#0A192F] font-medium focus:outline-none focus:border-[#04265E] focus:ring-1 focus:ring-[#04265E] resize-none h-20"
          />
        </div>

        {/* Fare Disclaimer */}
        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
          * Fares include 15% Tove Platform Fee
        </p>

        {/* Request Button */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRequestRide}
          disabled={isWaitingForDriver}
          className={`relative w-full font-black py-5 rounded-2xl text-xl transition-all flex justify-center items-center gap-3 overflow-hidden shadow-[0_10px_30px_rgba(21,211,229,0.35)] ${
            isWaitingForDriver 
              ? 'bg-orange-200 text-orange-800 cursor-wait shadow-none' 
              : 'btn-glow-cyan text-[#0A192F]'
          }`}
        >
          {isWaitingForDriver ? (
            <>
              {/* Spinner */}
              <div className="w-6 h-6 border-3 border-orange-600/30 border-t-orange-600 rounded-full animate-spin"></div>
              <span>Searching for Driver...</span>
              {/* Pulse overlay */}
              <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
            </>
          ) : (
            <>
              {isScheduling ? 'Schedule' : 'Request'} {selectedService === 'SOLO' ? 'Solo' : 'Carpool'}
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
        
        {/* Cancel Search Button */}
        <AnimatePresence>
          {isWaitingForDriver && (
            <motion.button
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              onClick={handleCancelSearch}
              className="w-full text-center py-3 font-bold text-red-500 hover:text-red-600 transition-colors bg-red-50 hover:bg-red-100 rounded-xl"
            >
              Cancel Search
            </motion.button>
          )}
        </AnimatePresence>
        
        {/* Extra padding to ensure the button isn't obstructed by bottom nav or screen edges */}
        <div className="h-12 w-full flex-shrink-0" />
      </motion.div>
    </div>
  );

  // -------------------------------------------------------------
  // BOTTOM NAVIGATION (Sleek Premium Floating)
  // -------------------------------------------------------------
  const renderBottomNav = () => {
    const tabs = [
      { id: 'RIDE', icon: Car, label: 'Ride' },
      { id: 'ACTIVITY', icon: History, label: 'Activity' },
      { id: 'SCHEDULE', icon: Clock, label: 'Schedule' },
      { id: 'PROFILE', icon: User, label: 'Profile' },
    ];

    return (
      <div className="absolute bottom-6 left-4 right-4 z-50 pointer-events-none">
        <div className="pointer-events-auto bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl p-1.5 flex justify-between items-center max-w-sm mx-auto relative overflow-hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setCurrentView(tab.id as ViewState)}
                className={`relative z-10 flex flex-col items-center gap-1 py-2 px-1 w-full transition-colors duration-300 ${
                  isActive ? 'text-[#0A192F]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="passenger-nav-pill"
                    className="absolute inset-0 bg-white shadow-sm rounded-2xl -z-10 border border-gray-100"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="w-6 h-6 flex items-center justify-center relative">
                  <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'scale-110 text-[#04265E]' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div 
                      layoutId="passenger-nav-dot"
                      className="absolute -bottom-3 w-1 h-1 bg-[#04265E] rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
                <span className={`text-[10px] transition-all duration-300 mt-1 ${isActive ? 'font-black opacity-100' : 'font-semibold opacity-70'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // We'll just show placeholders for the other views, keeping the styling premium
  const renderActivity = () => (
    <div className="w-full h-full bg-slate-50 flex flex-col p-6 overflow-y-auto pb-32">
      <h2 className="text-2xl font-black text-[#0A192F] mb-6">Activity History</h2>
      
      {historyRides.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <History className="w-10 h-10" />
          </div>
          <p className="text-slate-500 font-medium">You have no past rides.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {historyRides.map(ride => (
            <div key={ride.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {new Date(ride.timestamp).toLocaleDateString()}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                  ride.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {ride.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-[#0A192F]">
                  {ride.service === 'SOLO' ? <Car className="w-5 h-5" /> : <Bus className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-[#0A192F] font-bold">{ride.dropoff}</p>
                  <p className="text-xs text-slate-500 font-medium">From: {ride.pickup}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSchedule = () => (
    <div className="w-full h-full bg-slate-50 flex flex-col p-6 overflow-y-auto pb-32">
      <h2 className="text-2xl font-black text-[#0A192F] mb-6">Scheduled Rides</h2>
      
      {scheduledRidesList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Clock className="w-10 h-10" />
          </div>
          <p className="text-slate-500 font-medium">No upcoming scheduled rides.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {scheduledRidesList.map(ride => (
            <div key={ride.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#00C9E8]" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-[#00C9E8] uppercase tracking-widest">
                  {ride.scheduledTime ? new Date(ride.scheduledTime).toLocaleString() : 'Pending Time'}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-orange-100 text-orange-600">
                  {ride.status === 'accepted' ? 'Driver Found' : 'Searching'}
                </span>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-[#0A192F] font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500"/> {ride.pickup}</p>
                <p className="text-[#0A192F] font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500"/> {ride.dropoff}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="w-full h-full bg-slate-50 flex flex-col pt-12 pb-24 px-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-[#0A192F] font-heading">Profile</h2>
        <button 
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="bg-white p-2.5 rounded-xl shadow-sm text-slate-600 hover:text-[#04265E] transition-colors"
        >
          <Edit2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <img src={profilePic} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover" />
          {isEditingProfile && (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-[#04265E] p-2 rounded-full text-white shadow-md hover:bg-orange-600 transition-colors active:scale-95"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        <h3 className="text-xl font-black text-[#0A192F] mt-4">{profileName}</h3>
        <p className="text-sm text-slate-500 font-medium">Passenger</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 space-y-5">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
          {isEditingProfile ? (
            <input 
              type="text" 
              value={profileName} 
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0A192F] font-bold focus:outline-none focus:border-[#04265E]"
            />
          ) : (
            <div className="text-[#0A192F] font-bold px-1">{profileName}</div>
          )}
        </div>

        <div className="h-px bg-slate-100"></div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
          {isEditingProfile ? (
            <input 
              type="email" 
              value={profileEmail} 
              onChange={(e) => setProfileEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0A192F] font-bold focus:outline-none focus:border-[#04265E]"
            />
          ) : (
            <div className="text-[#0A192F] font-bold px-1">{profileEmail}</div>
          )}
        </div>

        <div className="h-px bg-slate-100"></div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Matric Number</label>
          {isEditingProfile ? (
            <input 
              type="text" 
              value={profileMatric} 
              onChange={(e) => setProfileMatric(e.target.value.toUpperCase())}
              placeholder="e.g. BU25MCT1045"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0A192F] font-bold focus:outline-none focus:border-[#04265E]"
            />
          ) : (
            <div className="text-[#0A192F] font-bold px-1">{profileMatric}</div>
          )}
        </div>

        <div className="h-px bg-slate-100"></div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</label>
          {isEditingProfile ? (
            <input 
              type="tel" 
              value={profilePhone} 
              onChange={(e) => setProfilePhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0A192F] font-bold focus:outline-none focus:border-[#04265E]"
            />
          ) : (
            <div className="text-[#0A192F] font-bold px-1">{profilePhone}</div>
          )}
        </div>

        <div className="h-px bg-slate-100"></div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Department</label>
          {isEditingProfile ? (
            <input 
              type="text" 
              value={profileDept} 
              onChange={(e) => setProfileDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0A192F] font-bold focus:outline-none focus:border-[#04265E]"
            />
          ) : (
            <div className="text-[#0A192F] font-bold px-1">{profileDept}</div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isEditingProfile && (
          <motion.button 
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            onClick={handleSaveProfile}
            className="mt-8 w-full py-4 btn-glow-cyan text-white rounded-2xl font-black text-lg tracking-wide shadow-lg transition-transform active:scale-95"
          >
            SAVE CHANGES
          </motion.button>
        )}
      </AnimatePresence>

      {!isEditingProfile && (
        <button 
          onClick={async () => {
            await signOut(auth);
          }}
          className="w-full mt-2 py-4 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      )}
    </div>
  );

  if (isAuthChecking) {
    return <div className="w-full h-screen bg-[#0A192F] flex items-center justify-center"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="w-full h-screen bg-[#0A192F] flex justify-center overflow-hidden font-sans">
      <div className="w-full max-w-md bg-white h-full relative overflow-hidden shadow-2xl sm:border-x sm:border-gray-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full h-full"
          >
            {currentView === 'RIDE' && renderRide()}
            {currentView === 'ACTIVITY' && renderActivity()}
            {currentView === 'SCHEDULE' && renderSchedule()}
            {currentView === 'PROFILE' && renderProfile()}
          </motion.div>
        </AnimatePresence>
        
        {renderBottomNav()}
        
        {/* Top-Up Modal overlay */}
        <AnimatePresence>
          {showTopUp && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#0A192F]/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative"
              >
                <div className="bg-[#0A192F] p-6 text-center relative">
                  <button onClick={() => setShowTopUp(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
                  <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-cyan-500/30">
                    <Wallet className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-black text-white">Fund Wallet</h3>
                  <p className="text-slate-400 text-sm mt-1">Select or enter an amount</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[500, 1000, 2000, 5000, 10000].map(amt => (
                      <button 
                        key={amt}
                        onClick={() => setTopUpAmount(amt.toString())}
                        className={`py-2 rounded-xl font-bold text-sm transition-colors border ${topUpAmount === amt.toString() ? 'bg-[#04265E] text-white border-[#04265E]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#04265E]'}`}
                      >
                        ₦{amt}
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative mb-6">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
                    <input 
                      type="number" 
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      placeholder="Custom Amount"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-[#0A192F] font-bold focus:outline-none focus:border-[#04265E] text-lg"
                    />
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (!topUpAmount || parseInt(topUpAmount) < 100) {
                        alert('Please enter a valid amount (Min: ₦100)');
                        return;
                      }
                      // Initialize Paystack checkout
                      initializePayment({
                         onSuccess: handlePaystackSuccess,
                         onClose: handlePaystackClose
                      });
                    }}
                    className="w-full py-4 btn-glow-cyan text-white rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(21,211,229,0.3)] transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    Proceed to Pay
                  </button>
                  <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-4 flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" /> Secured by Paystack
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
