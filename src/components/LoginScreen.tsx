import React, { useState, useEffect } from "react";
import { User } from "../types";
import { Shield, Users, Lock, Key, Sparkles, Sun, Moon, ArrowRight, UserPlus, LogIn, Sparkle } from "lucide-react";
import { motion } from "motion/react";

interface LoginScreenProps {
  onLogin: (role: "admin" | "user", username: string, email: string, avatar: string) => Promise<void>;
  isLoggingIn: boolean;
  users: User[];
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export default function LoginScreen({ onLogin, isLoggingIn, users, theme, toggleTheme }: LoginScreenProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [selectedRole, setSelectedRole] = useState<"admin" | "user">("admin");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sign In inputs
  const [adminUsername, setAdminUsername] = useState<string>("Aarav Gogia");
  const [adminPassword, setAdminPassword] = useState<string>("admin123");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userPassword, setUserPassword] = useState<string>("user123");

  // Sign Up inputs
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("user123");
  const [signUpRole, setSignUpRole] = useState<"admin" | "user">("user");

  // Filter default user list (excluding first user as they are typically the admin)
  const userList = users.filter(u => u.id !== "usr-1");
  const defaultUser = userList[0] || { id: "usr-2", name: "Jane Doe", email: "jane.doe@company.com" };

  useEffect(() => {
    if (!selectedUserId && userList.length > 0) {
      setSelectedUserId(userList[0].id);
    }
  }, [users, userList, selectedUserId]);

  // Quick helper to immediately sign in as default Admin
  const handleQuickAdminLogin = async () => {
    setErrorMsg(null);
    const adminObj = users.find(u => u.id === "usr-1") || {
      id: "usr-1",
      name: "Aarav Gogia",
      email: "aaravgogia10d@gmail.com"
    };
    await onLogin("admin", adminObj.name, adminObj.email, "https://api.dicebear.com/7.x/bottts/svg?seed=Aarav");
  };

  // Quick helper to immediately sign in as default Employee
  const handleQuickEmployeeLogin = async () => {
    setErrorMsg(null);
    const targetUser = users.find(u => u.id === selectedUserId) || defaultUser;
    const avatarSeed = targetUser.name.replace(/\s+/g, "");
    await onLogin("user", targetUser.name, targetUser.email, `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === "signin") {
      if (selectedRole === "admin") {
        if (!adminUsername.trim()) {
          setErrorMsg("Please enter an Admin username.");
          return;
        }
        if (adminPassword !== "admin123") {
          setErrorMsg("Invalid password. Hint: Use admin123");
          return;
        }
        const adminObj = users.find(u => u.id === "usr-1") || {
          id: "usr-1",
          name: adminUsername,
          email: "aaravgogia10d@gmail.com"
        };
        await onLogin("admin", adminObj.name, adminObj.email, "https://api.dicebear.com/7.x/bottts/svg?seed=Aarav");
      } else {
        const targetUser = users.find(u => u.id === selectedUserId) || defaultUser;
        if (userPassword !== "user123" && userPassword !== "pass123") {
          setErrorMsg("Invalid password. Hint: Use user123");
          return;
        }
        const avatarSeed = targetUser.name.replace(/\s+/g, "");
        await onLogin("user", targetUser.name, targetUser.email, `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`);
      }
    } else {
      // Sign Up validation
      if (!signUpName.trim()) {
        setErrorMsg("Please specify your full name.");
        return;
      }
      if (!signUpEmail.trim() || !signUpEmail.includes("@")) {
        setErrorMsg("Please enter a valid corporate email.");
        return;
      }
      if (!signUpPassword.trim()) {
        setErrorMsg("Please specify a security passcode.");
        return;
      }

      const seed = signUpName.replace(/\s+/g, "");
      const avatarUrl = signUpRole === "admin" 
        ? `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`
        : `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;

      await onLogin(signUpRole, signUpName.trim(), signUpEmail.trim(), avatarUrl);
    }
  };

  return (
    <div className={`min-h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300 p-4 ${
      theme === "dark" ? "bg-[#090A0F] text-slate-100" : "bg-[#F1F5F9] text-slate-800"
    }`} id="login-container">
      
      {/* Background Decorative Neon Glows */}
      {theme === "dark" && (
        <>
          <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
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
          title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
          id="login-theme-switch"
        >
          {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-indigo-500" />}
        </button>
      </div>

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={`w-full max-w-[460px] rounded-3xl border p-8 relative z-10 transition-all ${
          theme === "dark"
            ? "bg-[#111319]/80 backdrop-blur-xl border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            : "bg-white border-slate-200/80 shadow-[0_15px_30px_rgba(148,163,184,0.15)]"
        }`}
        id="login-card"
      >
        {/* Brand Banner */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-3 animate-pulse">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight mb-1.5 ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}>
            Task Verse 2.0
          </h2>
          <p className={`text-xs font-medium max-w-[290px] leading-relaxed ${
            theme === "dark" ? "text-slate-400" : "text-slate-500"
          }`}>
            Your intelligence-augmented team operations & task organization hub
          </p>
        </div>

        {/* Mode Toggler (Sign In vs Sign Up) */}
        <div className={`grid grid-cols-2 gap-2 p-1 rounded-2xl mb-6 ${
          theme === "dark" ? "bg-[#090A0F]" : "bg-slate-100"
        }`}>
          <button
            type="button"
            onClick={() => { setMode("signin"); setErrorMsg(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === "signin"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
            }`}
            id="mode-signin-btn"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setMode("signup"); setErrorMsg(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
            }`}
            id="mode-signup-btn"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Quick Instant Sign-In Shortcuts (Always accessible for easy client testing) */}
        {mode === "signin" && (
          <div className="mb-6 space-y-2">
            <span className="block text-[9px] font-bold text-indigo-400 uppercase tracking-widest text-center">⚡ Quick-Access Accounts</span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-left ${
                  theme === "dark" 
                    ? "bg-[#181D26] border-white/5 hover:border-indigo-500/20 text-slate-300 hover:text-white"
                    : "bg-slate-50 border-slate-200 hover:border-indigo-500/30 text-slate-700 hover:text-slate-900 shadow-sm"
                }`}
                id="quick-login-admin"
              >
                <Shield className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                <div className="truncate">
                  <p className="leading-tight">Administrator</p>
                  <p className="text-[9px] text-slate-500 font-medium">Aarav Gogia</p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleQuickEmployeeLogin}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-left ${
                  theme === "dark" 
                    ? "bg-[#181D26] border-white/5 hover:border-indigo-500/20 text-slate-300 hover:text-white"
                    : "bg-slate-50 border-slate-200 hover:border-indigo-500/30 text-slate-700 hover:text-slate-900 shadow-sm"
                }`}
                id="quick-login-employee"
              >
                <Users className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <p className="leading-tight">Employee</p>
                  <p className="text-[9px] text-slate-500 font-medium">{defaultUser.name}</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* FORM ERROR ALERTS */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs font-semibold text-rose-400 text-center mb-4" id="login-error-msg">
            {errorMsg}
          </div>
        )}

        {/* MAIN DYNAMIC FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === "signin" ? (
            /* ==================== SIGN IN FIELDS ==================== */
            <>
              {/* Internal Tab Switcher for Admin vs Employee portal fields */}
              <div className="flex border-b border-white/10 pb-2 mb-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  className={`text-xs font-bold pb-1 cursor-pointer transition-colors ${
                    selectedRole === "admin" 
                      ? "text-indigo-400 border-b-2 border-indigo-500" 
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Admin Credentials
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("user")}
                  className={`text-xs font-bold pb-1 cursor-pointer transition-colors ${
                    selectedRole === "user" 
                      ? "text-indigo-400 border-b-2 border-indigo-500" 
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Employee Select
                </button>
              </div>

              {selectedRole === "admin" ? (
                <div className="space-y-3.5">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}>
                      Admin Username
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <Shield className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="Enter Admin username"
                        className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                          theme === "dark"
                            ? "bg-[#090A0F]/80 border-white/5 text-slate-100 focus:border-indigo-500/40"
                            : "bg-white border-slate-200 text-slate-900"
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}>
                      Workspace Secret Key
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Hint: admin123"
                        className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                          theme === "dark"
                            ? "bg-[#090A0F]/80 border-white/5 text-slate-100 focus:border-indigo-500/40"
                            : "bg-white border-slate-200 text-slate-900"
                        }`}
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}>
                      Select Employee Account
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <Users className="h-4 w-4" />
                      </span>
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                          theme === "dark"
                            ? "bg-[#090A0F]/80 border-white/5 text-slate-100 focus:border-indigo-500/40"
                            : "bg-white border-slate-200 text-slate-900"
                        }`}
                        required
                      >
                        {userList.map(u => (
                          <option key={u.id} value={u.id} className={theme === "dark" ? "bg-[#111319] text-white" : "bg-white text-slate-900"}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}>
                      Security Passcode
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <Key className="h-4 w-4" />
                      </span>
                      <input
                        type="password"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="Hint: user123"
                        className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                          theme === "dark"
                            ? "bg-[#090A0F]/80 border-white/5 text-slate-100 focus:border-indigo-500/40"
                            : "bg-white border-slate-200 text-slate-900"
                        }`}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ==================== SIGN UP FIELDS ==================== */
            <div className="space-y-3.5">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}>
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Users className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      theme === "dark"
                        ? "bg-[#090A0F]/80 border-white/5 text-slate-100 focus:border-indigo-500/40"
                        : "bg-white border-slate-200 text-slate-900"
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}>
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Key className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="e.g. sarah.c@company.com"
                    className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      theme === "dark"
                        ? "bg-[#090A0F]/80 border-white/5 text-slate-100 focus:border-indigo-500/40"
                        : "bg-white border-slate-200 text-slate-900"
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}>
                  Workspace Passcode
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Passcode for logging in"
                    className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      theme === "dark"
                        ? "bg-[#090A0F]/80 border-white/5 text-slate-100 focus:border-indigo-500/40"
                        : "bg-white border-slate-200 text-slate-900"
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}>
                  Assign Workspace Role
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setSignUpRole("user")}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      signUpRole === "user"
                        ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400"
                        : theme === "dark" ? "bg-[#181D26] border-white/5 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignUpRole("admin")}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      signUpRole === "admin"
                        ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400"
                        : theme === "dark" ? "bg-[#181D26] border-white/5 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Submit button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-2 mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/10 cursor-pointer active:scale-95"
            id="login-submit-btn"
          >
            {isLoggingIn ? (
              <div className="h-3.5 w-3.5 border-2 border-t-transparent border-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === "signin" ? "Launch Task Verse" : "Register & Join Workspace"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Demo hints footer banner */}
        <div className={`mt-6 p-3 rounded-2xl border text-[10px] leading-normal ${
          theme === "dark"
            ? "bg-[#090A0F]/40 border-white/5 text-slate-400"
            : "bg-slate-50 border-slate-200 text-slate-500"
        }`}>
          <p className="font-semibold text-indigo-500 mb-0.5">🔑 Authentication Hints:</p>
          <ul className="list-disc list-inside space-y-0.5 font-mono">
            <li>Admin password: <span className="font-bold underline text-emerald-400">admin123</span></li>
            <li>Employee password: <span className="font-bold underline text-emerald-400">user123</span></li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
