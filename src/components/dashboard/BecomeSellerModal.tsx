import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Store } from "lucide-react";
import { becomeSeller, getCurrentUser } from "@/lib/auth";

interface BecomeSellerModalProps {
  open: boolean;
  onClose: () => void;
}

export function BecomeSellerModal({ open, onClose }: BecomeSellerModalProps) {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (storeName.trim().length < 2) {
      setError("Store name must be at least 2 characters.");
      return;
    }

    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        navigate({ to: "/login" });
        return;
      }
      await becomeSeller(user.id, storeName.trim());
      navigate({ to: "/seller" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elegant">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">Open your store</h2>
              <p className="text-xs text-muted-foreground">Start selling on SABU in seconds.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Store name</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. TechPro Store"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl gradient-brand py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Setting up your store..." : "Create store"}
          </button>
        </form>
      </div>
    </div>
  );
}