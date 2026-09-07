import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/track-order")({
  component: TrackOrderPage,
});

function TrackOrderPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Track your order"
      description="Monitor the status of your current order from checkout through delivery and confirmation."
      items={[
        {
          title: "Where to look",
          body: "Use your buyer dashboard to check the current order status, seller updates, and communication history for each purchase."
        },
        {
          title: "What status means",
          body: "Processing means the seller has accepted the order, shipped means the item is on the way, and delivered means the buyer can confirm completion."
        },
        {
          title: "Need help?",
          body: "If an order is delayed or incorrect, open the order details and contact the seller through the platform or raise support for help."
        },
      ]}
    />
  );
}
