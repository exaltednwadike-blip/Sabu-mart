import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/careers")({
  component: CareersPage,
});

function CareersPage() {
  return (
    <InfoPage
      eyebrow="Careers"
      title="Join the SABU team"
      description="We are building a marketplace that is useful, trustworthy, and useful for everyday life. We value people who care about product quality, customer trust, and great execution."
      items={[
        {
          title: "Build the next generation of local commerce",
          body: "We work across design, product, seller operations, trust and safety, customer support, and growth to shape the marketplace experience.",
        },
        {
          title: "Work with real problems",
          body: "From onboarding sellers to improving trust signals and catalog quality, the work is practical and direct.",
        },
        {
          title: "How to apply",
          body: "Send us a message via the contact page and include your background, role interest, and why you want to build in this space.",
        },
      ]}
    />
  );
}
