"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import AuthGuard from '@/components/auth/AuthGuard';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <AuthGuard>
      {isLoginPage ? (
        <div className="h-full w-full">{children}</div>
      ) : (
        <>
          <Sidebar />
          <main className="flex-1 flex flex-col p-4 overflow-hidden h-full">
            <Topbar />
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </>
      )}
    </AuthGuard>
  );
}
