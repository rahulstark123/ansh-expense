"use client";

import { useState } from "react";
import { ShieldCheck, Mail, Lock, KeyRound, Hash } from "lucide-react";
import { validateAdminCredentials } from "@/lib/admin/auth";

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!email.trim() || !password || !passcode || !pin) {
      setLoginError("All fields are required.");
      return;
    }

    if (validateAdminCredentials({ email, password, passcode, pin })) {
      onLogin();
    } else {
      setLoginError("Invalid credentials. Please check email, password, passcode, and PIN.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] font-sans text-slate-100 flex items-center justify-center relative px-4 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute left-[30%] top-[25%] h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-[120px]" />
        <div className="absolute right-[30%] top-[40%] h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-[#0A0F18]/85 border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-7 w-7 text-violet-400" />
          </div>
          <h1 className="text-xl font-black tracking-widest text-white uppercase">ANSH Admin</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Secure Administrative Access</p>
        </div>

        {loginError && (
          <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-3 text-xs font-bold text-rose-400 text-center">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Admin Email <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="expense@anshapps.com"
                className="w-full h-11 bg-slate-950/85 border border-slate-800 rounded-2xl px-4 pl-10 text-xs text-white outline-none focus:border-violet-500"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 bg-slate-950/85 border border-slate-800 rounded-2xl px-4 pl-10 text-xs text-white outline-none focus:border-violet-500"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Passcode <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full h-11 bg-slate-950/85 border border-slate-800 rounded-2xl px-4 pl-10 text-xs text-white outline-none focus:border-violet-500"
              />
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              PIN <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter PIN"
                className="w-full h-11 bg-slate-950/85 border border-slate-800 rounded-2xl px-4 pl-10 text-xs text-white outline-none focus:border-violet-500"
              />
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-violet-500 text-white font-black uppercase tracking-wider text-xs rounded-2xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            Sign In to Admin Panel
          </button>
        </form>
      </div>
    </div>
  );
}
