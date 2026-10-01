import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, MailCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { signUp, signInWithGoogle } from "@/lib/auth";
import { verifyEmailDomain } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const Route = createFileRoute("/signup")({
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!passwordValid) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    verifyEmailDomain({ data: email.trim() })
      .then(function (result) {
        if (!result.valid) {
          throw new Error(result.reason);
        }
        return signUp(email, password, fullName);
      })
      .then(function (data) {
        if (data.session) {
          supabase.from("notifications").insert({
            user_id: data.user?.id,
            type: "system",
            title: "Add SABU to your home screen",
            message: "Open the browser menu and tap 'Add to Home screen' for quicker access.",
            read: false,
          }).then(function () {});
          navigate({ to: "/buyer" });
        } else {
          setCheckEmail(true);
        }
      })
      .catch(function (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      })
      .finally(function () {
        setLoading(false);
      });
  }

  function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    signInWithGoogle().catch(function (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed. Try again.");
      setGoogleLoading(false);
    });
  }

  if (checkEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-elegant">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Click it to activate your account, then sign in.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block w-full rounded-xl gradient-brand py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elegant">
        <div className="flex justify-center">
          <Logo />
        </div>

        <h1 className="mt-6 text-center font-display text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Join SABU and start shopping. You can open your own store anytime.
        </p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-sm font-medium shadow-soft transition hover:bg-accent disabled:opacity-60"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or sign up with email</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Full name</label>
            <div className="flex items-center rounded-xl border border-border bg-background px-3 focus-within:border-primary">
              <User className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                required
                value={fullName}
                onChange={function (e) { setFullName(e.target.value); }}
                placeholder="Chinelo Adeyemi"
                className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

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

          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
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
            <label className="mb-1.5 block text-sm font-medium">Confirm password</label>
            <div className="flex items-center rounded-xl border border-border bg-background px-3 focus-within:border-primary">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={function (e) { setConfirmPassword(e.target.value); }}
                placeholder="Re-enter your password"
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
