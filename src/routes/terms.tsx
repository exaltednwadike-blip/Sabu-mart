import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms of use"
      description="These terms govern how buyers, sellers, and visitors use the SABU marketplace. By using the platform, you agree to comply with our rules and community standards."
      items={[
        {
          title: "Marketplace use",
          body: "Users must provide accurate account information, respect the platform policies, and avoid creating misleading or harmful listings.",
        },
        {
          title: "Seller responsibilities",
          body: "Sellers are responsible for truthful product descriptions, fulfillment accuracy, and communication with buyers throughout the sales process."
        },
        {
          title: "Buyer responsibilities",
          body: "Buyers should act honestly, use the platform communication channels, and follow dispute or support processes when issues arise."
        },
      ]}
    />
  );
}
