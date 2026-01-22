import { useState } from "react";
import { X, Check, QrCode, Zap, CreditCard, Award } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  apiKey: string;
  onSuccess: (newApiKey: string | null) => void;
}

export function SubscriptionModal({ isOpen, onClose, apiBase, apiKey, onSuccess }: SubscriptionModalProps) {
  const [step, setStep] = useState<'select' | 'pay' | 'confirm' | 'pending'>('select');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'topup' | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<{qr_code_base64: string, amount: number, upi_url: string, upi_id?: string, payment_id?: number} | null>(null);
  const [utr, setUtr] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const plans: {
    id: 'monthly' | 'yearly';
    name: string;
    price: string;
    period: string;
    features: string[];
    icon: any;
    recommended: boolean;
  }[] = [
    {
      id: 'monthly',
      name: 'Pro Monthly',
      price: '₹99',
      period: '/ month',
      features: ['1,000 Requests', 'Priority Support', 'Advanced Analytics'],
      icon: Zap,
      recommended: false
    },
    {
      id: 'yearly',
      name: 'Pro Yearly',
      price: '₹999',
      period: '/ year',
      features: ['14,400 Requests', 'Priority Support', 'Advanced Analytics', 'Save ₹200/year'],
      icon: Award,
      recommended: true
    }
  ];

  async function handleSelectPlan(planId: 'monthly' | 'yearly' | 'topup') {
    setSelectedPlan(planId);
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${apiBase}/api/v1/payment/create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-API-Key": apiKey
        },
        body: JSON.stringify({ plan: planId }),
      });

      if (!res.ok) throw new Error("Failed to create payment order");
      
      const data = await res.json();
      setPaymentData(data);
      setStep('pay');
    } catch (err) {
      setError("Failed to initialize payment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePaymentConfirm() {
    if (!utr.trim()) {
      setError("Please enter the Transaction ID / UTR Number");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${apiBase}/api/v1/payment/confirm`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-API-Key": apiKey
        },
        body: JSON.stringify({ 
          plan: selectedPlan, 
          utr: utr,
          payment_id: paymentData?.payment_id 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Payment verification failed");
      
      if (data.status === 'pending_verification') {
        onSuccess(null);
        setPaymentData(null);
        setStep('pending');
      } else {
        onSuccess(data.new_api_key);
        setPaymentData(null);
        setStep('confirm');
      }
    } catch (err: any) {
      setError(err.message || "Payment verification failed. If you paid, please contact support.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:p-6 shadow-2xl relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {step === 'select' ? "Upgrade Your Plan" : step === 'pay' ? "Complete Payment" : "Payment Successful"}
              </h2>
              {step === 'select' && <p className="text-zinc-400 text-sm mt-1">Choose the plan that fits your needs.</p>}
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition" aria-label="Close modal">
              <X size={24} />
            </button>
          </div>

          {step === 'select' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`relative rounded-xl border p-4 md:p-6 flex flex-col transition hover:border-zinc-500 ${
                    plan.recommended ? "border-blue-500/50 bg-blue-500/5" : "border-zinc-700 bg-zinc-950"
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      Recommended
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${plan.recommended ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800 text-zinc-400"}`}>
                      <plan.icon size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                  </div>
                  
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-zinc-400 ml-1">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center text-sm text-zinc-300">
                        <Check size={16} className="text-green-400 mr-2 flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading}
                    className={`w-full rounded-lg py-3 text-sm font-semibold transition disabled:opacity-50 ${
                      plan.recommended 
                        ? "bg-blue-600 text-white hover:bg-blue-500" 
                        : "bg-white text-black hover:bg-zinc-200"
                    }`}
                  >
                    {loading ? "Processing..." : `Select ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>

            {/* Top-up Section */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Need more credits?</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Top up your account instantly. Adds to your existing plan.
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-orange-200">
                    <span className="font-bold">₹19</span>
                    <span className="text-zinc-500">•</span>
                    <span>200 Requests</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleSelectPlan('topup')}
                disabled={loading}
                className="w-full md:w-auto px-6 py-3 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 font-medium hover:bg-orange-500/20 transition whitespace-nowrap"
              >
                Top Up Now
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-zinc-500">
                * Usage is calculated in Requests. 1 Request allows up to 300 words.
              </p>
            </div>
          </div>
        )}

        {step === 'pay' && paymentData && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white p-4 rounded-2xl shadow-lg mb-6">
              <div className="mb-4 text-center border-b border-zinc-200 pb-2">
                 <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Plan Summary</p>
                 <p className="text-lg font-bold text-zinc-800 capitalize">
                    {selectedPlan === 'topup' ? 'Top-Up Credits' : selectedPlan + ' Plan'}
                 </p>
              </div>
              <img 
                src={`data:image/png;base64,${paymentData.qr_code_base64}`} 
                alt="Payment QR Code" 
                className="w-56 h-56 mx-auto"
              />
            </div>
            
            <div className="text-center mb-8">
              <p className="text-zinc-400 mb-2">Scan with any UPI app to pay</p>
              <div className="flex flex-col items-center gap-1 mb-2">
                 <div className="text-3xl font-bold text-white">₹{paymentData.amount}</div>
                 {paymentData.upi_id && (
                    <div className="text-xs text-zinc-500 bg-zinc-800/50 px-3 py-1 rounded-full font-mono">
                      UPI ID: {paymentData.upi_id}
                    </div>
                 )}
              </div>
            </div>

            <div className="w-full max-w-md space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 text-center">
                  Verification
                </label>
                <input
                  type="text"
                  placeholder="Enter 12-digit UTR"
                  maxLength={12}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-center placeholder:text-zinc-600 font-mono tracking-widest"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                />
                <p className="text-[10px] text-zinc-600 text-center mt-2">
                  Usually a 12-digit number found in your payment app details.
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-400 text-center border border-red-500/20">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 rounded-xl border border-zinc-700 bg-transparent py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                >
                  Back
                </button>
                <button
                  onClick={handlePaymentConfirm}
                  disabled={loading || utr.length !== 12}
                  className="flex-[2] rounded-xl bg-green-600 py-3 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50 transition shadow-lg shadow-green-900/20"
                >
                  {loading ? "Verifying..." : "Verify Payment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="flex flex-col items-center py-10 animate-in zoom-in duration-300">
            <div className="rounded-full bg-green-500/10 p-6 mb-6 ring-1 ring-green-500/20">
              <Check size={64} className="text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">Payment Successful!</h3>
            <p className="text-zinc-400 text-center max-w-sm mb-8">
              {selectedPlan === 'topup' 
                ? "200 credits have been added to your account." 
                : "You have been upgraded to the Premium Plan. A confirmation email with your new API Key has been sent."}
            </p>
            
            <button
              onClick={onClose}
              className="w-full max-w-sm rounded-xl bg-white py-3.5 text-sm font-semibold text-black hover:bg-zinc-200 transition"
            >
              Done
            </button>
          </div>
        )}

        {step === 'pending' && (
          <div className="flex flex-col items-center py-10 animate-in zoom-in duration-300">
            <div className="rounded-full bg-yellow-500/10 p-6 mb-6 ring-1 ring-yellow-500/20">
              <Check size={64} className="text-yellow-500" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">Verification Pending</h3>
            <p className="text-zinc-400 text-center max-w-sm mb-8">
              Your payment UTR has been submitted. We are verifying the transaction with our bank.
              <br/><br/>
              This usually takes up to 24 hours. You will be notified via email once approved.
            </p>
            
            <button
              onClick={onClose}
              className="w-full max-w-sm rounded-xl bg-white py-3.5 text-sm font-semibold text-black hover:bg-zinc-200 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
