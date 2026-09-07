import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/advertise")({
  component: AdvertisePage,
});

function AdvertisePage() {
  return (
    <InfoPage
      eyebrow="Marketplace"
      title="Advertise with SABU"
      description="Reach shoppers and sellers through targeted marketplace placements, promotional campaigns, and category-driven discovery."
      items={[
        {
          title: "Who this is for",
          body: "This is for brands, sellers, and partners who want more visibility in front of active local buyers and marketplace users."
        },
        {
          title: "Why it matters",
          body: "Discovery on SABU is built around product relevance, trust, and local buying intent. Advertising can help increase visibility when placed intentionally."
        },
        {
          title: "Next step",
          body: "Contact the SABU team with your goals, audience, and budget so we can discuss campaign options and placement opportunities."
        },
      ]}
    />
  );
}
