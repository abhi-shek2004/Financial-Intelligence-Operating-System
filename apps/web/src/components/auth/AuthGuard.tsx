"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Skip guard on login page
    if (pathname === '/login') {
      setIsAuthorized(true);
      return;
    }

    const token = localStorage.getItem('fios_token');
    if (!token) {
      setIsAuthorized(false);
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  if (isAuthorized === null) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-emerald-500 font-mono text-sm tracking-widest">VERIFYING CLEARANCE...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false && pathname !== '/login') {
    return null; // Will redirect
  }

  return <>{children}</>;
}
