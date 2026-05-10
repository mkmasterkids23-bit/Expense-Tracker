import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { insforge } from '../lib/insforge';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, Mail, AlertCircle, ArrowRight, Lock, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { GradientDots } from '../components/ui/gradient-dots';

export default function Login() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setError(null);
    setLoading(true);
    
    try {
      const { data, error: authError } = await insforge.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (authError) {
        throw authError;
      }

      await refreshUser();
      navigate('/dashboard');
    } catch (err: any) {
      console.error("[AUTH ERROR]:", err);
      setError(err.message || "Invalid email or password");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-slate-950 relative overflow-hidden">
      <GradientDots className="opacity-10" duration={40} />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          x: shake ? [-10, 10, -10, 10, 0] : 0
        }}
        transition={{ duration: shake ? 0.4 : 0.6 }}
        className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="pt-12 pb-8 px-10 text-center">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Login</h1>
          <p className="text-slate-400 font-medium">Enter your credentials to access your account</p>
        </div>

        <div className="p-10 pt-0">
          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-3 group">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Email Identity</label>
              <div className="relative p-2 bg-slate-800/50 rounded-2xl">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans text-white shadow-sm placeholder:text-slate-600"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-3 group">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Secret Key</label>
              <div className="relative p-2 bg-slate-800/50 rounded-2xl">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-6 pr-14 py-4 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans text-white shadow-sm placeholder:text-slate-600"
                  placeholder="••••••••"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-start gap-3 p-4 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-2xl"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="font-semibold">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "relative w-full flex items-center justify-center gap-3 py-5 bg-[#0f172a] text-white font-bold rounded-2xl transition-all shadow-2xl overflow-hidden active:scale-[0.98]",
                  loading && "opacity-70 cursor-not-allowed"
                )}
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="tracking-tight text-lg">Login</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center space-y-4">
            <div className="flex flex-col gap-1 items-center">
              <span className="text-xs text-slate-500 font-medium tracking-tight">No account?</span>
              <Link to="/signup" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors tracking-tight">
                Create Account
              </Link>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
