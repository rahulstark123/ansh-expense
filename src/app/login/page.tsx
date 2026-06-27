"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useExpenseStore } from "@/stores/expense-store";
import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { switchUser } = useExpenseStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showGoogleConnecting, setShowGoogleConnecting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("error");
    if (authError) {
      setErrorMsg(decodeURIComponent(authError.replace(/\+/g, " ")));
    }

    if (params.get("reset") === "success") {
      setSuccessMsg("Password updated successfully. Sign in with your new password.");
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        sessionStorage.setItem("ansh_auth_session", "true");
        sessionStorage.setItem("ansh_auth_token", session.access_token);
        router.push("/dashboard");
      }
    };
    checkSession();
  }, [router]);

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setShowGoogleConnecting(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setShowGoogleConnecting(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred during Google Sign-In.");
      setShowGoogleConnecting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setErrorMsg(error.message);
        setResetLoading(false);
        return;
      }

      setSuccessMsg("Password reset link sent. Check your email inbox.");
      setResetLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to send reset email. Please try again.");
      setResetLoading(false);
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      let { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error && (error.message.toLowerCase().includes("invalid login credentials") || error.status === 400)) {
        const seededEmails = [
          "vikram@ansh.com",
          "priya.sharma@ansh.com",
          "amit.patel@ansh.com",
          "rohan.gupta@ansh.com"
        ];

        if (seededEmails.includes(email.trim().toLowerCase())) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
              data: {
                full_name: email.trim().split("@")[0].split(".").map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(" "),
              }
            }
          });

          if (!signUpError) {
            const retry = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password: password,
            });
            data = retry.data;
            error = retry.error;
          }
        }
      }

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      const token = data.session?.access_token;
      if (!token) {
        setErrorMsg("Failed to obtain session token.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = await res.json();
      if (!res.ok) {
        setErrorMsg(resData.error || "Failed to retrieve profile.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("ansh_auth_session", "true");
      sessionStorage.setItem("ansh_auth_token", token);

      if (resData.onboardingRequired) {
        setSuccessMsg("Success! Directing to setup your profile...");
        setTimeout(() => {
          router.push("/onboarding");
        }, 1000);
      } else {
        setSuccessMsg(`Welcome back, ${resData.employee.name}! Redirecting...`);
        switchUser(resData.employee.id);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred during sign in.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-slate-800">
      <title>Sign In | Ansh Expense</title>
      <meta name="description" content="Sign in to your Ansh Expense workspace to manage expense claims, log mileage, and audit team reimbursements." />
      <AuthMarketingPanel />

      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2 select-none">
        <div className="w-full max-w-[420px] space-y-8 animate-in fade-in duration-500">
          <div className="text-center">
            <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-2.5 text-sm text-slate-500">
              Log in to your workspace to manage claims and projects.
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-xs font-bold text-rose-600 animate-in fade-in duration-200">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-bold text-emerald-600 animate-in fade-in duration-200">
              {successMsg}
            </div>
          )}

          <div className="space-y-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Or
              </span>
            </div>

            {forgotMode ? (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Email Address
                  </label>
                  <div className="mt-2">
                    <input
                      type="email"
                      required
                      autoFocus
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Enter the email linked to your account. We&apos;ll send a reset link.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex w-full justify-center items-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending link...
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(false);
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className="flex w-full justify-center items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 cursor-pointer"
                  >
                    Back to sign in
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleFormLogin} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Email Address
                  </label>
                  <div className="mt-2">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vikram@ansh.com"
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Password
                  </label>
                  <div className="mt-2 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="password123"
                      className="block w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-3.5 text-sm text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 outline-none cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(true);
                      setResetEmail(email);
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-500 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center items-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in to Workspace"
                    )}
                  </button>
                </div>
              </form>
            )}

            <p className="mt-8 text-center text-sm font-semibold text-slate-400">
              New to ANSH?{" "}
              <Link
                href="/signup"
                className="font-bold text-indigo-600 hover:text-indigo-500 font-bold"
              >
                Create an account
              </Link>
            </p>
          </div>

          <div className="pt-8 pb-4 text-center">
            <p className="text-[11px] font-semibold text-slate-400">
              © 2026 ANSH Expense. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {showGoogleConnecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-white/[0.08] bg-slate-950/90 p-8 text-center shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-6">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Connecting with Google</h3>
            <p className="text-xs text-slate-500">Securing connection to your workspace account...</p>
          </div>
        </div>
      )}
    </div>
  );
}
