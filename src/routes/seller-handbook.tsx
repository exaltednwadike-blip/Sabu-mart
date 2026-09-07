import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/seller-handbook")({
  component: SellerHandbookPage,
});

function SellerHandbookPage() {
  return (
    <InfoPage
      eyebrow="Marketplace guides"
      title="Seller handbook"
      description="Everything a seller should know before listing, communicating, and fulfilling orders on SABU."
      items={[
        {
          title: "1. Verification and profile setup",
          body: "Before selling, complete your business details and identity verification. SABU may require valid ID or other information to approve your seller account."
        },
        {
          title: "2. Listing quality",
          body: "Use clear images, an honest title, a correct category, and a realistic price. Listings that are misleading, duplicated, or inaccurate may be removed."
        },
        {
          title: "3. Shipping and fulfillment",
          body: "Update order status promptly, keep buyer communication clear, and set realistic delivery expectations. Buyers rely on timely updates to trust your store."
        },
        {
          title: "4. Customer support",
          body: "Respond to questions quickly, keep communication respectful, and resolve issues professionally. Good service helps you maintain trust and repeat buyers."
        },
        {
          title: "5. Payments and account status",
          body: "Payments follow platform policy and order confirmation rules. Your account status may be reviewed if there are repeated complaints, policy breaches, or missing fulfillment actions."
        },
        {
          title: "6. Platform rules",
          body: "Do not list prohibited or unsafe items, mislead buyers with fake scarcity, or use copied content. Policy violations can lead to listing removal or account restrictions."
        },
      ]}
    />
  );
}
