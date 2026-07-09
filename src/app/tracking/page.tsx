"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, PhoneCall, Star, CheckCircle2 } from 'lucide-react';
import { listenToRides, rateRide, sendRideMessage, RideRequest, listenToDriverLocation } from '../../lib/rideService';
import { requestNotificationPermission, showNativeNotification } from '../../lib/notificationService';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('../../components/LiveMap'), { ssr: false });

function TrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rideId = searchParams.get('rideId');
  
  // Real Map Coordinates
  const pickupLocation: [number, number] = [7.8010, 4.1785]; // Library
  const dropoffLocation: [number, number] = [7.8025, 4.1800]; // Hostel Block C
  const driverStart: [number, number] = [7.8000, 4.1810]; // Main Gate

  // Simulation States
  const TOTAL_TIME = 15; // 15 seconds arrival time
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [hasArrived, setHasArrived] = useState(false);
  const [isPickedUp, setIsPickedUp] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [driverPosition, setDriverPosition] = useState<[number, number]>(driverStart);

  // Advanced Features State
  const [currentRide, setCurrentRide] = useState<RideRequest | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const previousMessageCount = React.useRef(0);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentRide?.messages) {
      const currentCount = currentRide.messages.length;
      if (currentCount > previousMessageCount.current) {
        const lastMessage = currentRide.messages[currentCount - 1];
        if (lastMessage.sender === 'driver') {
          if (!showChatModal) {
            showNativeNotification('Driver: ' + (currentRide.targetedDriverId ? 'Match' : 'John D.'), { body: lastMessage.text });
            showToast('💬 ' + lastMessage.text);
          }
          // Play a soft pop sound
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
            audio.play().catch(e => {});
          } catch(e) {}
        }
        previousMessageCount.current = currentCount;
        
        // Auto scroll to bottom
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 100);
      }
    }
  }, [currentRide?.messages, showChatModal]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!rideId) return;

    const unsubscribe = listenToRides((rides) => {
      const myRide = rides.find(r => r.id === rideId);
      if (myRide) {
        setCurrentRide(myRide);
        
        if (myRide.status === 'arrived' && !hasArrived) {
          setHasArrived(true);
          setDriverPosition(pickupLocation);
          showToast('🔔 Your driver has arrived!');
          showNativeNotification('Driver Arrived!', { body: 'Your driver is waiting outside.' });
        } else if (myRide.status === 'picked_up' && !isPickedUp) {
          setIsPickedUp(true);
          setHasArrived(true);
          showToast('🚙 En route to destination!');
        } else if (myRide.status === 'completed' && !isCompleted) {
          setIsCompleted(true);
          setShowRatingModal(true);
        } else if (myRide.status === 'accepted' && currentRide?.status === 'pending') {
          showToast('🔔 Driver is on the way!');
          showNativeNotification('Ride Accepted', { body: 'Your driver is en route.' });
        }
      }
    });

    return () => unsubscribe();
  }, [rideId, hasArrived, isPickedUp, isCompleted]);

  // Listen to Real Driver Location
  useEffect(() => {
    if (currentRide?.driverId) {
      const unsub = listenToDriverLocation(currentRide.driverId, (loc) => {
        if (loc) setDriverPosition(loc);
      });
      return () => unsub();
    }
  }, [currentRide?.driverId]);

  // Simulation effect for smooth movement on map ONLY IF no real driver location
  useEffect(() => {
    if (hasArrived && !isPickedUp) {
      setDriverPosition(pickupLocation);
      return;
    }
    
    if (isPickedUp) {
       setDriverPosition(dropoffLocation);
       return;
    }

    if (currentRide?.driverId) return; // Ignore simulation if real driver assigned

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) return 1;
        const newTime = prev - 1;
        const progress = 1 - (newTime / TOTAL_TIME);
        const lat = driverStart[0] + (pickupLocation[0] - driverStart[0]) * progress;
        const lng = driverStart[1] + (pickupLocation[1] - driverStart[1]) * progress;
        setDriverPosition([lat, lng]);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasArrived, isPickedUp, currentRide?.driverId]);

  const handleSendChat = async () => {
    if (!chatMessage.trim() || !rideId) return;
    await sendRideMessage(rideId, 'passenger', chatMessage);
    setChatMessage('');
  };

  const handleSubmitRating = async () => {
    if (!rideId) return;
    await rateRide(rideId, rating || 5, review);
    router.push('/dashboard');
  };

  return (
    <div className="h-screen w-full flex flex-col relative max-w-md mx-auto bg-gray-100 overflow-hidden shadow-2xl">
      
      {/* Map Background Layer */}
      <div className="absolute inset-0 z-0">
        <LiveMap 
          disableUserTracking={true}
          pickupLocation={pickupLocation}
          dropoffLocation={isPickedUp ? dropoffLocation : undefined} 
          driverPosition={driverPosition}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-100/80 via-transparent to-white/50 pointer-events-none"></div>
      </div>

      {/* Header */}
      {toastMsg && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-2 rounded-full shadow-xl font-bold text-sm whitespace-nowrap animate-bounce">
          {toastMsg}
        </div>
      )}

      <div className="absolute top-0 w-full px-4 py-6 flex justify-between items-center z-20 bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm">
        <button 
          onClick={() => router.push('/dashboard')} 
          className="bg-white p-2 rounded-full shadow-md text-slate-800 transition-transform active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="bg-white rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-slate-800">Live Tracking</span>
        </div>
      </div>

      {/* BOTTOM SHEET: Driver Status */}
      
      {/* Success Modal Overlay (Shows when arrived but not picked up) */}
      <div className={`absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ${(hasArrived && !isPickedUp) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`absolute bottom-0 w-full bg-white rounded-t-[2rem] p-6 shadow-2xl transition-transform duration-500 ${(hasArrived && !isPickedUp) ? 'translate-y-0' : 'translate-y-full'}`}>
           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <CheckCircle2 className="w-8 h-8 text-green-600" />
           </div>
           <h2 className="text-2xl font-black text-center text-slate-800 mb-2">Your driver is here!</h2>
           <p className="text-center text-slate-500 mb-6">John is waiting for you in the Silver Toyota Corolla (BWN-123). Please proceed to the vehicle.</p>
        </div>
      </div>

      {/* Main Status Card (Hidden when arrived but not picked up) */}
      <div className={`absolute bottom-0 w-full bg-white rounded-t-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.08)] z-20 flex flex-col px-6 pt-3 pb-8 transition-transform duration-500 ${(hasArrived && !isPickedUp) ? 'translate-y-full' : 'translate-y-0'}`}>
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5"></div>
        
        {/* Dynamic ETA Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 mb-1">
              {isPickedUp ? 'Heading to Dropoff' : (timeRemaining > 1 ? `Arriving in ${Math.ceil(timeRemaining / 60)} mins` : 'Arriving very soon...')}
            </h2>
            <p className="text-sm font-medium text-slate-500">{isPickedUp ? 'Sit back and relax.' : 'Please head to the pickup point'}</p>
          </div>
        </div>

        {/* Driver Profile */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
          <div className="relative flex-shrink-0">
            <img src="https://i.pravatar.cc/150?img=11" alt="John D." className="w-12 h-12 rounded-full object-cover shadow-sm" />
            <div className="absolute -bottom-1 -right-1 bg-[#00C9E8] rounded-full p-0.5 border-2 border-white shadow-sm flex items-center justify-center">
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-slate-800">{currentRide?.targetedDriverId ? 'Driver Match' : 'John D.'}</h3>
              <div className="flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-xs font-bold text-slate-700">
                4.9
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Toyota Corolla • Silver</span>
              <span className="bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-700">BWN-123</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="flex-grow bg-[#0A192F] hover:bg-[#0A192F]/90 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex justify-center items-center gap-2 text-sm">
            <PhoneCall className="w-4 h-4" />
            Call Driver
          </button>
          {!isPickedUp && (
            <button 
              onClick={() => router.push('/dashboard')} 
              className="px-5 py-3.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-xl transition-colors active:scale-[0.98] text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      
      {/* Chat FAB & Modal */}
      {!isCompleted && (
        <>
          <button 
            onClick={() => setShowChatModal(true)}
            className="absolute bottom-[230px] right-4 z-20 w-12 h-12 bg-[#00C9E8] text-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <div className="relative">
              <PhoneCall className="w-5 h-5" />
              {currentRide?.messages && currentRide.messages.length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
              )}
            </div>
          </button>

          {showChatModal && (
            <div className="absolute inset-0 z-50 bg-black/50 flex flex-col justify-end">
              <div className="bg-white h-[60%] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">
                <div className="bg-[#0A192F] p-4 text-white flex justify-between items-center">
                  <h3 className="font-bold">Chat with Driver</h3>
                  <button onClick={() => setShowChatModal(false)} className="text-white bg-white/20 p-1 rounded-full"><ArrowLeft className="w-4 h-4 rotate-180"/></button>
                </div>
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {currentRide?.messages?.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'passenger' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'passenger' ? 'bg-[#00C9E8] text-[#0A192F] rounded-br-none font-bold' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {(!currentRide?.messages || currentRide.messages.length === 0) && (
                    <p className="text-center text-gray-400 text-sm mt-10 font-medium">No messages yet. Say hi!</p>
                  )}
                </div>
                <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                  <input 
                    type="text" 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00C9E8]"
                  />
                  <button onClick={handleSendChat} className="bg-[#0A192F] text-white px-4 py-2 rounded-full font-bold">Send</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Post-Ride Rating Modal */}
      {showRatingModal && (
        <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 bg-[#00C9E8]/20 rounded-full flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-[#00C9E8] fill-[#00C9E8]" />
            </div>
            <h2 className="text-2xl font-black text-[#0A192F] mb-1">Rate your ride</h2>
            <p className="text-gray-500 font-medium text-sm text-center mb-6">How was your trip with John D.?</p>
            
            <div className="flex gap-2 mb-6">
              {[1,2,3,4,5].map(star => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  className={`p-2 transition-transform ${rating >= star ? 'scale-110' : 'opacity-50 hover:opacity-80 hover:scale-105'}`}
                >
                  <Star className={`w-8 h-8 ${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>

            <textarea 
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Leave a compliment or feedback (optional)"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00C9E8] resize-none h-20 mb-6"
            />

            <button 
              onClick={handleSubmitRating}
              className="w-full bg-[#0A192F] text-white font-black py-4 rounded-xl transition-all shadow-lg active:scale-95 text-lg"
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function TrackingSimulation() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-gray-100" />}>
      <TrackingContent />
    </Suspense>
  );
}
