import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/investors")({
  component: InvestorsPage,
});

function InvestorsPage() {
  return (
    <InfoPage
      eyebrow="Company"
      title="Investors"
      description="SABU is building a modern marketplace focused on trust, local discovery, and direct commerce in underserved but high-demand communities."
      items={[
        {
          title: "Mission",
          body: "We are building a better local commerce system that reduces friction between buyers and sellers, while creating more trust and transparency in each transaction."
        },
        {
          title: "Opportunity",
          body: "The market needs a platform that unifies discovery, local seller access, service booking, and trusted fulfillment in one place."
        },
        {
          title: "Partnerships",
          body: "For investment and strategic partnership conversations, contact the business team through the main support channels with your background and interest."
        },
      ]}
    />
  );
}
