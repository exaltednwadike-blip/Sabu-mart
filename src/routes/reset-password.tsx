import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { updatePassword } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!passwordValid) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    updatePassword(password)
      .then(function () {
        setDone(true);
        setTimeout(function () {
          navigate({ to: "/login" });
        }, 2500);
      })
      .catch(function (err) {
        setError(err instanceof Error ? err.message : "This reset link may have expired. Request a new one.");
      })
      .finally(function () {
        setLoading(false);
      });
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-elegant">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold">Password updated</h1>
          <p className="mt-2 text-sm text-muted-foreground">Redirecting you to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elegant">
        <div className="flex justify-center">
          <Logo />
        </div>

        <h1 className="mt-6 text-center font-display text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">New password</label>
            <div className="flex items-center rounded-xl border border-border bg-background px-3 focus-within:border-primary">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={function (e) { setPassword(e.target.value); }}
                placeholder="At least 8 characters"
                className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
              />
              <button
                type="button"
                onClick={function () { setShowPassword(!showPassword); }}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password.length > 0 && !passwordValid ? (
              <p className="mt-1 text-xs text-destructive">Password must be at least 8 characters.</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Confirm new password</label>
            <div className="flex items-center rounded-xl border border-border bg-background px-3 focus-within:border-primary">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={function (e) { setConfirmPassword(e.target.value); }}
                placeholder="Re-enter new password"
                className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
              />
            </div>
            {confirmPassword.length > 0 && !passwordsMatch ? (
              <p className="mt-1 text-xs text-destructive">Passwords do not match.</p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl gradient-brand py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
