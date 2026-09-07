import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy policy"
      description="We respect your data and only use it to support your account, transactions, notifications, and the marketplace experience."
      items={[
        {
          title: "What we collect",
          body: "We may collect account information, contact details, delivery information, product data, and verification information necessary to provide the marketplace service.",
        },
        {
          title: "How we use it",
          body: "Data is used to create and manage your account, process orders, deliver communications, support verification, and improve product quality and security.",
        },
        {
          title: "Your control",
          body: "You can update profile information, manage notifications, and request account data deletion through the account settings area where supported.",
        },
      ]}
    />
  );
}
