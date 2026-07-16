"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft, Sparkles, Briefcase, Shield, User, CheckCircle2, Circle, Building, MapPin, Users, ChevronDown, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { MsmeBadge } from "@/components/shared/msme-badge";

const countryCurrencyMap: Record<string, string> = {
  US: "USD",
  IN: "INR",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
  AU: "AUD",
  CA: "CAD",
  SG: "SGD",
  AE: "AED",
  JP: "JPY",
  AT: "EUR",
  BE: "EUR",
  CY: "EUR",
  EE: "EUR",
  FI: "EUR",
  GR: "EUR",
  IE: "EUR",
  IT: "EUR",
  LV: "EUR",
  LT: "EUR",
  LU: "EUR",
  MT: "EUR",
  NL: "EUR",
  PT: "EUR",
  SK: "EUR",
  SI: "EUR",
  ES: "EUR"
};

const ALL_COUNTRIES = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "CV", name: "Cabo Verde" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Congo (Brazzaville)" },
  { code: "CD", name: "Congo (Kinshasa)" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GD", name: "Grenada" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KP", name: "Korea, North" },
  { code: "KR", name: "Korea, South" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "MK", name: "North Macedonia" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" }
];

export default function OnboardingPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [customDepartment, setCustomDepartment] = useState("");
  const [role, setRole] = useState("Employee");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [employeeCount, setEmployeeCount] = useState("1-10");
  const [country, setCountry] = useState("US");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState(1);

  const isManagerOrAdmin = role === "Admin" || role === "Manager" || role === "Owner";

  useEffect(() => {
    // If role is employee, ensure we don't end up on step 3
    if (step === 3 && !isManagerOrAdmin) {
      setStep(2);
    }
  }, [step, isManagerOrAdmin]);

  useEffect(() => {
    // Confirm they are authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        // Double check if employee profile already exists
        const token = session.access_token;
        try {
          const res = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          if (data.employee) {
            // Already onboarded, redirect to dashboard
            router.push("/dashboard");
            return;
          }
        } catch (err) {
          console.error(err);
        }

        // Prefill name from Supabase user signup metadata
        const metadataName = session.user?.user_metadata?.full_name || session.user?.user_metadata?.name || "";
        setName(metadataName);
        setCheckingSession(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleNextStep1 = (e: React.MouseEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!phoneNumber || !phoneNumber.trim()) {
      setErrorMsg("Phone number (with country code) is required.");
      return;
    }
    if (department === "Other" && !customDepartment.trim()) {
      setErrorMsg("Please specify your department.");
      return;
    }
    setStep(2);
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      setStep(1);
      return;
    }

    if (!phoneNumber || !phoneNumber.trim()) {
      setErrorMsg("Phone number (with country code) is required.");
      setStep(1);
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2 && isManagerOrAdmin) {
      setStep(3);
      return;
    }

    if (isManagerOrAdmin) {
      if (!companyName.trim()) {
        setErrorMsg("Please enter your company name.");
        return;
      }
      if (!companyAddress.trim()) {
        setErrorMsg("Please enter your company address.");
        return;
      }
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMsg("Your session has expired. Please log in again.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          department: department === "Other" ? customDepartment.trim() : department,
          role,
          phoneNumber: phoneNumber.trim(),
          companyName: isManagerOrAdmin ? companyName.trim() : null,
          companyAddress: isManagerOrAdmin ? companyAddress.trim() : null,
          employeeCount: isManagerOrAdmin ? employeeCount : null,
          country: isManagerOrAdmin ? country : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Failed to save profile.");
        setLoading(false);
        return;
      }

      // Store credentials and redirect
      sessionStorage.setItem("ansh_auth_session", "true");
      sessionStorage.setItem("ansh_auth_token", session.access_token);
      
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Validating secure session...
          </span>
        </div>
      </div>
    );
  }

  const getStepHeader = () => {
    switch (step) {
      case 1:
        return {
          title: "Personal Profile",
          desc: "Verify your pre-filled name and select your department registry."
        };
      case 2:
        return {
          title: "Account Permission",
          desc: "Assign an account permission role to determine your workspace privileges."
        };
      case 3:
        return {
          title: "Workspace Details",
          desc: "Set up company name, scale size, and address for your organization workspace."
        };
      default:
        return {
          title: "Workspace Settings",
          desc: "Set up your profile details, department registry, and workspace role."
        };
    }
  };

  const header = getStepHeader();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden select-none">
      <title>Onboarding Setup | Ansh Expense</title>
      <meta name="description" content="Set up your profile, create or join a workspace, and invite teammates to start using Ansh Expense." />
      
      {/* LEFT PANE - Progress Steps Timeline */}
      <div className="dark relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#070809] lg:flex border-r border-white/5 p-16 xl:p-20 min-h-screen">
        {/* Dynamic mesh glow background */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute -left-20 top-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[130px] opacity-30" />
          <div className="absolute -right-20 bottom-1/4 h-[300px] w-[300px] rounded-full bg-sky-500/10 blur-[120px] opacity-20" />
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-13 w-13 items-center justify-center rounded-full bg-white/10 border border-white/10">
            <img
              src="/logoAnshapps.png"
              alt="Ansh Apps Logo"
              className="h-11 w-11 object-contain"
            />
          </div>
          <div>
            <span className="font-extrabold text-xs tracking-wider uppercase text-white block">
              Ansh Expense
            </span>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block -mt-0.5">
              Workspace Onboarding
            </span>
          </div>
        </div>

        {/* Steps Stepper */}
        <div className="relative z-10 space-y-12 my-auto max-w-md">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-white leading-tight">
              Let's complete your{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
                Workspace Profile
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Set up your profile details, choose your department role, and customize company workspace details.
            </p>
          </div>

          <div className="space-y-8 relative pl-2">
            {/* Visual connector line */}
            <div className="absolute left-[19px] top-3 bottom-3 w-[2px] bg-slate-800" />

            {/* STEP 1 */}
            <div className={`flex gap-4 relative transition-all duration-300 ${step < 1 ? "opacity-50" : ""}`}>
              {step > 1 ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                  <CheckCircle2 className="h-5.5 w-5.5" />
                </div>
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                  <span className="text-xs font-black">01</span>
                </div>
              )}
              <div className="space-y-1 pt-0.5">
                <h3 className={`text-sm font-bold ${step === 1 ? "text-indigo-400" : "text-white"}`}>Step 1: Personal Profile</h3>
                <p className={`text-xs leading-relaxed ${step === 1 ? "text-slate-300" : "text-slate-500"}`}>
                  Tell us your full name and select your department registry.
                </p>
              </div>
            </div>

            {/* STEP 2 */}
            <div className={`flex gap-4 relative transition-all duration-300 ${step < 2 ? "opacity-50" : ""}`}>
              {step > 2 ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                  <CheckCircle2 className="h-5.5 w-5.5" />
                </div>
              ) : step === 2 ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                  <span className="text-xs font-black">02</span>
                </div>
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 border border-white/5 text-slate-500">
                  <Circle className="h-4.5 w-4.5" />
                </div>
              )}
              <div className="space-y-1 pt-0.5">
                <h3 className={`text-sm font-bold ${step === 2 ? "text-indigo-400" : step > 2 ? "text-white" : "text-slate-400"}`}>Step 2: Access Permission</h3>
                <p className={`text-xs leading-relaxed ${step === 2 ? "text-slate-300" : "text-slate-500"}`}>
                  Assign your role layout. Choose Employee to view/log or administrative for workspace setup.
                </p>
              </div>
            </div>

            {/* STEP 3 */}
            <div className={`flex gap-4 relative transition-all duration-300 ${step < 3 ? "opacity-50" : ""}`}>
              {step === 3 ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                  <span className="text-xs font-black">03</span>
                </div>
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 border border-white/5 text-slate-500">
                  <Circle className="h-4.5 w-4.5" />
                </div>
              )}
              <div className="space-y-1 pt-0.5">
                <h3 className={`text-sm font-bold ${step === 3 ? "text-indigo-400" : "text-slate-400"}`}>
                  {!isManagerOrAdmin ? "Step 3: Ready to Launch" : "Step 3: Workspace Setup"}
                </h3>
                <p className={`text-xs leading-relaxed ${step === 3 ? "text-slate-300" : "text-slate-500"}`}>
                  {!isManagerOrAdmin
                    ? "Complete profile registration and initialize your expense account."
                    : "Configure company details, team size, and registered physical address."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex flex-col items-start gap-3 text-[10px] font-semibold text-slate-500">
          <MsmeBadge variant="app" />
          <span>© 2026 ANSH Expense. Crafted for modern workspace teams.</span>
        </div>
      </div>

      {/* RIGHT PANE - Form Input Panel */}
      <div className="flex w-full items-center justify-center bg-slate-50 px-6 py-12 lg:w-1/2 select-none overflow-y-auto min-h-screen">
        <div className="w-full max-w-[420px] space-y-8 py-8 animate-in fade-in duration-500">
          
          {/* Header Description */}
          <div className="text-center lg:text-left space-y-2">
            <div className="lg:hidden flex justify-center">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                <Sparkles className="h-5.5 w-5.5" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {header.title}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {header.desc}
            </p>
          </div>

          {/* Form Message Alerts */}
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-xs font-bold text-rose-600 animate-in fade-in duration-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                {/* FULL NAME */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Full Name
                  </label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="block w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3.5 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="mt-1.5 text-[9px] text-slate-500">
                    * Pre-filled from your signup form. You can adjust it here if needed.
                  </p>
                </div>

                {/* PHONE NUMBER */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Phone Number (Mandatory)
                  </label>
                  <div className="phone-input-container [&_.PhoneInputInput]:bg-white [&_.PhoneInputInput]:border-slate-200 [&_.PhoneInputInput]:text-slate-900 [&_.PhoneInputCountry]:bg-white [&_.PhoneInputCountry]:border-slate-200 [&_.PhoneInputCountry]:text-slate-900">
                    <PhoneInput
                      international
                      defaultCountry="US"
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={(val) => setPhoneNumber(val || "")}
                    />
                  </div>
                </div>

                {/* DEPARTMENT */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Department Registry
                  </label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="h-4.5 w-4.5" />
                    </div>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="block w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-10 py-3.5 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Product Design">Product Design</option>
                      <option value="Data Analytics">Data Analytics</option>
                      <option value="Executive">Executive</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Legal & Compliance">Legal & Compliance</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="IT Support">IT Support</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* CUSTOM DEPARTMENT NAME */}
                {department === "Other" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Specify Department Name
                    </label>
                    <div className="mt-2 relative">
                      <input
                        type="text"
                        required
                        value={customDepartment}
                        onChange={(e) => setCustomDepartment(e.target.value)}
                        placeholder="e.g. Quality Assurance"
                        className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleNextStep1}
                    className="flex w-full justify-center items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/15 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/25 active:scale-[0.98] cursor-pointer"
                  >
                    Next Step
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Role Selector */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                {/* ROLE SELECTOR */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Account Permission Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "Employee", label: "Employee", desc: "View & log claims" },
                      { value: "Manager", label: "Manager", desc: "Approve claims" },
                      { value: "Admin", label: "Admin", desc: "Full privileges & settings" },
                      { value: "Owner", label: "Owner", desc: "Workspace control & billing" }
                    ].map((item) => {
                      const active = role === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setRole(item.value)}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center cursor-pointer ${
                            active
                              ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50/80 hover:border-slate-300"
                          }`}
                        >
                          <Shield className={`h-4.5 w-4.5 mb-1.5 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                          <span className="text-xs font-bold block">{item.label}</span>
                          <span className="text-[9px] text-slate-500 block mt-0.5 leading-none">{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[9px] text-slate-500 leading-normal">
                    * Account role sets your workspace privileges level. Managers & Admins gain access to approvals, settings, and company configurations.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex flex-1 justify-center items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex flex-[2] justify-center items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/15 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Completing Setup...
                      </>
                    ) : isManagerOrAdmin ? (
                      <>
                        Next: Company Setup
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Company Setup (Managers/Admins only) */}
            {step === 3 && isManagerOrAdmin && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 border-b border-indigo-100 pb-2">
                    <Building className="h-4.5 w-4.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Company Workspace Setup</span>
                  </div>

                  {/* COMPANY NAME */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Company Name
                    </label>
                    <div className="mt-1.5 relative">
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. ANSH Solutions"
                        className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* BUSINESS COUNTRY */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Business Country
                    </label>
                    <div className="mt-1.5 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
                      >
                        {ALL_COUNTRIES.map((c) => {
                          const currency = countryCurrencyMap[c.code] || "USD";
                          return (
                            <option key={c.code} value={c.code}>
                              {c.name} ({currency})
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* EMPLOYEES COUNT */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Company Employee Size
                    </label>
                    <div className="mt-1.5 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Users className="h-3.5 w-3.5" />
                      </div>
                      <select
                        value={employeeCount}
                        onChange={(e) => setEmployeeCount(e.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
                      >
                        <option value="1-10">1 - 10 employees</option>
                        <option value="11-50">11 - 50 employees</option>
                        <option value="51-200">51 - 200 employees</option>
                        <option value="200+">200+ employees</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* COMPANY ADDRESS */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Company Address
                    </label>
                    <div className="mt-1.5 relative">
                      <div className="absolute top-3 left-3 text-slate-400">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <textarea
                        required
                        rows={2}
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        placeholder="e.g. 123 Business Park, Mumbai, India"
                        className="block w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex flex-1 justify-center items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex flex-[2] justify-center items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/15 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Completing Setup...
                      </>
                    ) : (
                      <>
                        Complete Workspace Setup
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
