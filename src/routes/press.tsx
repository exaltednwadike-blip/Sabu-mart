import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/press")({
  component: PressPage,
});

function PressPage() {
  return (
    <InfoPage
      eyebrow="Press"
      title="Press & media"
      description="SABU is building a modern marketplace for local discovery, transactions, and services across communities that need convenient, trusted commerce."
      items={[
        {
          title: "Media inquiries",
          body: "For press requests, interviews, or partnership conversations, use the contact page and include your publication, deadlines, and the topic you want to discuss.",
        },
        {
          title: "What we are building",
          body: "SABU connects sellers, buyers, property listings, and services in one place with clear product experiences and trust-focused operations.",
        },
        {
          title: "Brand positioning",
          body: "Our focus is on local discovery, direct seller communication, and practical commerce that feels fast, transparent, and useful.",
        },
      ]}
    />
  );
}
