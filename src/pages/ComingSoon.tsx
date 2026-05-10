import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { LogOut, Rocket, Clock, Mail } from 'lucide-react';

export default function ComingSoon() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white px-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center max-w-2xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
          <Rocket className="w-3 h-3" />
          Launching Soon
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
          We're building something <span className="text-blue-500 italic">extraordinary</span>.
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed">
          Welcome back, <span className="text-white font-semibold">{user?.name || user?.email}</span>. 
          You've successfully signed in, but this feature is still under development.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl w-full md:w-auto">
            <Clock className="w-6 h-6 text-blue-400" />
            <div className="text-left">
              <div className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Status</div>
              <div className="font-semibold">V0.8 (Alpha)</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl w-full md:w-auto">
            <Mail className="w-6 h-6 text-purple-400" />
            <div className="text-left">
              <div className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Updates</div>
              <div className="font-semibold">Sent to your email</div>
            </div>
          </div>
        </div>

        <button
          onClick={signOut}
          className="flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </motion.div>

      <div className="absolute bottom-8 left-0 w-full text-center text-slate-600 text-sm z-10 font-mono text-balance px-4">
        © 2026 Authentication System. Secure & Verified.
      </div>
    </div>
  );
}
