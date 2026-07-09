"use client";

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Star, Car, CreditCard, Settings, 
  HelpCircle, LogOut, ShieldCheck, ChevronRight, 
  MapPin, Clock, Edit3, Camera, Check, X,
  Bell, Volume2, Moon, Plus, Wallet, MessageSquare, Phone, Mail
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, storage, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { fetchRideHistory, fetchScheduledRides } from '@/lib/rideService';

type ViewState = 'MAIN' | 'PAYMENTS' | 'SETTINGS' | 'SUPPORT' | 'HISTORY' | 'SCHEDULE';

export default function DriverProfile() {
  const router = useRouter();
  
  const [activeView, setActiveView] = useState<ViewState>('MAIN');
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // History & Schedule State
  const [historyRides, setHistoryRides] = useState<any[]>([]);
  const [scheduledRides, setScheduledRides] = useState<any[]>([]);

  const [driverId, setDriverId] = useState<string | null>(null);

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setDriverId(user.uid);
        
        let fetchedData: any = {};
        try {
           const docSnap = await getDoc(doc(db, 'drivers', user.uid));
           if (docSnap.exists()) {
              fetchedData = docSnap.data();
           }
        } catch (error) {
           console.error("Error fetching driver profile:", error);
        }

        setDriver(d => {
          const newD = { 
            ...d, 
            name: user.displayName || d.name, 
            email: user.email || d.email,
            profileImage: user.photoURL || d.profileImage,
            ...fetchedData
          };
          setEditForm(newD);
          return newD;
        });

      } else {
        router.push('/login?role=driver');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!driverId) return;
    if (activeView === 'HISTORY') {
      fetchRideHistory(driverId, 'driver').then(setHistoryRides);
    } else if (activeView === 'SCHEDULE') {
      fetchScheduledRides(driverId, 'driver').then(setScheduledRides);
    }
  }, [activeView, driverId]);

  // Editable driver data
  const [driver, setDriver] = useState({
    name: "Samuel O.",
    profileImage: "",
    rating: 4.9,
    trips: 342,
    joinDate: "Sept 2023",
    car: "Toyota Corolla (Silver)",
    plate: "KJA-234-XY",
    phone: "+234 812 345 6789",
    email: "samuel.o@bowen.edu.ng",
  });

  // Temporary state for editing
  const [editForm, setEditForm] = useState({ ...driver });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async () => {
    if (!driverId) return;
    try {
      await setDoc(doc(db, 'drivers', driverId), {
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
        car: editForm.car,
        plate: editForm.plate
      }, { merge: true });

      if (auth.currentUser) {
         await updateProfile(auth.currentUser, { displayName: editForm.name });
      }

      setDriver(editForm);
      setIsEditing(false);
      showToast("Profile details updated successfully!");
    } catch (e) {
      showToast("Error saving profile");
    }
  };

  const handleCancel = () => {
    setEditForm({ ...driver });
    setIsEditing(false);
  };

  const handleBack = () => {
    if (isEditing) {
      handleCancel();
    } else if (activeView !== 'MAIN') {
      setActiveView('MAIN');
    } else {
      router.back();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && driverId) {
      const file = e.target.files[0];
      const localUrl = URL.createObjectURL(file);
      setEditForm({ ...editForm, profileImage: localUrl });
      
      setUploadingImage(true);
      showToast("Uploading picture...");
      
      try {
        const storageRef = ref(storage, `profile_pictures/${driverId}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        uploadTask.on('state_changed', 
          null, 
          (error) => {
             showToast("Error uploading picture");
             setUploadingImage(false);
          }, 
          async () => {
             const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
             setEditForm(prev => ({ ...prev, profileImage: downloadURL }));
             setDriver(prev => ({ ...prev, profileImage: downloadURL }));
             
             await setDoc(doc(db, 'drivers', driverId), { profileImage: downloadURL }, { merge: true });
             
             if (auth.currentUser) {
                await updateProfile(auth.currentUser, { photoURL: downloadURL });
             }

             showToast("Profile picture updated!");
             setUploadingImage(false);
          }
        );
      } catch (error) {
        showToast("Error uploading picture");
        setUploadingImage(false);
      }
    }
  };

  const getTitle = () => {
    if (isEditing) return "Edit Profile";
    if (activeView === 'PAYMENTS') return "Payment Methods";
    if (activeView === 'SETTINGS') return "App Settings";
    if (activeView === 'SUPPORT') return "Help & Support";
    if (activeView === 'HISTORY') return "Ride History";
    if (activeView === 'SCHEDULE') return "Scheduled Rides";
    return "My Profile";
  };

  return (
    <div className="min-h-screen bg-[#060B19] text-gray-900 flex flex-col font-sans overflow-y-auto relative">
      
      {/* ── TOAST NOTIFICATION ────────────────────────────── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-cyan-500 text-[#060B19] px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[#060B19]/80 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <button 
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-slate-100"
        >
          {isEditing ? <X className="w-5 h-5 text-gray-900" /> : <ArrowLeft className="w-5 h-5 text-gray-900" />}
        </button>
        <h1 className="text-lg font-bold tracking-wide">
          {getTitle()}
        </h1>
        <div className="w-10 h-10 flex items-center justify-center">
          {activeView === 'MAIN' && (
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
            >
              {isEditing ? <Check className="w-5 h-5 text-green-500" /> : <Edit3 className="w-5 h-5 text-cyan-500" />}
            </button>
          )}
        </div>
      </div>

      <div className="p-6 max-w-lg mx-auto w-full pb-24">
        
        {/* ── MAIN PROFILE VIEW ─────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeView === 'MAIN' && (
            <motion.div 
              key="MAIN"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* Profile Header */}
              <div className="flex flex-col items-center mb-8">
                <input 
                  type="file" 
                  id="profilePicUpload" 
                  hidden 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
                <div 
                  className="relative group cursor-pointer mb-4" 
                  onClick={() => isEditing && document.getElementById('profilePicUpload')?.click()}
                >
                  <div className="w-24 h-24 rounded-full border-2 border-cyan-500 p-1">
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                      <img 
                        src={
                          isEditing 
                            ? (editForm.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${editForm.name.replace(' ', '')}&backgroundColor=00C9E8`)
                            : (driver.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${driver.name.replace(' ', '')}&backgroundColor=00C9E8`)
                        } 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {isEditing && (
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-500 rounded-full border-2 border-[#060B19] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      {uploadingImage ? <div className="w-3 h-3 border-2 border-[#060B19] border-t-transparent rounded-full animate-spin" /> : <Camera className="w-4 h-4 text-[#060B19]" />}
                    </div>
                  )}
                </div>
                
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Full Name"
                    className="bg-white/5 border border-slate-100 rounded-lg px-4 py-2 text-center text-xl font-bold text-gray-900 focus:outline-none focus:border-cyan-500"
                  />
                ) : (
                  <h2 className="text-2xl font-black mb-1 flex items-center gap-2">
                    {driver.name}
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                  </h2>
                )}
                
                <p className="text-slate-400 text-sm mt-2">Driver Partner since {driver.joinDate}</p>

                {/* Stats Row */}
                {!isEditing && (
                  <div className="flex items-center gap-6 mt-6 bg-white/5 px-6 py-4 rounded-3xl border border-slate-100 w-full justify-center shadow-inner">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-cyan-500">{driver.rating}</span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">
                        <Star className="w-3 h-3 fill-cyan-500 text-cyan-500" /> Rating
                      </div>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-gray-900">{driver.trips}</span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">
                        <MapPin className="w-3 h-3" /> Total Trips
                      </div>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-gray-900">1.2k</span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">
                        <Clock className="w-3 h-3" /> Hours
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Personal & Contact Info */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3 px-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Information</h3>
                </div>
                
                <div className="bg-[#0A1128] rounded-3xl border border-slate-100 p-5 shadow-lg space-y-4">
                  {/* Phone */}
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-3xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
                      <Phone className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <>
                          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Phone Number</label>
                          <input 
                            type="tel" 
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="w-full bg-white/5 border border-slate-100 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                          />
                        </>
                      ) : (
                        <>
                          <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Phone</h4>
                          <p className="font-bold text-gray-900 text-sm">{driver.phone}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-white/5 w-full" />

                  {/* Email */}
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-3xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
                      <Mail className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <>
                          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Email Address</label>
                          <input 
                            type="email" 
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            className="w-full bg-white/5 border border-slate-100 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                          />
                        </>
                      ) : (
                        <>
                          <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Email</h4>
                          <p className="font-bold text-gray-900 text-sm">{driver.email}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3 px-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vehicle Details</h3>
                </div>
                
                <div className="bg-[#0A1128] rounded-3xl border border-slate-100 p-5 flex items-center gap-5 shadow-lg">
                  <div className="w-12 h-12 rounded-3xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
                    <Car className="w-6 h-6 text-cyan-500" />
                  </div>
                  
                  {isEditing ? (
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Car Model & Color</label>
                        <input 
                          type="text" 
                          value={editForm.car}
                          onChange={(e) => setEditForm({...editForm, car: e.target.value})}
                          className="w-full bg-white/5 border border-slate-100 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Plate Number</label>
                        <input 
                          type="text" 
                          value={editForm.plate}
                          onChange={(e) => setEditForm({...editForm, plate: e.target.value})}
                          className="w-full bg-white/5 border border-slate-100 rounded-lg px-3 py-2 text-sm text-cyan-500 font-mono uppercase focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg leading-tight">{driver.car}</h4>
                      <p className="text-sm text-cyan-500 font-mono mt-1 bg-cyan-500/10 inline-block px-2 py-0.5 rounded uppercase border border-cyan-500/20">{driver.plate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Menu Options */}
              {!isEditing && (
                <div className="space-y-3 mb-8">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2 mt-8">Account & Settings</h3>
                  
                  <MenuItem 
                    icon={<CreditCard className="w-5 h-5 text-gray-900" />} 
                    title="Payment Methods" 
                    subtitle="Manage your payout accounts" 
                    onClick={() => setActiveView('PAYMENTS')}
                  />
                  <MenuItem 
                    icon={<Settings className="w-5 h-5 text-gray-900" />} 
                    title="App Settings" 
                    subtitle="Navigation, sounds & theme" 
                    onClick={() => setActiveView('SETTINGS')}
                  />
                  <MenuItem 
                    icon={<HelpCircle className="w-5 h-5 text-gray-900" />} 
                    title="Help & Support" 
                    subtitle="Contact us or view FAQs" 
                    onClick={() => setActiveView('SUPPORT')}
                  />
                  
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2 mt-8">My Activity</h3>

                  <MenuItem 
                    icon={<Clock className="w-5 h-5 text-gray-900" />} 
                    title="Ride History" 
                    subtitle="View your past completed trips" 
                    onClick={() => setActiveView('HISTORY')} 
                  />
                  <MenuItem 
                    icon={<MapPin className="w-5 h-5 text-gray-900" />} 
                    title="Scheduled Rides" 
                    subtitle="View your upcoming accepted rides" 
                    onClick={() => setActiveView('SCHEDULE')} 
                  />
                </div>
              )}

              {/* Logout Button */}
              {!isEditing && (
                <button 
                  onClick={async () => {
                    await signOut(auth);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-4 rounded-3xl transition-colors border border-red-500/20 mt-4 shadow-lg"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              )}
            </motion.div>
          )}

          {/* ── PAYMENTS VIEW ───────────────────────────────── */}
          {activeView === 'PAYMENTS' && (
            <motion.div
              key="PAYMENTS"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-[#0A1128] rounded-3xl border border-slate-100 p-6 shadow-lg mb-6 text-center">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                  <Wallet className="w-8 h-8 text-cyan-500" />
                </div>
                <h3 className="text-sm font-medium text-slate-400">Available Balance</h3>
                <p className="text-4xl font-black text-gray-900 mt-1">₦ 45,200</p>
                <button 
                  onClick={() => showToast("Withdrawal requested successfully!")}
                  className="mt-6 w-full py-3 bg-cyan-500 text-[#060B19] rounded-3xl font-bold shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:bg-cyan-400 transition-colors"
                >
                  Withdraw Funds
                </button>
              </div>

              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Payout Methods</h3>
              <div className="bg-[#0A1128] rounded-3xl border border-slate-100 overflow-hidden shadow-lg mb-4">
                <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-gray-900" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">GTBank •••• 4512</p>
                      <p className="text-xs text-slate-400">Default Payout Account</p>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                </div>
                <button 
                  onClick={() => showToast("Add bank account modal")}
                  className="w-full p-5 flex items-center gap-3 hover:bg-white/5 transition-colors text-cyan-500 font-bold text-sm"
                >
                  <Plus className="w-5 h-5" />
                  Add New Bank Account
                </button>
              </div>
            </motion.div>
          )}

          {/* ── SETTINGS VIEW ───────────────────────────────── */}
          {activeView === 'SETTINGS' && (
            <motion.div
              key="SETTINGS"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Preferences</h3>
                  <div className="bg-[#0A1128] rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                    <ToggleItem icon={<Moon className="w-5 h-5" />} title="Dark Mode" description="Use dark theme" defaultChecked={true} />
                    <div className="h-px bg-white/5 mx-4" />
                    <ToggleItem icon={<Volume2 className="w-5 h-5" />} title="Voice Navigation" description="Read directions aloud" defaultChecked={true} />
                    <div className="h-px bg-white/5 mx-4" />
                    <ToggleItem icon={<Bell className="w-5 h-5" />} title="Push Notifications" description="Receive ride alerts" defaultChecked={true} />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Driver Preferences</h3>
                  <div className="bg-[#0A1128] rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                    <ToggleItem icon={<Car className="w-5 h-5" />} title="Auto-Accept Rides" description="Automatically accept requests" defaultChecked={false} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SUPPORT VIEW ────────────────────────────────── */}
          {activeView === 'SUPPORT' && (
            <motion.div
              key="SUPPORT"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-gradient-to-br from-cyan-500/20 to-transparent border border-cyan-500/20 rounded-3xl p-6 shadow-lg mb-6 text-center">
                <HelpCircle className="w-10 h-10 text-cyan-500 mx-auto mb-3" />
                <h3 className="text-xl font-black text-gray-900 mb-2">How can we help?</h3>
                <p className="text-sm text-slate-400 mb-6">Our support team is available 24/7 to assist you with any issues.</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => showToast("Opening Live Chat...")}
                    className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 p-5 rounded-3xl transition-colors border border-slate-100"
                  >
                    <MessageSquare className="w-6 h-6 text-gray-900" />
                    <span className="text-xs font-bold text-gray-900">Live Chat</span>
                  </button>
                  <button 
                    onClick={() => showToast("Calling Support...")}
                    className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 p-5 rounded-3xl transition-colors border border-slate-100"
                  >
                    <Phone className="w-6 h-6 text-gray-900" />
                    <span className="text-xs font-bold text-gray-900">Call Us</span>
                  </button>
                </div>
              </div>

              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Frequently Asked Questions</h3>
              <div className="bg-[#0A1128] rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                <FaqItem question="How are payouts processed?" />
                <div className="h-px bg-white/5 mx-4" />
                <FaqItem question="What if a rider cancels?" />
                <div className="h-px bg-white/5 mx-4" />
                <FaqItem question="How to update my vehicle?" />
              </div>
            </motion.div>
          )}

          {activeView === 'HISTORY' && (
            <motion.div
              key="HISTORY"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {historyRides.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Clock className="w-10 h-10" />
                  </div>
                  <p className="text-slate-500 font-medium">You have no past trips.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {historyRides.map(ride => (
                    <div key={ride.id} className="bg-[#0A1128] p-5 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          {new Date(ride.timestamp).toLocaleDateString()}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                          ride.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {ride.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1">
                          <p className="text-gray-900 font-bold">{ride.dropoff}</p>
                          <p className="text-xs text-slate-500 font-medium">From: {ride.pickup}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'SCHEDULE' && (
            <motion.div
              key="SCHEDULE"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {scheduledRides.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-cyan-500/10 text-cyan-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-cyan-500/20">
                    <Clock className="w-10 h-10" />
                  </div>
                  <p className="text-slate-500 font-medium">No upcoming scheduled rides.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {scheduledRides.map(ride => (
                    <div key={ride.id} className="bg-[#0A1128] p-5 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-3 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-cyan-500 uppercase tracking-widest">
                          {ride.scheduledTime ? new Date(ride.scheduledTime).toLocaleString() : 'Pending Time'}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-green-500/10 text-green-500">
                          Accepted
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <p className="text-gray-900 font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500"/> {ride.pickup}</p>
                        <p className="text-gray-900 font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500"/> {ride.dropoff}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// Subcomponents

function MenuItem({ icon, title, subtitle, onClick }: { icon: React.ReactNode, title: string, subtitle?: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-5 bg-[#0A1128] hover:bg-[#0A1128]/80 p-5 rounded-3xl border border-slate-100 shadow-lg transition-colors group text-left"
    >
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900">{title}</h4>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-500 transition-colors" />
    </button>
  );
}

function ToggleItem({ icon, title, description, defaultChecked }: { icon: React.ReactNode, title: string, description: string, defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="p-5 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-300">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <button 
        onClick={() => setChecked(!checked)}
        className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${checked ? 'bg-cyan-500' : 'bg-slate-700'}`}
      >
        <motion.div 
          animate={{ x: checked ? 24 : 0 }}
          className="w-4 h-4 bg-white rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
        />
      </button>
    </div>
  );
}

function FaqItem({ question }: { question: string }) {
  return (
    <button className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group">
      <span className="text-sm font-bold text-slate-300 group-hover:text-gray-900 transition-colors">{question}</span>
      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-500 transition-colors" />
    </button>
  );
}


