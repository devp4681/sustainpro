import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { Leaf, Eye, EyeOff, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const [, navigate] = useLocation();
  const { login, isAuthenticated, checkAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    navigate("/admin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password, remember);
      // Give a tiny pause for the token to be stored, then verify auth before redirect
      await new Promise(r => setTimeout(r, 100));
      await checkAuth();
      toast.success("Welcome back!");
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#06182e] via-[#0a335c] to-[#0c4585] p-4 font-sans selection:bg-sky-500/30 selection:text-sky-200 relative overflow-hidden">
      {/* Dynamic background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -z-10 animate-pulse-soft"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl -z-10 animate-pulse-soft" style={{ animationDelay: "1s" }}></div>

      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 shadow-xl backdrop-blur-md mb-4 hover:scale-105 transition-transform duration-300">
            <Leaf className="w-8 h-8 text-sky-300" />
          </div>
          <h1 className="text-3.5xl font-bold text-white font-serif tracking-tight">SustainPro</h1>
          <p className="text-sky-200/80 text-sm mt-1.5 font-medium uppercase tracking-wider">Control Center & CMS Dashboard</p>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="bg-slate-950/40 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6"
        >
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-white font-serif">Administrator Login</h2>
            <p className="text-xs text-sky-200/60 font-medium">Enter your credentials below to authenticate</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 animate-ping"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400" />
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              autoFocus
              required
              className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 shadow-inner"
            />
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-400" />
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-[var(--color-primary)] focus:ring-sky-500/50 cursor-pointer"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Remember me</span>
            </label>
            <Link
              href="/admin/forgot-password"
              className="text-sm text-sky-400 hover:text-sky-300 hover:underline font-semibold no-underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#0c4585] to-[#185ba5] hover:from-[#0a3a70] hover:to-[#134d8f] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#072d57]/50 hover:shadow-sky-500/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <p className="text-center text-sky-200/40 text-xs mt-8 font-medium">
          © {new Date().getFullYear()} SustainPro Process SolutionTM LLP. All rights reserved.
        </p>
      </div>
    </div>
  );
}
