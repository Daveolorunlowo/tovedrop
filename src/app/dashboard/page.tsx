"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the dashboard client component and disable Server-Side Rendering (SSR)
// This fixes the "window is not defined" error thrown by react-paystack during the build process
const DashboardClient = dynamic(() => import('./DashboardClient'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-500">Loading Dashboard...</div>
});

export default function DashboardPage() {
  return <DashboardClient />;
}
