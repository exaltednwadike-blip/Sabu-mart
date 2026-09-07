import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  return (
    <InfoPage
      eyebrow="Account"
      title="Verify your email"
      description="Your account needs a verified email address to receive important messages, seller updates, and marketplace notifications."
      items={[
        {
          title: "Check your inbox",
          body: "If you signed up recently, look for a verification email from SABU and follow the instructions in the message."
        },
        {
          title: "Need a new link?",
          body: "You can request another verification email from your account settings or sign in again to trigger the authentication flow."
        },
        {
          title: "Still need help?",
          body: "Contact support with your account email and the issue you are facing so the team can assist quickly."
        },
      ]}
    />
  );
}
