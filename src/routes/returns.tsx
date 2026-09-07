import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/returns")({
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Returns"
      description="Return and refund policy varies by product type and seller agreement. The fastest route is to raise the issue through the order details page."
      items={[
        {
          title: "Report a problem",
          body: "Start from the order details page and provide details about the item, condition, and what is wrong."
        },
        {
          title: "Seller communication",
          body: "The seller is expected to respond and resolve delivery, product mismatch, or quality issues in a reasonable timeline."
        },
        {
          title: "Escalation",
          body: "If the issue remains unresolved, contact SABU support with the order reference and proof of the problem so it can be reviewed."
        },
      ]}
    />
  );
}
