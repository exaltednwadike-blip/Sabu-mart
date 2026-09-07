import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/sustainability")({
  component: SustainabilityPage,
});

function SustainabilityPage() {
  return (
    <InfoPage
      eyebrow="Company"
      title="Sustainability"
      description="We are building a marketplace that supports local economies, cleaner trade patterns, and better resource use through direct commerce and responsible seller standards."
      items={[
        {
          title: "Local-first commerce",
          body: "By connecting buyers and sellers in the same communities, SABU reduces unnecessary friction and supports local economic activity."
        },
        {
          title: "Responsible marketplace operations",
          body: "We encourage accurate listings, honest communications, and the right product fit so buyers and sellers can transact with less waste and fewer misunderstandings."
        },
        {
          title: "Long-term focus",
          body: "As the platform grows, we will continue to improve trust, quality standards, and support resources for responsible marketplace behavior."
        },
      ]}
    />
  );
}
