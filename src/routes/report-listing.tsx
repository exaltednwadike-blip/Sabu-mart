import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/report-listing")({
  component: ReportListingPage,
});

function ReportListingPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Report a listing"
      description="If you see a listing that looks misleading, unsafe, fraudulent, or against our rules, please report it so the team can assess it."
      items={[
        {
          title: "What to include",
          body: "Include the product link, why you believe it is problematic, and any supporting evidence such as suspicious pricing, duplicate listings, or false details."
        },
        {
          title: "What happens next",
          body: "The team reviews the listing against our marketplace rules and may remove, restrict, or request clarification before reactivation."
        },
        {
          title: "When to contact support directly",
          body: "If the issue involves fraud, threatened safety, or serious account misconduct, send a message to support with as much context as possible."
        },
      ]}
    />
  );
}
