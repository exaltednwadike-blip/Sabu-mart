import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getCurrentUser, getProfile } from "@/lib/auth";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleRedirect() {
      const user = await getCurrentUser();
      if (!user) {
        navigate({ to: "/login" });
        return;
      }
      try {
        const profile = await getProfile(user.id);
        navigate({ to: profile.is_seller ? "/seller" : "/buyer" });
      } catch {
        navigate({ to: "/buyer" });
      }
    }
    handleRedirect();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Signing you in...</p>
    </div>
  );
}