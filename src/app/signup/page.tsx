"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel";
import { MsmeBadge } from "@/components/shared/msme-badge";
import { supabase } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saathicode, setSaathicode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showGoogleConnecting, setShowGoogleConnecting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-slate-200", textColor: "text-slate-400" };
    
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;

    let label = "Weak";
    let color = "bg-rose-500";
    let textColor = "text-rose-600";
    if (score >= 5) {
      label = "Strong";
      color = "bg-emerald-500";
      textColor = "text-emerald-600";
    } else if (score >= 4) {
      label = "Good";
      color = "bg-indigo-500";
      textColor = "text-indigo-600";
    } else if (score >= 3) {
      label = "Fair";
      color = "bg-amber-500";
      textColor = "text-amber-600";
    }

    return { score, label, color, textColor };
  };

  const handleGoogleSignup = async () => {
    setErrorMsg("");
    if (!acceptedTerms) {
      setErrorMsg("Please accept the Terms & Conditions and Privacy Policy to continue.");
      return;
    }
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
      setErrorMsg("An error occurred during Google Sign-up.");
      setShowGoogleConnecting(false);
    }
  };

  const handleFormSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!acceptedTerms) {
      setErrorMsg("Please accept the Terms & Conditions and Privacy Policy to continue.");
      return;
    }

    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify your passwords.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMsg("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setErrorMsg("Password must contain at least one lowercase letter.");
      return;
    }

    if (!/\d/.test(password)) {
      setErrorMsg("Password must contain at least one number.");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setErrorMsg("Password must contain at least one special character (e.g. !, @, #, $, %, etc.).");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: name.trim(),
            accepted_terms: true,
            saathicode: saathicode.trim() || null,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      setSuccessMsg("Account created successfully! Redirecting to onboarding...");
      
      sessionStorage.setItem("ansh_auth_session", "true");
      if (data.session?.access_token) {
        sessionStorage.setItem("ansh_auth_token", data.session.access_token);
      }

      setTimeout(() => {
        router.push("/onboarding");
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-slate-800">
      <title>Sign Up | Ansh Expense</title>
      <meta name="description" content="Create an Ansh Expense account for your workspace to automate team reimbursements and track project spending." />
      <AuthMarketingPanel />

      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2 select-none">
        <div className="w-full max-w-[420px] space-y-8 animate-in fade-in duration-500">
          <div className="text-center">
            <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-900">
              Create an account
            </h2>
            <p className="mt-2.5 text-sm text-slate-500">
              Join ANSH Workspace to manage your expense reports.
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
              onClick={handleGoogleSignup}
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

            <form onSubmit={handleFormSignup} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Full Name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

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
                    placeholder="alex@example.com"
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
                    placeholder="At least 8 characters"
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

                {password.length > 0 && (
                  <div className="mt-3 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-400">Password Strength:</span>
                      <span className={`font-bold ${getPasswordStrength(password).textColor}`}>
                        {getPasswordStrength(password).label}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      {[1, 2, 3, 4].map((index) => {
                        const { score, color } = getPasswordStrength(password);
                        let active = false;
                        if (score >= 5) active = true;
                        else if (score === 4 && index <= 3) active = true;
                        else if (score === 3 && index <= 2) active = true;
                        else if (score >= 1 && score <= 2 && index === 1) active = true;

                        return (
                          <div
                            key={index}
                            className={`h-full rounded-full transition-all duration-300 ${
                              active ? color : "bg-slate-200"
                            }`}
                          />
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <svg
                          className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${
                            password.length >= 8 ? "text-emerald-500" : "text-slate-300"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={password.length >= 8 ? "text-slate-600 font-semibold" : "text-slate-400"}>
                          8+ characters
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <svg
                          className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${
                            /[A-Z]/.test(password) ? "text-emerald-500" : "text-slate-300"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={/[A-Z]/.test(password) ? "text-slate-600 font-semibold" : "text-slate-400"}>
                          Uppercase letter
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <svg
                          className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${
                            /[a-z]/.test(password) ? "text-emerald-500" : "text-slate-300"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={/[a-z]/.test(password) ? "text-slate-600 font-semibold" : "text-slate-400"}>
                          Lowercase letter
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <svg
                          className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${
                            /\d/.test(password) ? "text-emerald-500" : "text-slate-300"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={/\d/.test(password) ? "text-slate-600 font-semibold" : "text-slate-400"}>
                          One number (0-9)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 col-span-2">
                        <svg
                          className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${
                            /[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-emerald-500" : "text-slate-300"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span
                          className={
                            /[!@#$%^&*(),.?":{}|<>]/.test(password)
                              ? "text-slate-600 font-semibold"
                              : "text-slate-400"
                          }
                        >
                          Special character (e.g. !, @, #, $, %)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Confirm Password
                </label>
                <div className="mt-2 relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="block w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-3.5 text-sm text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 outline-none cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Helped by ANSH Saathi
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    value={saathicode}
                    onChange={(e) => setSaathicode(e.target.value)}
                    placeholder="e.g. SAATHI-00001 (Optional)"
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1 pb-2">
                <input
                  id="accept-terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="accept-terms" className="text-xs text-slate-500 leading-normal select-none">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline"
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !acceptedTerms}
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create ANSH Account"
                  )}
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm font-semibold text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-indigo-600 hover:text-indigo-500 font-bold"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="pt-8 pb-4 text-center space-y-3">
            <div className="flex justify-center">
              <MsmeBadge variant="app" />
            </div>
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
