import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { LogIn, CheckCircle2, ShieldAlert, Sparkles, Sun, Moon } from "lucide-react";

interface LogoutScreenProps {
  onReturn: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export default function LogoutScreen({ onReturn, theme, toggleTheme }: LogoutScreenProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReturn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReturn]);

  return (
    <div className={`min-h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300 p-4 ${
      theme === "dark" ? "bg-[#090A0F] text-slate-100" : "bg-[#F1F5F9] text-slate-800"
    }`} id="logout-container">
      
      {/* Background Decorative Neon Glows */}
      {theme === "dark" && (
        <>
          <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        </>
      )}

      {/* Floating Theme Switcher */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
            theme === "dark" 
              ? "bg-[#16191E] border-white/10 text-slate-400 hover:text-indigo-400" 
              : "bg-white border-slate-200 text-slate-600 hover:text-indigo-600 shadow-sm"
          }`}
          id="logout-theme-switch"
        >
          {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-indigo-500" />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`w-full max-w-[450px] rounded-3xl border p-8 text-center relative z-10 transition-all ${
          theme === "dark"
            ? "bg-[#111319]/80 backdrop-blur-xl border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            : "bg-white border-slate-200/80 shadow-[0_15px_30px_rgba(148,163,184,0.15)]"
        }`}
        id="logout-card"
      >
        <div className="flex flex-col items-center">
          {/* Animated Success Seal */}
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 shadow-inner">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 animate-pulse" />
          </div>

          <h2 className={`text-2xl font-extrabold font-display tracking-tight mb-2 ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}>
            Logged Out Safely
          </h2>
          
          <p className={`text-xs font-medium max-w-[300px] leading-relaxed mb-6 ${
            theme === "dark" ? "text-slate-400" : "text-slate-500"
          }`}>
            Your session has been securely terminated. All pending workspace edits have been finalized on the cloud database.
          </p>

          <div className={`w-full p-4 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2.5 mb-6 ${
            theme === "dark"
              ? "bg-[#090A0F]/60 border-white/5 text-slate-400"
              : "bg-slate-50 border-slate-150 text-slate-500"
          }`}>
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
            <span>Redirecting to authentication portal in <span className="font-bold text-indigo-400">{countdown}s</span>...</span>
          </div>

          <button
            onClick={onReturn}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/10 cursor-pointer hover:-translate-y-0.5 active:scale-95"
            id="logout-return-btn"
          >
            <LogIn className="h-4 w-4" />
            <span>Return to Login Portal</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
