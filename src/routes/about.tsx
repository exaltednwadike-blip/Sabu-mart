import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="About SABU"
      description="SABU helps people discover goods, services, rentals, and local opportunities in a trusted marketplace built for African communities."
      items={[
        {
          title: "Built around trust",
          body: "We create a simpler way for buyers and sellers to connect without friction, while keeping communication, payment flow, and fulfillment transparent.",
        },
        {
          title: "A marketplace for everyday needs",
          body: "From phones and fashion to rentals and local services, SABU is designed to make discovery fast, local, and practical.",
        },
        {
          title: "Made for real communities",
          body: "We focus on local buying, honest listings, and use cases that matter to people buying and selling every day across the region.",
        },
      ]}
    />
  );
}
