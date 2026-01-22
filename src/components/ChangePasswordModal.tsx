import { useState } from "react";
import { X } from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  apiKey: string;
}

export function ChangePasswordModal({ isOpen, onClose, apiBase, apiKey }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (newPassword !== confirmPassword) {
        setError("New passwords do not match");
        return;
    }

    if (newPassword.length < 8) {
        setError("New password must be at least 8 characters");
        return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/api/v1/auth/change-password`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "X-API-Key": apiKey
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to change password");
      }

      setSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Close after a short delay
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Change Password
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">Current Password</label>
            <input
              type="password"
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-white outline-none focus:border-blue-500"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">New Password</label>
            <input
              type="password"
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-white outline-none focus:border-blue-500"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">Confirm New Password</label>
            <input
              type="password"
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-white outline-none focus:border-blue-500"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white py-2.5 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
