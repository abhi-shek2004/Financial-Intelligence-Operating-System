"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import GlassPanel from '@/components/ui/GlassPanel';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem('fios_token', data.access_token);
        router.push('/');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Backend might be unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">FIOS Secure Access</h1>
          <p className="text-gray-400 mt-2 text-sm text-center">Institutional-Grade Intelligence Operating System</p>
        </div>

        <GlassPanel className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                placeholder="Enter operator ID"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Passcode</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  placeholder="••••••••"
                  required
                />
                <Lock className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg py-3 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Initialize Session'}
            </button>
            
            <div className="text-center text-xs text-gray-500 mt-4">
              Demo bypass: Use <span className="text-gray-300 font-mono">admin</span> / <span className="text-gray-300 font-mono">password</span>
            </div>
          </form>
        </GlassPanel>
      </div>
    </div>
  );
}
