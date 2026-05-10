import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { insforge } from '../lib/insforge';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, Mail, User, AlertCircle, ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { GradientDots } from '../components/ui/gradient-dots';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await insforge.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        options: {
          data: { name: name.trim() }
        }
      });

      if (authError) throw authError;

      // Navigate to OTP page
      navigate(`/otp?email=${encodeURIComponent(email.trim().toLowerCase())}&mode=signup`);
    } catch (err: any) {
      console.error("[SIGNUP ERROR]:", err);
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-slate-950 relative overflow-hidden py-12">
      <GradientDots className="opacity-10" duration={40} />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="pt-12 pb-6 px-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3 h-3" />
            Identity Registration Protocol
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white mb-3">Join the Network</h1>
          <p className="text-slate-400 font-medium max-w-sm mx-auto">Create your secure identity for end-to-end encrypted expense tracking</p>
        </div>

        <div className="p-10 pt-0">
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-3 group">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1 text-white">Full Name</label>
              <div className="relative p-2 bg-slate-800/50 rounded-2xl">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-sans text-white shadow-sm placeholder:text-slate-600"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-3 group">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1 text-white">Email Address</label>
              <div className="relative p-2 bg-slate-800/50 rounded-2xl">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-sans text-white shadow-sm placeholder:text-slate-600"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 group">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1 text-white">Secret Key</label>
                <div className="relative p-2 bg-slate-800/50 rounded-2xl">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-sans text-white shadow-sm placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-3 group">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1 text-white">Confirm Key</label>
                <div className="relative p-2 bg-slate-800/50 rounded-2xl">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-sans text-white shadow-sm placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 text-sm bg-red-950/30 border border-red-900/50 rounded-2xl"
                >
                  <div className="flex items-start gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="font-semibold">{error}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group pt-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "relative w-full flex items-center justify-center gap-3 py-6 bg-slate-950 text-white font-bold rounded-3xl transition-all shadow-2xl overflow-hidden active:scale-[0.98]",
                  loading && "opacity-70 cursor-not-allowed"
                )}
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="tracking-tight text-xl text-white">Create Identity</span>
                    <ArrowRight className="w-6 h-6 text-white" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center space-y-4">
            <div className="flex flex-col gap-1 items-center">
              <span className="text-xs text-slate-500 font-medium tracking-tight">Already have an identity?</span>
              <Link to="/login" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors tracking-tight">
                Login here
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
