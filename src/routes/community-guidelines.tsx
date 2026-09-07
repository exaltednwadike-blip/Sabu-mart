import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/community-guidelines")({
  component: CommunityGuidelinesPage,
});

function CommunityGuidelinesPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Community guidelines"
      description="SABU is built on respect, honesty, and good community behavior. Buyers and sellers are expected to behave professionally and ethically."
      items={[
        {
          title: "Be honest",
          body: "Use truthful product details, accurate pricing, and fair communication. Misleading listings damage trust and hurt the marketplace."
        },
        {
          title: "Respect others",
          body: "Treat buyers, sellers, and support staff professionally. Harassment, abuse, and intimidation are not allowed."
        },
        {
          title: "Protect the marketplace",
          body: "Avoid fake listings, spam, duplicate accounts, or attempts to manipulate trust metrics, order flow, or customer interactions."
        },
      ]}
    />
  );
}
