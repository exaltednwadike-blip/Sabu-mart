import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/refund-policy")({
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Refund policy"
      description="Refund eligibility depends on the order type, product condition, and whether the issue is covered under platform policy or seller agreement."
      items={[
        {
          title: "When a refund may be due",
          body: "Refunds may be considered for item mismatch, non-delivery, product quality issues, or other verified transaction problems."
        },
        {
          title: "How to request one",
          body: "Start from the order or listing support flow and provide direct evidence about the issue before a refund decision is reached."
        },
        {
          title: "Review process",
          body: "The platform may review the seller response, order details, and documentation before issuing a final decision."
        },
      ]}
    />
  );
}
