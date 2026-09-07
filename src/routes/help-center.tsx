import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/help-center")({
  component: HelpCenterPage,
});

function HelpCenterPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Help center"
      description="Start here for the most common buying, selling, and account questions on SABU."
      items={[
        {
          title: "How do I buy safely?",
          body: "Browse verified listings, review seller details, and communicate through the platform before completing a purchase."
        },
        {
          title: "How do I list an item?",
          body: "Complete seller verification, upload your product details, and publish your listing once your profile is approved."
        },
        {
          title: "What if an order is delayed or wrong?",
          body: "Use the order support flow and contact the seller through the marketplace. If needed, escalate to SABU support with a clear summary of the issue."
        },
      ]}
    />
  );
}
