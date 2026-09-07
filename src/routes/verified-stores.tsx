import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/verified-stores")({
  component: VerifiedStoresPage,
});

function VerifiedStoresPage() {
  return (
    <InfoPage
      eyebrow="Marketplace"
      title="Verified stores"
      description="Verified stores help buyers identify sellers who have passed the required profile, identity, and trust checks for marketplace participation."
      items={[
        {
          title: "What verification covers",
          body: "Verification helps confirm identity, business details, and account quality. It is one trust signal buyers can use before engaging with a seller."
        },
        {
          title: "How it helps buyers",
          body: "It gives buyers more confidence that they are dealing with a legitimate seller profile and that the store is being managed in line with SABU standards."
        },
        {
          title: "How to become verified",
          body: "Complete the seller onboarding process and submit the required identity and business information. Approval depends on the required checks being completed."
        },
      ]}
    />
  );
}
