import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/hotels")({
  component: HotelsPage,
});

function HotelsPage() {
  return (
    <InfoPage
      eyebrow="Accommodation"
      title="Hotels"
      description="Hotels can showcase availability, amenities, room details, and booking information in a trusted marketplace format."
      items={[
        {
          title: "For property owners",
          body: "List local stay options with accurate photos, room details, pricing, facilities, and check-in information."
        },
        {
          title: "For travelers",
          body: "Quickly compare stays, room types, and service quality in a clear, direct discovery format."
        },
        {
          title: "Trust and clarity",
          body: "Accurate details and responsive communication help travelers feel confident before booking."
        },
      ]}
    />
  );
}
