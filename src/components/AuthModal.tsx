import { useState } from "react";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (apiKey: string) => void;
  apiBase: string;
}

export function AuthModal({ isOpen, onClose, onSuccess, apiBase }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'signup' | 'verify' | 'forgot'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [tempApiKey, setTempApiKey] = useState(""); // Store API key while verifying
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setMessage(null);

    if (view === 'forgot') {
      try {
        const res = await fetch(`${apiBase}/api/v1/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Request failed");
        setMessage(data.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (view === 'verify') {
      // Verify Code Flow
      try {
        const res = await fetch(`${apiBase}/api/v1/auth/verify?token=${verificationCode}`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "X-API-Key": tempApiKey 
          }
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Verification failed");
        
        onSuccess(tempApiKey);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login/Signup Flow
    const endpoint = view === 'login' ? "/api/v1/auth/login" : "/api/v1/auth/signup";

    try {
      const res = await fetch(`${apiBase}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      if (view === 'login') {
        onSuccess(data.api_key);
        onClose();
      } else {
        // Signup success -> Move to verification
        setTempApiKey(data.api_key);
        setView('verify');
        setMessage("Account created! Please check your email (or server console) for the verification code.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const getTitle = () => {
    switch (view) {
      case 'login': return "Welcome Back";
      case 'signup': return "Create Account";
      case 'verify': return "Verify Email";
      case 'forgot': return "Reset Password";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {getTitle()}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'verify' ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">Verification Code</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-white outline-none focus:border-blue-500"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
          ) : view === 'forgot' ? (
            <div>
               <label className="mb-1 block text-sm font-medium text-zinc-400">Email Address</label>
               <input
                 type="email"
                 required
                 className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-white outline-none focus:border-blue-500"
                 placeholder="you@example.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
               />
               <p className="text-xs text-zinc-500 mt-2">
                 We'll send you a link to reset your password.
               </p>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-white outline-none focus:border-blue-500"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">Password</label>
                <input
                  type="password"
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-white outline-none focus:border-blue-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {view === 'signup' && (
                <div className="flex items-start gap-3 pt-1">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-800"
                    />
                  </div>
                  <label htmlFor="terms" className="text-xs text-zinc-400 leading-tight">
                    I agree to the <a href="/terms" target="_blank" className="text-blue-400 hover:underline">Terms of Service</a> and <a href="/privacy" target="_blank" className="text-blue-400 hover:underline">Privacy Policy</a>. 
                    I acknowledge that I release PromptShield from any liability regarding my usage of the platform.
                  </label>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white py-2.5 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Processing..." : view === 'login' ? "Sign In" : view === 'signup' ? "Create Account" : view === 'verify' ? "Verify" : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-center text-sm text-zinc-400">
          {view === 'login' && (
            <>
              <button onClick={() => setView('signup')} className="hover:text-white">
                Don't have an account? Sign up
              </button>
              <button onClick={() => setView('forgot')} className="hover:text-white text-xs">
                Forgot password?
              </button>
            </>
          )}
          {view === 'signup' && (
            <button onClick={() => setView('login')} className="hover:text-white">
              Already have an account? Sign in
            </button>
          )}
          {(view === 'verify' || view === 'forgot') && (
            <button onClick={() => setView('login')} className="hover:text-white">
              Back to Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
