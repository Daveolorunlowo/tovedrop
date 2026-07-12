"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, Navigation, Clock, CreditCard, ChevronRight, CheckCircle2, XCircle, 
  MapPin, Route, Wallet, Calendar, History, TrendingUp, Medal, Star, 
  MessageSquare, Phone, Plus, Minus, LocateFixed, Flashlight, Zap, Bell, User, ArrowLeft
} from 'lucide-react';
import { listenToRides, acceptRide, arriveRide, pickupRide, completeRide, cancelRide, RideRequest, setDriverOnline, setDriverOffline, sendRideMessage, updateDriverLocation } from '@/lib/rideService';
import { requestNotificationPermission, showNativeNotification } from '@/lib/notificationService';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';

const LiveMap = dynamic(() => import('../../components/LiveMap'), { ssr: false });

type ViewState = 'HOME' | 'REQUEST' | 'REQUESTS' | 'ACTIVE' | 'EARNINGS';

export default function DriverDashboard() {
  const router = useRouter();
  
  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [isOnline, setIsOnline] = useState(false);
  const [destinationMode, setDestinationMode] = useState('');
  const [countdown, setCountdown] = useState(15);
  const [pendingRide, setPendingRide] = useState<RideRequest | null>(null);
  const [allPendingRides, setAllPendingRides] = useState<RideRequest[]>([]);
  const [activeRides, setActiveRides] = useState<RideRequest[]>([]);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  // Wallet state for testing suspension
  const [walletBalance, setWalletBalance] = useState(1500);
  const [isSuspended, setIsSuspended] = useState(false);

  // New Features State
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [activeChatRideId, setActiveChatRideId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Keep track of previous lengths to detect new requests/messages
  const [prevPendingLength, setPrevPendingLength] = useState(0);
  const prevMessageLengths = useRef<Record<string, number>>({});
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentViewRef = useRef(currentView);
  const pendingRideRef = useRef(pendingRide);
  const activeRidesRef = useRef(activeRides);

  useEffect(() => { currentViewRef.current = currentView; }, [currentView]);
  useEffect(() => { pendingRideRef.current = pendingRide; }, [pendingRide]);
  useEffect(() => { activeRidesRef.current = activeRides; }, [activeRides]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setDriverId(user.uid);
      } else {
        router.push('/login?role=driver');
      }
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Countdown timer for the New Request modal
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentView === 'REQUEST' && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [currentView, countdown]);

  // Real-time Ride Listener
  useEffect(() => {
    if (!driverId) return;
    const unsubscribe = listenToRides((rides) => {
      // Pending rides for this driver's carpool group or solos
      const pending = rides.filter(r => r.status === 'pending' && (!r.targetedDriverId || r.targetedDriverId === driverId));
      setAllPendingRides(pending);

      // Trigger push notification if new ride added
      if (pending.length > prevPendingLength && isOnline) {
        showToast('🔔 New Ride Request!');
        showNativeNotification('New Ride Request!', { body: 'A passenger is waiting nearby.' });
      }
      setPrevPendingLength(pending.length);

      // Active rides accepted by this driver
      const active = rides.filter(r => 
        (r.status === 'accepted' || r.status === 'arrived' || r.status === 'picked_up') && 
        r.driverId === driverId
      );
      setActiveRides(active);

      // Check for new chat messages on ALL active rides
      active.forEach(ride => {
        if (ride.messages && ride.messages.length > 0) {
          const prevLen = prevMessageLengths.current[ride.id] || 0;
          if (ride.messages.length > prevLen) {
            const lastMsg = ride.messages[ride.messages.length - 1];
            if (lastMsg.sender === 'passenger') {
              if (activeChatRideId !== ride.id || !showChatModal) {
                showNativeNotification(`Message from ${ride.passengerName}`, { body: lastMsg.text });
                showToast(`💬 ${ride.passengerName}: ${lastMsg.text}`);
              }
              // Play soft pop sound
              try {
                const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
                audio.play().catch(e => {});
              } catch(e) {}
              
              // Auto scroll if this chat is currently open
              if (activeChatRideId === ride.id && showChatModal) {
                setTimeout(() => {
                  if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                  }
                }, 100);
              }
            }
            prevMessageLengths.current[ride.id] = ride.messages.length;
          }
        }
      });

      if (!isOnline) return;
      
      const view = currentViewRef.current;
      const pRide = pendingRideRef.current;
      const currentActiveCount = active.length;
      const hasSolo = active.some(r => r.service === 'SOLO');
      const canAcceptMore = !hasSolo && currentActiveCount < 4;

      // Sync driver presence and capacity
      const availableSeats = hasSolo ? 0 : 4 - currentActiveCount;
      setDriverOnline(driverId, availableSeats);

      // Ensure view corrects itself if all rides completed
      if (view === 'ACTIVE' && currentActiveCount === 0 && !pRide) {
        setCurrentView('HOME');
      }

      if (view === 'REQUEST' && pRide) {
        const updatedRide = rides.find(r => r.id === pRide.id);
        if (!updatedRide || updatedRide.status !== 'pending') {
          // Ride was deleted/cancelled or taken
          setCurrentView(currentActiveCount > 0 ? 'ACTIVE' : 'HOME');
          setPendingRide(null);
        }
      } else if (canAcceptMore && pending.length > 0) {
        setPendingRide(pending[0]);
        setCurrentView('REQUEST');
        setCountdown(15);
      }
    });
    return () => unsubscribe();
  }, [isOnline, driverId]);

  // Clean up driver status when going offline and maintain heartbeat when online
  useEffect(() => {
    if (!driverId) return;
    if (!isOnline) {
      setDriverOffline(driverId);
    } else {
      const pingPresence = () => {
        const currentActiveCount = activeRidesRef.current.length;
        const hasSolo = activeRidesRef.current.some(r => r.service === 'SOLO');
        const availableSeats = hasSolo ? 0 : 4 - currentActiveCount;
        setDriverOnline(driverId, availableSeats);
      };
      
      pingPresence(); // Initial ping
      const interval = setInterval(pingPresence, 10000); // Heartbeat every 10s
      
      // Attempt to clean up on tab close
      const handleBeforeUnload = () => setDriverOffline(driverId);
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [isOnline, driverId]);

  // GPS Tracking Hook
  useEffect(() => {
    let watchId: number;
    if (isOnline && driverId) {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            updateDriverLocation(driverId, latitude, longitude);
          },
          (error) => console.error("Error watching position", error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isOnline, driverId]);

  const handleGoOnline = () => {
    if (isSuspended) return;
    setIsOnline(!isOnline);
  };

  const handleAcceptRequest = async () => {
    if (pendingRide && driverId) {
      try {
        await acceptRide(pendingRide.id, driverId);
        setPendingRide(null);
        setCurrentView('ACTIVE');
      } catch (e) {
        console.error(e);
      }
    } else {
      setCurrentView('ACTIVE');
    }
  };

  const handleDeclineRequest = () => {
    setCurrentView(activeRides.length > 0 ? 'ACTIVE' : 'HOME');
    setPendingRide(null);
  };

  // -------------------------------------------------------------
  // HOME VIEW
  // -------------------------------------------------------------
  const renderHome = () => {
    if (!isOnline) {
      return (
        <div className="w-full h-screen relative flex flex-col px-6 pt-14 pb-24 overflow-hidden bg-[#050505]">
          {/* Ambient Background Glows */}
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />

          {/* Header Area */}
          <div className="relative z-10 flex justify-between items-center mb-10">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-2xl hover:bg-white/10 transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 font-black text-[10px] tracking-[0.25em] text-slate-300 shadow-2xl flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-slate-500 mr-2 animate-pulse"></span>
              OFFLINE
            </div>
          </div>

          {/* Center Avatar & Greeting */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative z-10 flex flex-col items-center justify-center flex-1 mb-6 mt-2">
            <div className="relative mb-8 group">
               <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20 rounded-full animate-pulse group-hover:opacity-40 transition-opacity duration-700" />
               <div className="absolute inset-[-4px] bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full animate-spin-slow opacity-60" style={{ animationDuration: '4s' }} />
               <img src="https://i.pravatar.cc/150?img=33" alt="Driver" className="w-36 h-36 rounded-full border-[6px] border-[#050505] relative z-10 object-cover" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black mb-3 font-heading tracking-tight text-center text-white leading-tight">
              Ready to earn,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Partner?</span>
            </h1>
            <p className="text-lg font-medium text-center text-slate-400 tracking-wide">
              The city is waiting for you.
            </p>
          </motion.div>

          {/* The Orb (Go Online Button) */}
          <div className="relative z-10 flex flex-col items-center mb-12">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoOnline}
              className={`relative w-40 h-40 rounded-full flex items-center justify-center group ${isSuspended ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl group-hover:bg-cyan-500/40 transition-all duration-500" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
              
              {/* Button Body */}
              <div className="relative w-full h-full rounded-full bg-[#0a0a0a] border border-white/10 shadow-[inset_0_0_30px_rgba(6,182,212,0.3)] flex items-center justify-center overflow-hidden z-10">
                <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
                <span className="text-5xl font-black tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] translate-x-1">GO</span>
              </div>
            </motion.button>
            {isSuspended && (
               <p className="mt-6 text-red-400 font-bold text-sm bg-red-950/50 border border-red-500/20 px-6 py-2.5 rounded-full backdrop-blur-md">Account Suspended</p>
            )}
          </div>

          {/* Destination Mode */}
          <div className="relative z-10 w-full mt-auto">
             <div className="relative group cursor-text">
               <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-1.5 flex items-center shadow-2xl">
                 <div className="w-14 h-14 flex items-center justify-center bg-white/5 rounded-2xl mr-2">
                   <Route className="w-6 h-6 text-cyan-400" />
                 </div>
                 <input 
                   type="text" 
                   placeholder="Heading home? Set a destination" 
                   value={destinationMode}
                   onChange={(e) => setDestinationMode(e.target.value)}
                   className="bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 font-medium text-lg w-full px-2"
                 />
                 <button className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mr-1 shadow-lg hover:shadow-cyan-500/25 transition-all">
                   <ChevronRight className="w-6 h-6 text-white" />
                 </button>
               </div>
             </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
        {/* Real-time Map Background */}
        <div className="absolute inset-0 z-0 opacity-80">
          <LiveMap />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/20 to-transparent pointer-events-none" />
        </div>
  
        {/* Header - Glassmorphism */}
        <div className="absolute top-0 w-full z-10 bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] px-4 py-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-900" />
            </button>
            <div className="flex flex-col">
              <span className="text-gray-900 font-bold tracking-wider">DRIVER DASHBOARD</span>
            </div>
          </div>
          <button 
            onClick={handleGoOnline}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${
              isOnline ? 'bg-green-50 border-green-500/30' : 'bg-white/5 border-slate-100'
            }`}
          >
            <span className={`text-[10px] font-black tracking-widest uppercase ${isOnline ? 'text-green-600' : 'text-slate-400'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
            <div className="relative w-2 h-2">
              <div className={`absolute inset-0 rounded-full ${isOnline ? 'bg-green-500' : 'bg-slate-500'}`} />
              {isOnline && <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />}
            </div>
          </button>
        </div>
  
        {/* Center UI based on suspension state */}
        {isSuspended ? (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="absolute top-24 left-4 right-4 z-10"
          >
            <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-[0_20px_40px_rgba(0,0,0,0.1)] text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 blur-[30px] rounded-full pointer-events-none" />
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-wide">Account Suspended</h3>
              <p className="text-sm text-slate-500 font-medium mb-4">
                Your wallet balance has fallen below the minimum threshold. You owe the platform <span className="font-bold text-gray-900">₦{Math.abs(walletBalance).toLocaleString()}</span> from cash trips.
              </p>
              <button 
                onClick={() => setWalletBalance(1500)}
                className="w-full py-3 bg-red-500 text-white rounded-3xl font-black text-sm tracking-widest uppercase hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
              >
                Pay Outstanding Balance
              </button>
            </div>
          </motion.div>
        ) : null}

        {/* Bottom UI */}
        <div className="absolute bottom-[72px] w-full z-10 px-4 flex flex-col gap-4">
          <div className="bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[2.5rem] p-6 relative mt-4">
            
            {/* Circular STOP Button */}
            <div className="absolute -top-12 right-6">
              <motion.button 
                whileHover={{ scale: isSuspended ? 1 : 1.05 }}
                whileTap={{ scale: isSuspended ? 1 : 0.95 }}
                onClick={handleGoOnline}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl overflow-hidden border-[3px] transition-all duration-500 ${
                  isSuspended ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' :
                  isOnline ? 'bg-red-500 text-white border-red-400 shadow-[0_2px_12px_rgba(0,0,0,0.03)]' : 'bg-[#000000] text-white hover:bg-[#1e293b] border-transparent'
                }`}
              >
                {/* Radar pulse when online */}
                {isOnline && (
                  <>
                    <div className="absolute inset-0 rounded-full animate-ping bg-red-400/40 pointer-events-none" />
                    <div className="absolute w-[200%] h-[200%] bg-gradient-to-tr from-white/0 via-white/20 to-white/0 animate-spin-slow pointer-events-none" />
                  </>
                )}
                {/* Subtle breathe when offline */}
                {!isOnline && (
                  <div className="absolute inset-0 rounded-full animate-pulse bg-white/20 pointer-events-none" />
                )}
                <span className="text-2xl font-black relative z-10 font-heading tracking-widest text-shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  {isOnline ? 'STOP' : 'GO'}
                </span>
              </motion.button>
            </div>
  
            <div className="flex justify-between items-end mt-2 pt-2">
              <div>
                <p className="text-[10px] text-cyan-500/80 font-black tracking-widest mb-1.5 uppercase">Today's Earnings</p>
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-cyan-500" />
                  <h2 className="text-4xl font-black text-gray-900 font-heading">₦1,250</h2>
                </div>
              </div>
              
              <div className="w-px h-12 bg-slate-100"></div>
              
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-black tracking-widest mb-1.5 uppercase">Completed</p>
                <div className="flex items-center gap-2 justify-end">
                  <h2 className="text-4xl font-black text-gray-900 font-heading">18</h2>
                  <Route className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // REQUEST MODAL VIEW
  // -------------------------------------------------------------
  const renderRequest = () => (
    <div className="relative w-full h-screen bg-slate-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Blurred Map Background */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity blur-md">
        <LiveMap />
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 350, bounce: 0.4 }}
        className="relative z-10 w-full max-w-sm card-dark overflow-hidden mx-4"
      >
        {/* Glowing top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#04265E] to-[#00A3C4]" />

        {/* Header */}
        <div className="py-8 text-center relative border-b border-slate-100">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/20 blur-[40px] pointer-events-none rounded-full" />
          <h2 className="text-3xl font-black gradient-text-cyan mb-2 tracking-tight font-heading">New Request!</h2>
          <p className="text-slate-400 text-sm font-medium">Passenger waiting nearby</p>
        </div>

        {/* Route Details */}
        <div className="p-8 pb-6">
          <div className="relative pl-8 mb-8">
            {/* Timeline graphics */}
            <div className="absolute left-2.5 top-3 bottom-3 w-px bg-white/10"></div>
            <div className="absolute left-1.5 top-2 w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"></div>
            <div className="absolute left-1.5 bottom-2 w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"></div>
            
            <div className="mb-6">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pickup</p>
              <h3 className="text-lg font-bold text-gray-900">{pendingRide?.pickup || 'Main Gate'}</h3>
            </div>
            
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Drop-off</p>
              <h3 className="text-lg font-bold text-gray-900">{pendingRide?.dropoff || 'Block A Hostel'}</h3>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8 bg-white/5 p-5 rounded-3xl border border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                <Wallet className="w-3.5 h-3.5" /> Fare
              </div>
              <h3 className="text-2xl font-black text-gray-900">₦{pendingRide?.service === 'SOLO' ? '900' : '250'}</h3>
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                <MapPin className="w-3.5 h-3.5" /> Distance
              </div>
              <h3 className="text-xl font-bold text-gray-900">0.4 <span className="text-sm font-medium text-slate-400">km</span></h3>
            </div>
          </div>

          {/* Timer Ring */}
          <div className="flex justify-center mb-8 relative">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="50" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                <circle 
                  cx="56" cy="56" r="50" 
                  stroke="#04265E" strokeWidth="6" fill="none" 
                  strokeDasharray="314"
                  strokeDashoffset={314 - (314 * countdown) / 15}
                  className="transition-all duration-1000 ease-linear"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-4xl font-black text-gray-900 font-heading">{countdown}</span>
              {/* Pulse glow dot */}
              <div className="absolute top-0 right-14 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"></div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAcceptRequest}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-gray-900 rounded-3xl font-black text-lg flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all ripple-container"
            >
              <CheckCircle2 className="w-6 h-6" /> ACCEPT RIDE
            </motion.button>
            <button 
              onClick={handleDeclineRequest}
              className="w-full py-4 bg-white/5 border border-slate-100 text-slate-400 rounded-3xl font-bold text-sm transition-colors hover:bg-white/10 hover:text-gray-900"
            >
              Decline
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // -------------------------------------------------------------
  // ACTIVE NAVIGATION VIEW
  // -------------------------------------------------------------
  const renderActive = () => {
    const isCarpool = activeRides.some(r => r.service === 'CARPOOL');
    const availableSeats = 4 - activeRides.length;

    return (
      <div className="relative w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
        {/* 3D Map Background */}
        <div className="absolute inset-0 z-0">
          <LiveMap />
        </div>

        {/* Map Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
          <button className="w-12 h-12 bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-full flex items-center justify-center text-gray-900 hover:bg-white/10 transition-colors border border-slate-100">
            <Plus className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-full flex items-center justify-center text-gray-900 hover:bg-white/10 transition-colors border border-slate-100 mb-4">
            <Minus className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 bg-white rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-center text-slate-900 hover:bg-slate-100 transition-transform active:scale-95">
            <LocateFixed className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Sheet - Passenger Details Queue */}
        <div className="absolute bottom-0 w-full z-10">
          <div className="bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-t-[2.5rem] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 pt-8 relative border-t border-x border-slate-100 max-h-[60vh] overflow-y-auto flex flex-col">
            {/* Handle */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full sticky z-20"></div>

            <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-50/90 backdrop-blur-md py-2 z-10 -mt-2">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Active Route</h2>
              {isCarpool && (
                <div className="bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/30">
                  <span className="text-xs font-bold text-cyan-400">Seats Available: {availableSeats}/4</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {activeRides.map((ride) => (
                <div key={ride.id} className="bg-[#112240] rounded-3xl p-5 border border-slate-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={`https://i.pravatar.cc/150?u=${ride.passengerId}`} alt="Passenger" className="w-12 h-12 rounded-full border-2 border-[#112240]" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                          {ride.passengerName}
                          <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.03)] uppercase">
                            {ride.service === 'SOLO' ? 'Solo' : 'Pool'}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-orange-400" /> {ride.pickup}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => {
                          setActiveChatRideId(ride.id);
                          setShowChatModal(true);
                        }}
                        className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-900 hover:bg-white/20 transition-colors relative"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {ride.messages && ride.messages.length > 0 && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </button>
                      <button className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-900 hover:bg-white/20 transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Action Buttons based on individual ride status */}
                  <div className="mt-4 flex gap-2">
                    {ride.status === 'accepted' && (
                      <button 
                        onClick={() => arriveRide(ride.id)}
                        className="flex-1 py-2.5 bg-white/10 text-gray-900 hover:bg-white/20 rounded-3xl font-bold text-xs uppercase tracking-wide transition-colors border border-slate-100"
                      >
                        Arrived at Pickup
                      </button>
                    )}
                    
                    {ride.status === 'arrived' && (
                      <>
                        <button 
                          onClick={() => pickupRide(ride.id)}
                          className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-gray-900 rounded-3xl font-bold text-xs uppercase tracking-wide transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
                        >
                          Picked Up
                        </button>
                        <button 
                          onClick={async () => {
                            await cancelRide(ride.id);
                            if (activeRides.length <= 1) setCurrentView('HOME');
                          }}
                          className="flex-1 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-3xl font-bold text-xs uppercase tracking-wide transition-colors"
                        >
                          No-Show
                        </button>
                      </>
                    )}

                    {ride.status === 'picked_up' && (
                      <button 
                        onClick={async () => {
                          await completeRide(ride.id);
                          if (activeRides.length <= 1) setCurrentView('HOME');
                        }}
                        className="flex-1 py-2.5 bg-[#000000] text-white hover:bg-[#1e293b] rounded-3xl font-black text-xs uppercase tracking-widest shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1"
                      >
                        <MapPin className="w-4 h-4" /> Drop Off at {ride.dropoff}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {/* Spacer to prevent bottom cutoff */}
              <div className="h-12 w-full flex-shrink-0" />
            </div>
            {activeRides.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                Route complete. Finishing trip...
              </div>
            )}
            
            {/* Chat Modal */}
            {showChatModal && activeChatRideId && (
              <div className="absolute inset-0 z-50 bg-black/50 flex flex-col justify-end">
                <div className="bg-white h-[80%] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">
                  <div className="bg-slate-50 p-5 text-gray-900 flex justify-between items-center">
                    <h3 className="font-bold">Chat with Passenger</h3>
                    <button onClick={() => {setShowChatModal(false); setActiveChatRideId(null);}} className="text-gray-900 bg-white/20 p-1 rounded-full"><ArrowLeft className="w-4 h-4 rotate-180"/></button>
                  </div>
                  <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50">
                    {activeRides.find(r => r.id === activeChatRideId)?.messages?.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'driver' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-3xl px-4 py-2 text-sm ${msg.sender === 'driver' ? 'bg-[#00C9E8] text-slate-900 rounded-br-none font-bold' : 'bg-slate-200 text-gray-800 rounded-bl-none'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {(!activeRides.find(r => r.id === activeChatRideId)?.messages?.length) && (
                      <p className="text-center text-slate-400 text-sm mt-10 font-medium">No messages yet. Say hi!</p>
                    )}
                  </div>
                  <div className="p-5 bg-white border-t border-slate-100 flex gap-2">
                    <input 
                      type="text" 
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00C9E8] text-black"
                    />
                    <button 
                      onClick={async () => {
                        if (!chatMessage.trim() || !activeChatRideId) return;
                        await sendRideMessage(activeChatRideId, 'driver', chatMessage);
                        setChatMessage('');
                      }} 
                      className="bg-slate-50 text-gray-900 px-4 py-2 rounded-full font-bold"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // EARNINGS VIEW
  // -------------------------------------------------------------
  const renderEarnings = () => (
    <div className="w-full h-screen bg-slate-50 flex flex-col overflow-y-auto pb-32 font-sans relative">
      
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Header Profile */}
      <div className="bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] px-6 py-5 flex items-center justify-between sticky top-0 z-20 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
            <Menu className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight font-heading">Earnings</h1>
        </div>
        <div className="p-0.5 rounded-full bg-gradient-to-br from-cyan-500 to-amber-500">
          <img src="https://i.pravatar.cc/150?img=33" alt="Driver" className="w-9 h-9 rounded-full border-2 border-[#0A192F]" />
        </div>
      </div>

      <div className="p-5 space-y-6 relative z-10">
        {/* Total Balance Card */}
        <div className="card-dark p-7 overflow-hidden relative">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2">Total Balance</p>
            <h2 className="text-5xl font-black gradient-text-cyan mb-1 tracking-tight font-heading drop-shadow-[0_2px_12px_rgba(0,0,0,0.03)]">₦5,420</h2>
            <p className="text-sm text-slate-400 mb-8 font-medium">Available for instant withdrawal</p>

            {/* Premium Chart Dashboard */}
            <div className="w-full h-32 mb-8 relative flex items-end justify-between px-2 pb-6">
              {[
                { day: 'Mon', h: 40 }, 
                { day: 'Tue', h: 65 }, 
                { day: 'Wed', h: 45 }, 
                { day: 'Thu', h: 80 }, 
                { day: 'Fri', h: 100 }, 
                { day: 'Sat', h: 90 }, 
                { day: 'Sun', h: 70 }
              ].map((item, i) => (
                <div key={i} className="w-[10%] h-full flex flex-col justify-end items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 bg-slate-50 text-gray-900 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₦{(item.h * 85).toLocaleString()}
                  </div>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${item.h}%` }}
                    transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                    className={`w-full rounded-t-md transition-all ${item.day === 'Fri' ? 'bg-gradient-to-t from-cyan-500 to-[#00E5FF] shadow-[0_2px_12px_rgba(0,0,0,0.03)]' : 'bg-gradient-to-t from-orange-500/20 to-cyan-500/50 hover:to-cyan-400 group-hover:from-orange-500/40'}`}
                  />
                  <span className={`text-[10px] font-bold absolute -bottom-6 ${item.day === 'Fri' ? 'text-cyan-400' : 'text-slate-400'}`}>{item.day}</span>
                </div>
              ))}
              <div className="absolute bottom-6 left-0 right-0 h-px bg-white/10" />
            </div>
            
            <button className="w-full bg-[#000000] text-white hover:bg-[#1e293b] font-black py-4 px-6 rounded-3xl flex items-center justify-center gap-2 ripple-container">
              <CreditCard className="w-5 h-5" />
              WITHDRAW FUNDS
            </button>
          </div>
        </div>

        {/* Weekly Breakdown Glass Card */}
        <div className="bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[1.5rem] p-6 border border-slate-100 shadow-lg">
          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-5">Weekly Overview</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Completed Rides</span>
              <span className="font-bold text-gray-900 text-lg font-heading">42</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Gross Fares</span>
              <span className="font-bold text-gray-900 text-lg font-heading"><span className="text-sm text-slate-500 mr-0.5">₦</span>6,376</span>
            </div>
            <div className="flex justify-between items-center text-orange-500">
              <span className="font-medium flex items-center gap-2">Tove Commission <span className="bg-orange-500/20 text-orange-500 text-[10px] px-2 py-0.5 rounded-full font-bold">15%</span></span>
              <span className="font-bold text-lg font-heading">- <span className="text-sm mr-0.5">₦</span>956</span>
            </div>
            <div className="h-px bg-white/10 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-cyan-500 font-bold">Net Earnings</span>
              <span className="font-black text-cyan-500 text-xl font-heading drop-shadow-[0_2px_12px_rgba(0,0,0,0.03)]"><span className="text-sm text-cyan-500/70 mr-0.5">₦</span>5,420</span>
            </div>
          </div>

          {/* Pro Tip Callout */}
          <div className="mt-7 bg-orange-500/10 rounded-3xl p-5 border border-orange-500/20">
            <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-cyan-500" /> Pro Tip
            </p>
            <p className="text-sm text-orange-100/80 font-medium leading-relaxed">
              Earnings are <span className="text-cyan-500 font-bold">25% higher</span> on Friday evenings during student events.
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="pt-2">
          <h3 className="text-lg font-black text-gray-900 mb-4 px-1 font-heading tracking-wide">Recent Activity</h3>
          <div className="space-y-3">
            {/* Item 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[1.25rem] p-5 flex items-center gap-5 border border-slate-100 hover:bg-white/10 hover:border-slate-100 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-orange-500/20 rounded-3xl flex items-center justify-center flex-shrink-0 border border-orange-500/20 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5 text-cyan-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">Today</h4>
                <p className="text-xs font-medium text-slate-400 mt-0.5 tracking-wide">3 rides completed</p>
              </div>
              <div className="text-right">
                <h4 className="font-bold text-gray-900">₦210</h4>
                <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest mt-1">Pending</p>
              </div>
            </motion.div>
            {/* Item 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[1.25rem] p-5 flex items-center gap-5 border border-slate-100 hover:bg-white/10 hover:border-slate-100 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-white/5 rounded-3xl flex items-center justify-center flex-shrink-0 border border-slate-100 group-hover:scale-110 transition-transform">
                <History className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">Yesterday</h4>
                <p className="text-xs font-medium text-slate-400 mt-0.5 tracking-wide">12 rides completed</p>
              </div>
              <div className="text-right">
                <h4 className="font-bold text-gray-900">₦840</h4>
                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mt-1">Settled</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // ALL REQUESTS LIST VIEW
  // -------------------------------------------------------------
  const renderRequestsList = () => (
    <div className="w-full h-screen bg-slate-50 flex flex-col overflow-y-auto pb-32 font-sans relative">
      <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <div className="bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] px-6 py-5 flex items-center justify-between sticky top-0 z-20 border-b border-slate-100">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight font-heading">Available Requests</h1>
        <div className="bg-white/10 px-3 py-1 rounded-full border border-slate-100">
          <span className="text-xs font-bold text-cyan-500">{allPendingRides.length}</span>
        </div>
      </div>

      <div className="p-5 space-y-4 relative z-10">
        {allPendingRides.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <Bell className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No active requests</h3>
            <p className="text-slate-400 text-sm">Stay online to receive ride requests from passengers.</p>
          </div>
        ) : (
          allPendingRides.map((ride, idx) => (
            <motion.div 
              key={ride.id} 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 24 }}
              className="bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-0 border border-slate-100 relative overflow-hidden group hover:border-orange-500/30 transition-colors rounded-3xl"
            >
              {/* Ticket perforated edge simulation */}
              <div className="absolute top-16 left-0 right-0 border-t-2 border-dashed border-slate-100" />
              <div className="absolute top-16 -left-3 w-6 h-6 bg-slate-50 rounded-full border-r border-slate-100 -translate-y-1/2" />
              <div className="absolute top-16 -right-3 w-6 h-6 bg-slate-50 rounded-full border-l border-slate-100 -translate-y-1/2" />

              <div className="p-5 pb-4">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <img src={`https://i.pravatar.cc/150?u=${ride.passengerId}`} alt="User" className="w-10 h-10 rounded-full border border-slate-100" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 tracking-wide">{ride.passengerName}</h3>
                      <p className="text-[10px] text-cyan-500 uppercase tracking-widest font-black mt-0.5">
                        {ride.service === 'CARPOOL' ? 'Carpool' : 'Solo Ride'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl font-black text-gray-900 font-heading">₦{ride.service === 'SOLO' ? '900' : '250'}</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Fare</p>
                  </div>
                </div>
                
                <div className="relative pl-6 mb-2 mt-4">
                  <div className="absolute left-1.5 top-2 bottom-2 w-px bg-white/10"></div>
                  <div className="absolute left-0.5 top-1.5 w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"></div>
                  <div className="absolute left-0.5 bottom-1.5 w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"></div>
                  
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Pickup</p>
                    <p className="text-sm font-bold text-slate-200 tracking-wide">{ride.pickup}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Drop-off</p>
                    <p className="text-sm font-bold text-slate-200 tracking-wide">{ride.dropoff}</p>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    if (!driverId) return;
                    setPendingRide(ride);
                    try {
                      await acceptRide(ride.id, driverId);
                      setCurrentView('ACTIVE');
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="w-full py-3.5 border border-slate-100 bg-slate-50/80 text-gray-900 rounded-3xl font-black text-sm tracking-widest uppercase shadow-lg hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all flex items-center justify-center gap-2 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 text-cyan-500 group-hover:text-gray-900 transition-colors">Accept Request</span>
                  <ChevronRight className="w-4 h-4 text-cyan-500 group-hover:text-gray-900 transition-colors relative z-10" />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // BOTTOM NAVIGATION (Sleek Premium Floating)
  // -------------------------------------------------------------
  const renderBottomNav = () => {
    if (currentView === 'REQUEST' || currentView === 'ACTIVE') return null;

    const tabs = [
      { id: 'HOME', icon: Route, label: 'Dashboard' },
      { id: 'REQUESTS', icon: Bell, label: 'Requests', dot: isOnline },
      { id: 'EARNINGS', icon: Wallet, label: 'Earnings' },
      { id: 'ACCOUNT', icon: User, label: 'Account' },
    ];

    return (
      <div className="absolute bottom-6 left-4 right-4 z-50 pointer-events-none">
        <div className="pointer-events-auto bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl p-2 flex justify-between items-center max-w-sm mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-50" />
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id || (tab.id === 'HOME' && currentView === 'HOME');
            
            return (
              <button 
                key={tab.id}
                onClick={() => {
                  if(tab.id === 'ACCOUNT') {
                    router.push('/driver/profile');
                  } else if(tab.id === 'HOME' || tab.id === 'EARNINGS' || tab.id === 'REQUESTS') {
                    setCurrentView(tab.id as ViewState);
                  }
                }}
                className={`relative z-10 flex flex-col items-center gap-1.5 py-2 px-1 w-full transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="driver-nav-pill-premium"
                    className="absolute inset-0 bg-white/10 rounded-2xl -z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-white/5"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="w-7 h-7 flex items-center justify-center relative">
                  <Icon className={`transition-all duration-500 ${isActive ? 'scale-110 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] w-6 h-6' : 'w-5 h-5'}`} strokeWidth={isActive ? 2.5 : 2} />
                  {tab.dot && (
                    <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#050505] transition-transform ${isActive ? 'scale-110 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : ''}`}></div>
                  )}
                  {isActive && (
                    <motion.div 
                      layoutId="driver-nav-dot-premium"
                      className="absolute -bottom-4 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,1)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
                <span className={`text-[10px] tracking-wide transition-all duration-300 mt-1 ${isActive ? 'font-black opacity-100' : 'font-medium opacity-70'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (isAuthChecking) {
    return <div className="w-full h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="w-full h-screen bg-white relative overflow-hidden font-sans max-w-md mx-auto shadow-2xl">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        userRole="DRIVER" 
        userName="Driver Partner" 
      />
      
      <div className="w-full h-full relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {currentView === 'HOME' && renderHome()}
            {currentView === 'REQUEST' && renderRequest()}
            {currentView === 'ACTIVE' && renderActive()}
            {currentView === 'REQUESTS' && renderRequestsList()}
            {currentView === 'EARNINGS' && renderEarnings()}
          </motion.div>
        </AnimatePresence>
        {renderBottomNav()}
      </div>
    </div>
  );
}


