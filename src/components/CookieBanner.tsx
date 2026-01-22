"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consented = localStorage.getItem("cookie_consent");
    if (!consented) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie_consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur-sm md:p-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex-1 space-y-2 text-center md:text-left">
          <p className="text-sm font-medium text-white">
            We use cookies to improve your experience.
          </p>
          <p className="text-xs text-zinc-400">
            By using our website, you agree to our <a href="/terms" className="text-blue-400 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>. 
            We use cookies to analyze traffic and personalize content.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={acceptCookies}
            className="rounded-lg bg-white px-6 py-2 text-sm font-medium text-black hover:bg-zinc-200 transition-colors"
          >
            Accept All
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
