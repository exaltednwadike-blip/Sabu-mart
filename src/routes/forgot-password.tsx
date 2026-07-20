import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MailCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { requestPasswordReset } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    requestPasswordReset(email)
      .then(function () {
        setSent(true);
      })
      .catch(function (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      })
      .finally(function () {
        setLoading(false);
      });
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-elegant">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists for <span className="font-medium text-foreground">{email}</span>, we've sent a link to reset your password.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block w-full rounded-xl gradient-brand py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            Back to sign in
          </Link>
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

        <h1 className="mt-6 text-center font-display text-2xl font-bold">Reset your password</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <div className="flex items-center rounded-xl border border-border bg-background px-3 focus-within:border-primary">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={function (e) { setEmail(e.target.value); }}
                placeholder="you@example.com"
                className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
              />
            </div>
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
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
