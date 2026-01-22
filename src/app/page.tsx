"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Visualizer } from "../components/Visualizer";
import { Analytics } from "../components/Analytics";
import { CodeSnippets } from "../components/CodeSnippets";
import { Suggestions } from "../components/Suggestions";
import { SubscriptionModal } from "../components/SubscriptionModal";
import { AuthModal } from "../components/AuthModal";
import { ChangePasswordModal } from "../components/ChangePasswordModal";

import { ExecuteResponse, ActivityLog } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'playground' | 'visualizer' | 'analytics' | 'code' | 'api'>('playground');

  // API Key State
  const [apiKey, setApiKey] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showSubModal, setShowSubModal] = useState(false);
  const [showChangePwdModal, setShowChangePwdModal] = useState(false);
  const [userInfo, setUserInfo] = useState<{email: string, tier: string, usage_count: number, max_usage: number, is_verified: boolean, subscription_plan: string} | null>(null);

  // Playground State
  const [rawInput, setRawInput] = useState("");
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4");
  const [providerKey, setProviderKey] = useState(""); // Optional: User provided key for LLM
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load API Key from local storage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem("ps_api_key");
    if (storedKey) setApiKey(storedKey);
  }, []);

  // Fetch User Info when API Key changes
  useEffect(() => {
    if (apiKey) {
      fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: { "X-API-Key": apiKey }
      })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          // Key is invalid (e.g. database reset)
          setApiKey("");
          localStorage.removeItem("ps_api_key");
          setUserInfo(null);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then(data => {
        if (data) setUserInfo(data);
      })
      .catch(() => setUserInfo(null));
    } else {
      setUserInfo(null);
    }
  }, [apiKey]);

  // Save API Key when changed
  useEffect(() => {
    if (apiKey) localStorage.setItem("ps_api_key", apiKey);
  }, [apiKey]);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExecuteResponse | null>(null);

  // Analytics State
  const [historyLogs, setHistoryLogs] = useState<ActivityLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // API Management State
  const [apiStats, setApiStats] = useState<{
    total_requests: number;
    total_tokens_saved: number;
    average_savings_percentage: number;
    average_latency_ms: number;
  } | null>(null);
  const [apiTimeSeries, setApiTimeSeries] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'api' && apiKey) {
      // Fetch Stats
      fetch(`${API_BASE}/api/v1/analytics/stats`, {
        headers: { "X-API-Key": apiKey }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => setApiStats(data))
      .catch(err => console.error("Failed to fetch stats:", err));

      // Fetch Time Series
      fetch(`${API_BASE}/api/v1/analytics/time-series`, {
        headers: { "X-API-Key": apiKey }
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => setApiTimeSeries(data))
      .catch(err => console.error("Failed to fetch time series:", err));
    }
  }, [activeTab, apiKey]);

  async function handleRotateKey() {
    if (!confirm("Are you sure you want to rotate your API Key? Your old key will stop working immediately.")) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/rotate-key`, {
        method: "POST",
        headers: { "X-API-Key": apiKey }
      });
      
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.api_key);
        alert("API Key rotated successfully! Please update your applications.");
      } else {
        alert("Failed to rotate key.");
      }
    } catch (e) {
      console.error(e);
      alert("Error rotating key.");
    }
  }

  // Fetch history when analytics tab is active
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchHistory();
    }
  }, [activeTab]);

  async function fetchHistory() {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const headers: Record<string, string> = {};
      if (apiKey) headers["X-API-Key"] = apiKey;
      
      const res = await fetch(`${API_BASE}/api/v1/stats/history?limit=50`, {
        headers
      });
      if (res.ok) {
        const logs = await res.json();
        setHistoryLogs(logs);
      } else {
        if (res.status === 401 || res.status === 403) {
             setApiKey("");
             localStorage.removeItem("ps_api_key");
             throw new Error("Session expired. Please login again.");
        }
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
      const message = err instanceof Error ? err.message : "Failed to load analytics. Is the backend running?";
      setHistoryError(message);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleOptimize() {
    if (!rawInput.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers["X-API-Key"] = apiKey;

      const res = await fetch(`${API_BASE}/api/v1/optimize`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: rawInput,
          model: model,
        }),
      });

      if (!res.ok) {
        const payload = await res.json();
        const message =
          payload && payload.detail
            ? String(payload.detail)
            : `Request failed with status ${res.status}`;
        throw new Error(message);
      }

      const payload = await res.json();
      // Adapt OptimizationResult to ExecuteResponse
      const adaptedData: ExecuteResponse = {
        provider: "none",
        model: model,
        raw_text: payload.raw_text,
        compressed_text: payload.compressed_text,
        output: "Optimization only - no LLM execution performed.",
        tokens: payload.tokens,
        analysis: payload.analysis,
        suggestions: payload.suggestions,
        confidence_score: payload.confidence_score
      };
      setData(adaptedData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleExecute() {
    if (!rawInput.trim()) {
      return;
    }

    if (!apiKey) {
      setError("API Key is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey
        },
        body: JSON.stringify({
          text: rawInput,
          provider,
          model,
          provider_key: providerKey || undefined
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message =
          payload && payload.detail
            ? String(payload.detail)
            : `Request failed with status ${res.status}`;
        throw new Error(message);
      }

      const payload: ExecuteResponse = await res.json();
      setData(payload);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const savingsPercent =
    data && data.tokens.raw_tokens > 0
      ? Math.round(
        ((data.tokens.raw_tokens - data.tokens.compressed_tokens) /
          data.tokens.raw_tokens) *
        100
      )
      : 0;

  const getCostPerToken = (modelName: string) => {
    const lower = modelName.toLowerCase();
    if (lower.includes("gpt-4o-mini")) return 0.15 / 1000000;
    if (lower.includes("gpt-4")) return 30.0 / 1000000;
    if (lower.includes("claude")) return 3.0 / 1000000;
    if (lower.includes("gemini")) return 0.35 / 1000000;
    return 0; // Unknown
  };

  const rawCost = data ? data.tokens.raw_tokens * getCostPerToken(data.model || model) : 0;
  const compressedCost = data ? data.tokens.compressed_tokens * getCostPerToken(data.model || model) : 0;
  const costSaved = rawCost - compressedCost;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <header className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight sm:text-4xl">
                PromptShield Playground
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                Explore PTIL compression and LLM execution side by side.
              </p>
            </div>

            <div className="flex flex-col gap-2 items-end w-full sm:w-auto">
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {userInfo ? (
                  <div className="flex flex-col items-end text-xs text-zinc-400 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-200 font-medium">{userInfo.email}</span>
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-300 uppercase text-[10px] tracking-wider border border-blue-500/20">
                        {userInfo.tier}
                      </span>
                      {userInfo.tier === 'free' && (
                        <button 
                          onClick={() => setShowSubModal(true)}
                          className="ml-2 rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] text-green-300 hover:bg-green-500/30 border border-green-500/30 transition"
                        >
                          Upgrade
                        </button>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span>
                        Usage: <span className={userInfo.usage_count >= userInfo.max_usage ? "text-red-400" : "text-zinc-300"}>
                          {userInfo.usage_count}
                        </span> / {userInfo.max_usage} requests
                      </span>
                      {userInfo.subscription_plan !== 'free' && (
                        <span className="text-[10px] text-zinc-500">
                          (Plan: {userInfo.subscription_plan})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <button 
                        onClick={() => { setApiKey(""); localStorage.removeItem("ps_api_key"); }}
                        className="text-[10px] text-zinc-500 hover:text-white underline"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:bg-zinc-200"
                    >
                      Login / Signup
                    </button>
                    {!apiKey && (
                      <input
                        className="w-full sm:w-56 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Or enter API Key manually"
                        type="password"
                      />
                    )}
                  </div>
                )}
              </div>
              
              {/* Controls only visible in Playground */}
              {activeTab === 'playground' && (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <input
                    className="w-full sm:w-48 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                    value={providerKey}
                    onChange={(e) => setProviderKey(e.target.value)}
                    placeholder="LLM Provider Key (Optional)"
                    type="password"
                  />
                  <select
                    aria-label="Select LLM Provider"
                    className="w-full sm:w-auto rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm outline-none"
                    value={provider}
                    onChange={(e) => {
                      const newProvider = e.target.value;
                      setProvider(newProvider);
                      if (newProvider === "openai") setModel("gpt-4");
                      if (newProvider === "anthropic") setModel("claude-3-5-sonnet-20240620");
                      if (newProvider === "gemini") setModel("gemini-1.5-flash");
                    }}
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="gemini">Gemini</option>
                  </select>
                  <input
                    className="w-full sm:w-36 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm outline-none"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Model"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 rounded-xl bg-zinc-900/50 p-1 border border-zinc-800 w-full sm:w-fit overflow-x-auto no-scrollbar">
            {(['playground', 'visualizer', 'analytics', 'code', 'api'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  min-w-[100px] sm:w-32 flex-shrink-0 rounded-lg py-2.5 text-sm font-medium leading-5
                  transition duration-200 ease-in-out
                  ${activeTab === tab
                    ? 'bg-zinc-800 text-white shadow'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </header>

        <main className="flex-1">
          {activeTab === 'playground' && (
            <div className="flex flex-1 flex-col gap-6 lg:flex-row animate-in fade-in duration-500">
              <section className="flex flex-1 flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-zinc-300">Raw Prompt</h2>
                  <span className="text-xs text-zinc-500">
                    Max 300 words per request.
                  </span>
                </div>
                <textarea
                  className="min-h-[220px] flex-1 resize-none rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-sm outline-none focus:border-zinc-500"
                  placeholder="Paste or type your raw prompt here..."
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-1 gap-3 sm:gap-2">
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleExecute}
                      disabled={loading || !rawInput.trim()}
                      className="w-full sm:w-auto rounded-full bg-zinc-100 px-5 py-2 text-sm font-medium text-black transition hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-600 text-center justify-center"
                    >
                      {loading ? "Running..." : "Run Execute Pipeline"}
                    </button>
                    <button
                      type="button"
                      onClick={handleOptimize}
                      disabled={loading || !rawInput.trim()}
                      className="w-full sm:w-auto rounded-full border border-zinc-700 bg-transparent px-5 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 text-center justify-center"
                    >
                      Optimize Only
                    </button>
                  </div>
                  {error && (
                    <span className="text-xs text-red-400">
                      {error}
                    </span>
                  )}
                </div>
                
                <div className="mt-2 rounded-xl border border-blue-500/10 bg-blue-500/5 p-3 text-xs text-blue-200/80">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                      <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/>
                    </svg>
                    <div className="space-y-1">
                      <p><span className="font-medium text-blue-200">New:</span> Use <code className="bg-blue-500/20 px-1 rounded text-blue-100">{"{{ text }}"}</code> to opt-out specific sentences from compression.</p>
                      <p>Critical constraints (e.g., "must", "no", "never") are now automatically preserved.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="flex flex-1 flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-zinc-300">
                    Compressed Prompt (CSC)
                  </h2>
                  {data && (
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs justify-end">
                      {data.confidence_score !== undefined && (
                        <span 
                          className={`rounded-full px-3 py-1 border ${
                            data.confidence_score >= 0.9 
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-300" 
                            : data.confidence_score >= 0.7 
                              ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-300"
                              : "border-red-500/40 bg-red-500/10 text-red-300"
                          }`}
                          title="Semantic Safety Confidence Score"
                        >
                          {(data.confidence_score * 100).toFixed(0)}% Safe
                        </span>
                      )}
                      <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-300">
                        {savingsPercent}% tokens saved
                      </span>
                      <span className="text-zinc-400">
                        {data.tokens.raw_tokens} → {data.tokens.compressed_tokens} tokens
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-h-[120px] rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-zinc-200">
                  {data ? data.compressed_text : "Compression output will appear here."}
                </div>
                {data && data.suggestions && data.suggestions.length > 0 && (
                  <Suggestions suggestions={data.suggestions} />
                )}
                <div>
                  <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                    LLM Output
                  </h3>
                  <div className="min-h-[120px] rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-zinc-200">
                    {data ? data.output : "LLM output will appear here."}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'visualizer' && (
            <div className="animate-in fade-in duration-500">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 min-h-[400px]">
                <h2 className="text-lg font-medium text-zinc-200 mb-6">Semantic Analysis Visualization</h2>
                {!data ? (
                  <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                    <p>No execution data available.</p>
                    <p className="text-sm mt-2">Run a prompt in the Playground first.</p>
                    <button
                      onClick={() => setActiveTab('playground')}
                      className="mt-4 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition"
                    >
                      Go to Playground
                    </button>
                  </div>
                ) : (
                  <Visualizer analysis={data.analysis} />
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="animate-in fade-in duration-500">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-zinc-200">Token Savings Analytics</h2>
                  <button
                    onClick={fetchHistory}
                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 transition"
                    title="Refresh Data"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 16h5v5" />
                    </svg>
                  </button>
                </div>

                {historyError ? (
                  <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                    <p className="text-red-400 mb-2">{historyError}</p>
                    <button 
                      onClick={fetchHistory}
                      className="px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition"
                    >
                      Retry
                    </button>
                  </div>
                ) : loadingHistory && historyLogs.length === 0 ? (
                  <div className="flex justify-center items-center h-64 text-zinc-500">
                    Loading analytics data...
                  </div>
                ) : (
                  <Analytics logs={historyLogs} />
                )}
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="animate-in fade-in duration-500">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 min-h-[400px]">
                <h2 className="text-lg font-medium text-zinc-200 mb-6">Integration Snippets</h2>
                <div className="mb-6">
                  <p className="text-sm text-zinc-400 mb-2">
                    Use these snippets to integrate PromptShield optimization directly into your application.
                  </p>
                </div>
                <CodeSnippets rawText={rawInput || "Your prompt here"} provider={provider} model={model} />
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* API Key Management */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 h-fit">
                  <h2 className="text-lg font-medium text-zinc-200 mb-4">API Management</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-zinc-500 uppercase font-medium tracking-wide">Your API Key</label>
                      <div className="mt-1 flex gap-2">
                        <div className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 font-mono break-all">
                          {apiKey || "Not logged in"}
                        </div>
                        <button 
                           onClick={() => {navigator.clipboard.writeText(apiKey); alert("Copied!")}}
                           className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition"
                           title="Copy Key"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2-2v1"/></svg>
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800">
                      <h3 className="text-sm font-medium text-zinc-300 mb-2">Security</h3>
                      <p className="text-xs text-zinc-500 mb-4">
                        If your key is compromised, you can rotate it immediately. This will invalidate the old key.
                      </p>
                      <button
                        onClick={handleRotateKey}
                        disabled={!apiKey}
                        className="w-full rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Rotate API Key
                      </button>
                    </div>
                  </div>
                </div>

                {/* API Usage Stats */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 h-fit">
                  <h2 className="text-lg font-medium text-zinc-200 mb-4">Usage Summary</h2>
                  
                  {apiStats ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800">
                        <div className="text-xs text-zinc-500 uppercase">Total Requests</div>
                        <div className="text-2xl font-semibold text-white mt-1">{apiStats.total_requests}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800">
                        <div className="text-xs text-zinc-500 uppercase">Tokens Saved</div>
                        <div className="text-2xl font-semibold text-emerald-400 mt-1">{apiStats.total_tokens_saved}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800">
                        <div className="text-xs text-zinc-500 uppercase">Avg. Savings</div>
                        <div className="text-2xl font-semibold text-blue-400 mt-1">{apiStats.average_savings_percentage}%</div>
                      </div>
                      <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800">
                        <div className="text-xs text-zinc-500 uppercase">Avg. Latency</div>
                        <div className="text-2xl font-semibold text-zinc-300 mt-1">{apiStats.average_latency_ms}ms</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-zinc-500 text-sm">
                      {apiKey ? "Loading stats..." : "Login to view stats"}
                    </div>
                  )}
                </div>

                {/* API Usage Chart */}
                <div className="md:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 h-[400px]">
                  <h2 className="text-lg font-medium text-zinc-200 mb-6">Request Volume (Last 7 Days)</h2>
                  {apiTimeSeries.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={apiTimeSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#e4e4e7' }}
                          itemStyle={{ color: '#e4e4e7' }}
                          cursor={{ fill: '#27272a', opacity: 0.5 }}
                        />
                        <Bar dataKey="requests" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Requests" />
                        <Bar dataKey="savings" fill="#10b981" radius={[4, 4, 0, 0]} name="Tokens Saved" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                     <div className="flex justify-center items-center h-full text-zinc-500 text-sm">
                       {apiKey ? "No data available for the last 7 days." : "Login to view chart"}
                     </div>
                  )}
                </div>

              </div>
            </div>
          )}

          
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)} 
            onSuccess={(key) => {
              setApiKey(key);
              setShowAuthModal(false);
            }}
            apiBase={API_BASE}
          />

          <ChangePasswordModal
            isOpen={showChangePwdModal}
            onClose={() => setShowChangePwdModal(false)}
            apiBase={API_BASE}
            apiKey={apiKey}
          />

          <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        apiBase={API_BASE}
        apiKey={apiKey}
        onSuccess={(newKey) => {
          if (newKey) {
            setApiKey(newKey);
            // Refresh user info
            fetch(`${API_BASE}/api/v1/auth/me`, {
              headers: { "X-API-Key": newKey }
            })
            .then(res => res.ok ? res.json() : null)
            .then(data => setUserInfo(data));
          }
        }}
      />
        </main>
      </div>
    </div>
  );
}