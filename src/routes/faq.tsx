import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
});

function FaqPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="FAQ"
      description="Questions buyers and sellers ask most often about how SABU works."
      items={[
        {
          title: "Do I need a seller account to buy?",
          body: "No. Buyers can browse, save products, and purchase without selling.",
        },
        {
          title: "How do I become a seller?",
          body: "Create an account, complete the seller application, and submit the required verification documents.",
        },
        {
          title: "How do I report a listing?",
          body: "Use the report action on the listing or contact support with the listing URL and the reason for the report."
        },
      ]}
    />
  );
}
