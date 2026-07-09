import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  where,
  orderBy,
  limit,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  arrayUnion,
  increment
} from 'firebase/firestore';

export type RideStatus = 'pending' | 'accepted' | 'arrived' | 'picked_up' | 'cancelled' | 'completed' | null;

export interface RideRequest {
  id: string; // The Firestore document ID
  passengerId: string;
  passengerName: string;
  service: 'SOLO' | 'CARPOOL';
  pickup: string;
  dropoff: string;
  status: RideStatus;
  timestamp: number;
  scheduledTime?: number;
  notes?: string;
  driverId?: string;
  targetedDriverId?: string; // The specific driver this was dispatched to
  rating?: number;
  review?: string;
  messages?: { sender: 'passenger' | 'driver', text: string, timestamp: number }[];
}

export interface DriverState {
  driverId: string;
  isOnline: boolean;
  availableSeats: number;
  lastActive: number;
  location?: [number, number];
}

// References to collections
const ridesCollection = collection(db, 'rides');
const driversCollection = collection(db, 'drivers_online');
const usersCollection = collection(db, 'users');

// Wallet Management
export const getUserWalletBalance = async (userId: string): Promise<number> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    return data.walletBalance !== undefined ? data.walletBalance : 2450; // Default test balance
  } else {
    // Initialize default balance
    await setDoc(userRef, { walletBalance: 2450 }, { merge: true });
    return 2450;
  }
};

export const fundWallet = async (userId: string, amount: number) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { walletBalance: increment(amount) }, { merge: true });
};

// Driver Online Presence and Location
export const setDriverOnline = async (driverId: string, availableSeats: number) => {
  const driverRef = doc(db, 'drivers_online', driverId);
  await setDoc(driverRef, {
    driverId,
    isOnline: true,
    availableSeats,
    lastActive: Date.now()
  }, { merge: true });
};

export const updateDriverLocation = async (driverId: string, lat: number, lng: number) => {
  const driverRef = doc(db, 'drivers_online', driverId);
  await setDoc(driverRef, {
    location: [lat, lng],
    lastActive: Date.now()
  }, { merge: true });
};

export const listenToDriverLocation = (driverId: string, callback: (loc: [number, number] | null) => void) => {
  const driverRef = doc(db, 'drivers_online', driverId);
  return onSnapshot(driverRef, (docSnap) => {
    if (docSnap.exists() && docSnap.data().location) {
      callback(docSnap.data().location);
    } else {
      callback(null);
    }
  });
};

export const setDriverOffline = async (driverId: string) => {
  const driverRef = doc(db, 'drivers_online', driverId);
  await deleteDoc(driverRef); // Remove from pool
};

// Passenger: Request a ride
export const requestRide = async (
  passengerId: string,
  service: 'SOLO' | 'CARPOOL', 
  pickup: string, 
  dropoff: string, 
  scheduledTime?: number, 
  notes?: string, 
  passengerName?: string
): Promise<string> => {
  
  // 1. SMART DISPATCH ALGORITHM
  // Fetch all online drivers
  const q = query(driversCollection, where('isOnline', '==', true));
  const snapshot = await getDocs(q);
  const onlineDrivers: DriverState[] = [];
  const now = Date.now();
  snapshot.forEach(doc => {
    const data = doc.data() as DriverState;
    // Only dispatch to drivers who have pinged their heartbeat in the last 30 seconds
    if (data.lastActive && (now - data.lastActive) < 30000) {
      onlineDrivers.push(data);
    }
  });

  let targetedDriverId = '';

  if (onlineDrivers.length > 0) {
    if (service === 'CARPOOL') {
      // Priority 1: Drivers with an active carpool going (available seats 1-3).
      // This is the "needs it the most" logic to fill up cars efficiently.
      const partiallyFull = onlineDrivers.filter(d => d.availableSeats > 0 && d.availableSeats < 4);
      if (partiallyFull.length > 0) {
        // Sort by fewest seats available to top them up first
        partiallyFull.sort((a, b) => a.availableSeats - b.availableSeats);
        targetedDriverId = partiallyFull[0].driverId;
      } else {
        // Priority 2: Fully empty drivers (available seats = 4)
        const emptyDrivers = onlineDrivers.filter(d => d.availableSeats === 4);
        if (emptyDrivers.length > 0) {
          targetedDriverId = emptyDrivers[0].driverId;
        }
      }
    } else {
      // SOLO: We strictly need a driver with 4 empty seats (no active carpools)
      const emptyDrivers = onlineDrivers.filter(d => d.availableSeats === 4);
      if (emptyDrivers.length > 0) {
        targetedDriverId = emptyDrivers[0].driverId;
      }
    }
  }

  // Fallback: If no perfect match found, we still write it as pending without a target.
  // In a real app, we'd wait or show 'No drivers available'.

  const newRide = {
    passengerId,
    passengerName: passengerName || 'Alex Bowen', 
    service,
    pickup,
    dropoff,
    status: 'pending',
    timestamp: Date.now(),
    ...(targetedDriverId ? { targetedDriverId } : {}),
    ...(scheduledTime ? { scheduledTime } : {}),
    ...(notes ? { notes } : {})
  };

  const docRef = await addDoc(ridesCollection, newRide);
  return docRef.id;
};

// Driver: Accept a ride
export const acceptRide = async (rideId: string, driverId: string) => {
  const rideRef = doc(db, 'rides', rideId);
  await updateDoc(rideRef, {
    status: 'accepted',
    driverId
  });
};

// Driver: Mark as arrived
export const arriveRide = async (rideId: string) => {
  const rideRef = doc(db, 'rides', rideId);
  await updateDoc(rideRef, {
    status: 'arrived'
  });
};

// Driver: Mark as picked up (passenger in car)
export const pickupRide = async (rideId: string) => {
  const rideRef = doc(db, 'rides', rideId);
  await updateDoc(rideRef, {
    status: 'picked_up'
  });
};

// Driver: Mark as completed (dropped off)
export const completeRide = async (rideId: string) => {
  const rideRef = doc(db, 'rides', rideId);
  await updateDoc(rideRef, {
    status: 'completed'
  });
};

// Driver: Cancel ride
export const cancelRide = async (rideId: string) => {
  const rideRef = doc(db, 'rides', rideId);
  await updateDoc(rideRef, {
    status: 'cancelled'
  });
};

// Admin: Listen to all active/pending rides
export const listenToAllActiveRides = (callback: (rides: RideRequest[]) => void) => {
  const q = query(
    ridesCollection, 
    where('status', 'in', ['pending', 'accepted', 'arrived', 'picked_up'])
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const rides: RideRequest[] = [];
    snapshot.forEach(doc => {
      rides.push({ id: doc.id, ...doc.data() } as RideRequest);
    });
    // Sort by timestamp desc locally
    rides.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    callback(rides);
  }, (error) => {
    console.error("Firestore listenToAllActiveRides error: ", error);
  });

  return unsubscribe;
};

// Admin: Listen to all online drivers
export const listenToAllOnlineDrivers = (callback: (drivers: DriverState[]) => void) => {
  const q = query(driversCollection, where('isOnline', '==', true));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const drivers: DriverState[] = [];
    snapshot.forEach(doc => {
      drivers.push(doc.data() as DriverState);
    });
    callback(drivers);
  }, (error) => {
    console.error("Firestore listenToAllOnlineDrivers error: ", error);
  });

  return unsubscribe;
};

// Rate a completed ride
export const rateRide = async (rideId: string, rating: number, review?: string) => {
  const rideRef = doc(db, 'rides', rideId);
  await updateDoc(rideRef, {
    rating,
    ...(review ? { review } : {})
  });
};

// Send a chat message
export const sendRideMessage = async (rideId: string, sender: 'passenger' | 'driver', text: string) => {
  const rideRef = doc(db, 'rides', rideId);
  await updateDoc(rideRef, {
    messages: arrayUnion({ sender, text, timestamp: Date.now() })
  });
};

// Listener Hook
export const listenToRides = (callback: (rides: RideRequest[]) => void) => {
  // Query to get recent rides or pending rides
  // In a real app, drivers might listen to 'pending', passengers listen to their own rides.
  // For simplicity we just listen to recent rides.
  const q = query(ridesCollection, orderBy('timestamp', 'desc'), limit(50));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const rides: RideRequest[] = [];
    snapshot.forEach((doc) => {
      rides.push({ id: doc.id, ...doc.data() } as RideRequest);
    });
    callback(rides);
  }, (error) => {
    console.error("Firestore listen error: ", error);
  });

  return unsubscribe;
};

// Fetch Ride History for a User
export const fetchRideHistory = async (userId: string, role: 'passenger' | 'driver') => {
  const field = role === 'passenger' ? 'passengerId' : 'driverId';
  const q = query(
    ridesCollection, 
    where(field, '==', userId)
  );

  const snapshot = await getDocs(q);
  const rides: RideRequest[] = [];
  snapshot.forEach(doc => {
    const data = doc.data() as RideRequest;
    if (data.status === 'completed' || data.status === 'cancelled') {
      rides.push({ ...data, id: doc.id });
    }
  });

  // Sort locally by timestamp desc
  rides.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  
  return rides.slice(0, 50);
};

// Admin: Fetch all completed rides for analytics
export const fetchAllCompletedRides = async () => {
  const q = query(ridesCollection, where('status', '==', 'completed'));
  const snapshot = await getDocs(q);
  const rides: RideRequest[] = [];
  snapshot.forEach(doc => {
    rides.push({ ...doc.data(), id: doc.id } as RideRequest);
  });
  // Sort locally by timestamp asc
  rides.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  return rides;
};

// Fetch Scheduled Rides for a User
export const fetchScheduledRides = async (userId: string, role: 'passenger' | 'driver') => {
  const field = role === 'passenger' ? 'passengerId' : 'driverId';
  const q = query(
    ridesCollection, 
    where(field, '==', userId)
  );

  const snapshot = await getDocs(q);
  const rides: RideRequest[] = [];
  snapshot.forEach(doc => {
    const data = doc.data() as RideRequest;
    if (data.scheduledTime && (data.status === 'pending' || data.status === 'accepted')) {
      rides.push({ ...data, id: doc.id });
    }
  });

  // Sort locally by scheduledTime asc
  rides.sort((a, b) => (a.scheduledTime || 0) - (b.scheduledTime || 0));

  return rides;
};
