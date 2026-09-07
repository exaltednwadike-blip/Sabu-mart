import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Contact SABU"
      description="Need help with an order, a listing, a seller question, or a partnership request? Send your message and we will route it to the right team."
      items={[
        {
          title: "Orders and buyers",
          body: "Use the buyer dashboard or the order details page to reach out to a seller or raise a support issue related to delivery or product concerns.",
        },
        {
          title: "Seller support",
          body: "Use the seller dashboard to review your product listings, order communication, and account settings. For account-specific issues, contact support with your business name and seller email."
        },
        {
          title: "General inquiries",
          body: "Email us at hello@sabu.market or use the support channels in the app. Include a clear subject line and a short description so the appropriate team can assist quickly."
        },
      ]}
    />
  );
}
