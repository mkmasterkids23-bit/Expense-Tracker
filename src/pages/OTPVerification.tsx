import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { insforge } from '../lib/insforge';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, AlertCircle, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { GradientDots } from '../components/ui/gradient-dots';

export default function OTPVerification() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const mode = searchParams.get('mode') || 'signup';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (!email) {
      navigate(mode === 'login' ? '/login' : '/signup');
      return;
    }
  }, [email, navigate, mode]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; 
    if (!/^\d*$/.test(value)) return; 

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const verifyOTP = async () => {
    const enteredCode = code.join('');
    if (enteredCode.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await insforge.auth.verifyEmail({
        email: email!,
        otp: enteredCode,
      });

      if (authError) throw authError;

      await refreshUser();
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error("[VERIFY ERROR]:", err);
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const { error: resendError } = await insforge.auth.resendVerificationEmail({
        email: email!,
      });
      if (resendError) throw resendError;
      alert("Verification code resent!");
    } catch (err: any) {
      console.error("[RESEND ERROR]:", err);
      setError(err.message || "Failed to resend code");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-slate-950 relative overflow-hidden">
      <GradientDots className="opacity-10" duration={40} />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(mode === 'login' ? '/login' : '/signup')} 
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5",
            "bg-blue-500/10 text-blue-400 border border-blue-500/20"
          )}>
            <ShieldCheck className="w-3 h-3" />
            IDENTITY PROTOCOL
          </div>
        </div>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            Verify Identity
          </h1>
          <p className="text-slate-400 max-w-[280px] mx-auto text-sm font-medium">
            Enter the 6-digit code sent to
            <span className="font-bold text-white block mt-1">{email}</span>
          </p>
        </div>


        <div className="space-y-8">
          <div className="flex justify-between gap-2">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-full h-14 text-center text-2xl font-black bg-slate-800/50 border border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono shadow-sm text-white"
              />
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-4 text-sm font-bold text-red-400 bg-red-950/30 border border-red-900/50 rounded-2xl"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 p-5 text-center text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded-2xl"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-pulse" />
                <span className="font-bold">Identity Confirmed!</span>
                <span className="text-sm font-medium opacity-70">Synchronizing system state...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={verifyOTP}
            disabled={loading || success}
            className={cn(
              "w-full flex items-center justify-center gap-3 py-4 px-4 font-black rounded-2xl transition-all shadow-xl active:scale-[0.98]",
              "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20",
              (loading || success) && "opacity-70 cursor-not-allowed"
            )}
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Confirm Code
                <ArrowRight className="w-5 h-5 opacity-50" />
              </>
            )}
          </button>

          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm font-medium text-slate-500">
              Didn't receive the key?{' '}
              <button 
                onClick={handleResend}
                className="font-bold text-blue-400 hover:text-blue-300 underline underline-offset-4"
              >
                Dispatch New OTP
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
