import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/bulk-orders")({
  component: BulkOrdersPage,
});

function BulkOrdersPage() {
  return (
    <InfoPage
      eyebrow="Marketplace"
      title="Bulk orders"
      description="Bulk order requests are useful for businesses, resellers, and repeat buyers looking for larger volumes from sellers on SABU."
      items={[
        {
          title: "For buyers",
          body: "Bulk buyers can reach out to sellers with more detailed questions about volumes, pricing, and delivery timelines."
        },
        {
          title: "For sellers",
          body: "Sellers can use bulk order requests to evaluate repeat demand, negotiate terms, and prepare for larger orders from serious buyers."
        },
        {
          title: "Best practice",
          body: "Keep your pricing and fulfillment terms clear so both sides know what is included before a large order is placed."
        },
      ]}
    />
  );
}
