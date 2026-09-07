import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/short-lets")({
  component: ShortLetsPage,
});

function ShortLetsPage() {
  return (
    <InfoPage
      eyebrow="Accommodation"
      title="Short lets"
      description="Short lets are ideal for travelers and temporary stays that need a more flexible, local, and direct booking experience."
      items={[
        {
          title: "What buyers need",
          body: "Location, room configuration, check-in details, pricing, and what is included should be very clear before booking."
        },
        {
          title: "What hosts should provide",
          body: "An accurate listing, responsive communication, and fair expectations help trust build quickly for short stays."
        },
        {
          title: "Booking safety",
          body: "Use platform communication, confirm terms before payment, and set expectations clearly so both sides feel protected."
        },
      ]}
    />
  );
}
