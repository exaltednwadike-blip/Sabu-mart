import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/list-property")({
  component: ListPropertyPage,
});

function ListPropertyPage() {
  return (
    <InfoPage
      eyebrow="Accommodation"
      title="List a property"
      description="Property listings help buyers discover homes, short lets, and rental options in a local and trust-focused way."
      items={[
        {
          title: "What to include",
          body: "Use a clear title, location, pricing, photos, and a realistic description of the property and what is included."
        },
        {
          title: "What buyers want",
          body: "Location, available amenities, room details, rules, and contact clarity matter most when people are evaluating a property."
        },
        {
          title: "Compliance",
          body: "Only list properties you are allowed to advertise and ensure the details match the actual property available."
        },
      ]}
    />
  );
}
