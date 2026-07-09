"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Car, TrendingUp, AlertTriangle, 
  MapPin, CheckCircle2, Search, BarChart3
} from 'lucide-react';
import { listenToAllActiveRides, listenToAllOnlineDrivers, fetchAllCompletedRides, RideRequest, DriverState } from '@/lib/rideService';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const [rides, setRides] = useState<RideRequest[]>([]);
  const [drivers, setDrivers] = useState<DriverState[]>([]);
  const [completedRides, setCompletedRides] = useState<RideRequest[]>([]);
  const [chartData, setChartData] = useState<{date: string, rides: number, revenue: number}[]>([]);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // In a real app, verify admin role here
      if (!user) {
        router.push('/login');
      } else {
        setIsAuthChecking(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (isAuthChecking) return;
    
    const unsubscribeRides = listenToAllActiveRides(setRides);
    const unsubscribeDrivers = listenToAllOnlineDrivers(setDrivers);
    
    // Fetch analytics data
    fetchAllCompletedRides().then(data => {
      setCompletedRides(data);
      
      const grouped = data.reduce((acc, ride) => {
         const d = new Date(ride.timestamp || Date.now());
         const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
         if (!acc[dateStr]) acc[dateStr] = { rides: 0, revenue: 0 };
         acc[dateStr].rides += 1;
         // Simulate price 900 for SOLO, 250 for CARPOOL
         acc[dateStr].revenue += (ride.service === 'SOLO' ? 900 : 250);
         return acc;
      }, {} as Record<string, { rides: number, revenue: number }>);
      
      // If no data, provide dummy data for visualization
      let formattedData = Object.keys(grouped).map(key => ({
        date: key,
        rides: grouped[key].rides,
        revenue: grouped[key].revenue * 0.15 // 15% platform fee
      }));

      if (formattedData.length === 0) {
        formattedData = [
          { date: 'Jul 1', rides: 12, revenue: 1500 },
          { date: 'Jul 2', rides: 18, revenue: 2200 },
          { date: 'Jul 3', rides: 14, revenue: 1800 },
          { date: 'Jul 4', rides: 25, revenue: 3500 },
          { date: 'Jul 5', rides: 22, revenue: 3000 },
          { date: 'Jul 6', rides: 30, revenue: 4200 },
          { date: 'Jul 7', rides: 45, revenue: 6500 },
        ];
      }
      
      setChartData(formattedData);
    });

    return () => {
      unsubscribeRides();
      unsubscribeDrivers();
    };
  }, [isAuthChecking]);

  if (isAuthChecking) {
    return <div className="min-h-screen bg-[#0A1128] flex items-center justify-center"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // Calculate mock revenue: assuming each active/pending ride averages ₦1000, platform fee is 15%
  const todayRevenue = rides.length * 1000 * 0.15;
  const allTimeRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="min-h-screen bg-[#0A1128] text-white font-sans overflow-y-auto pb-12">
      {/* Top Navbar */}
      <nav className="w-full bg-[#112240] border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
            <AlertTriangle className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-widest text-white">COMMAND CENTER</h1>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Tove Drop Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={async () => await signOut(auth)}
            className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest px-4 py-2 rounded-lg bg-red-400/10 hover:bg-red-400/20"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#112240] rounded-2xl p-6 border border-white/5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] group-hover:bg-blue-500/20 transition-colors" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Car className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-1 rounded">Live</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-1 relative z-10">{rides.length}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest relative z-10">Total Active Rides</p>
          </div>

          <div className="bg-[#112240] rounded-2xl p-6 border border-white/5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-500/20 transition-colors" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Online</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-1 relative z-10">{drivers.length}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest relative z-10">Drivers Available</p>
          </div>

          <div className="bg-[#112240] rounded-2xl p-6 border border-white/5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] group-hover:bg-amber-500/20 transition-colors" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-1 rounded">Today</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-1 relative z-10">₦{todayRevenue.toLocaleString()}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest relative z-10">Est. Active Revenue</p>
          </div>

          <div className="bg-[#112240] rounded-2xl p-6 border border-white/5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] group-hover:bg-purple-500/20 transition-colors" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-400/10 px-2 py-1 rounded">All Time</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-1 relative z-10">₦{Math.floor(allTimeRevenue).toLocaleString()}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest relative z-10">Total Platform Fees</p>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-[#112240] rounded-2xl border border-white/5 shadow-lg overflow-hidden p-6 relative">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="font-black tracking-widest text-white uppercase text-sm mb-1">Platform Revenue Over Time</h3>
              <p className="text-slate-400 text-xs font-bold">Past 7 days performance metrics</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C9E8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00C9E8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} tickFormatter={(value) => `₦${value}`} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#00C9E8' }}
                  formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#00C9E8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Rides Table */}
          <div className="lg:col-span-2 bg-[#112240] rounded-2xl border border-white/5 shadow-lg overflow-hidden flex flex-col h-[500px]">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h3 className="font-black tracking-widest text-white uppercase text-sm">Live Dispatch Feed</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Live</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {rides.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <Search className="w-12 h-12 mb-4 opacity-50" />
                  <p className="font-bold tracking-widest uppercase text-sm">No Active Rides</p>
                </div>
              ) : (
                rides.map(ride => (
                  <div key={ride.id} className="bg-[#0A1128] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-white font-bold block">{ride.passengerName}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {ride.service} • {new Date(ride.timestamp!).toLocaleTimeString()}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${
                        ride.status === 'pending' 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {ride.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-3 h-3 text-red-400" />
                          <span className="text-xs text-slate-300 font-medium truncate">{ride.pickup}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          <span className="text-xs text-slate-300 font-medium truncate">{ride.dropoff}</span>
                        </div>
                      </div>
                      
                      {ride.driverId && (
                        <div className="pl-4 border-l border-white/10">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Assigned Driver</span>
                          <span className="text-xs text-white font-bold bg-white/5 px-2 py-1 rounded block">{ride.driverId.substring(0,8)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Online Drivers List */}
          <div className="bg-[#112240] rounded-2xl border border-white/5 shadow-lg overflow-hidden flex flex-col h-[500px]">
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
              <h3 className="font-black tracking-widest text-white uppercase text-sm">Online Drivers</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {drivers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <Users className="w-12 h-12 mb-4 opacity-50" />
                  <p className="font-bold tracking-widest uppercase text-sm">No Drivers Online</p>
                </div>
              ) : (
                drivers.map(driver => (
                  <div key={driver.driverId} className="bg-[#0A1128] rounded-xl p-4 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-white block mb-1">ID: {driver.driverId.substring(0,8)}...</span>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {driver.availableSeats} Seats Available
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
