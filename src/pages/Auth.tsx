import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Laptop, Mail, Lock, User, ArrowRight, Loader2, Sparkles, ShieldCheck, Globe } from "lucide-react";
import { signInWithGoogle, auth } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthData = z.infer<typeof registerSchema>;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      // Fetch the OAuth URL from the backend
      const response = await fetch('/api/auth/google/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();

      // Open the OAuth provider's URL directly in a popup
      const authWindow = window.open(
        url,
        'Google Login',
        'width=600,height=700'
      );

      if (!authWindow) {
        toast.error("Popup blocked. Please allow popups for this site.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Failed to sign in with Google");
    }
  };

  // Listen for success message from popup
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { token, user } = event.data;
        // Store token and user in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success("Signed in with Google!");
        // Force a reload to refresh the AuthProvider state
        window.location.reload();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthData>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema) as any,
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Authentication failed");
      }

      // Store token and user in localStorage
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
      
      // Force a reload to refresh the AuthProvider state
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* Left Pane - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-white relative z-10">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link to="/" className="inline-flex items-center gap-2 mb-12 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                <Laptop className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tighter text-gray-900">CompCharity</span>
            </Link>

            <div className="mb-12">
              <h1 className="text-5xl font-bold tracking-tighter text-gray-900 mb-4">
                {isLogin ? "Welcome back." : "Join the mission."}
              </h1>
              <p className="text-xl text-gray-500 font-medium">
                {isLogin 
                  ? "Sign in to manage your tech submissions." 
                  : "Start your journey of digital empowerment today."}
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        {...register("name")}
                        className="block w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-3xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-500 font-bold ml-1">{(errors.name as any).message}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      {...register("email")}
                      className="block w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-3xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 font-bold ml-1">{(errors.email as any).message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                    {isLogin && (
                      <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700">Forgot?</button>
                    )}
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      {...register("password")}
                      type="password"
                      className="block w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-3xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="text-xs text-red-500 font-bold ml-1">{(errors.password as any).message}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-6 px-6 bg-blue-600 text-white rounded-3xl font-bold text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-12">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-6 bg-white text-gray-400 font-bold uppercase tracking-widest">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-4 py-5 px-6 bg-white border-2 border-gray-100 rounded-3xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <div className="mt-12 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {isLogin ? "Don't have an account? Register" : "Already have an account? Sign in"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Pane - Visuals */}
      <div className="hidden lg:flex flex-1 bg-gray-900 relative items-center justify-center overflow-hidden">
        {/* Atmospheric Background */}
        <div className="absolute inset-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[100px]" 
          />
        </div>

        <div className="relative z-10 max-w-lg text-center px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="mb-12"
          >
            <div className="w-32 h-32 bg-white/5 backdrop-blur-3xl rounded-[48px] flex items-center justify-center mx-auto border border-white/10 shadow-2xl mb-12">
              <Sparkles className="w-16 h-16 text-blue-500" />
            </div>
            <h2 className="text-5xl font-bold text-white tracking-tighter mb-8 leading-tight">
              Technology is a <br />
              <span className="text-blue-500 italic font-serif">Human Right.</span>
            </h2>
            <p className="text-xl text-white/40 font-medium leading-relaxed">
              Your contribution helps us bridge the digital divide and provide essential tools to those who need them most.
            </p>
          </motion.div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] border border-white/5 text-left">
              <ShieldCheck className="w-8 h-8 text-blue-500 mb-4" />
              <div className="text-white font-bold mb-1">Secure Data</div>
              <div className="text-white/30 text-xs">Certified military-grade wiping</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] border border-white/5 text-left">
              <Globe className="w-8 h-8 text-blue-500 mb-4" />
              <div className="text-white font-bold mb-1">Global Impact</div>
              <div className="text-white/30 text-xs">Sustainable tech lifecycle</div>
            </div>
          </div>
        </div>

        {/* Decorative Rail Text */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2">
          <span className="writing-vertical-rl rotate-180 text-[11px] font-bold tracking-[0.5em] text-white/10 uppercase">
            CompCharity • Digital Inclusion • Ireland • 2026
          </span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
