import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
});

function BlogPage() {
  return (
    <InfoPage
      eyebrow="Company"
      title="SABU blog"
      description="Updates, marketplace stories, seller insights, and product discovery ideas from the SABU team."
      items={[
        {
          title: "Coming soon",
          body: "This blog space is being prepared for product updates, seller advice, and cultural stories from the communities we serve."
        },
        {
          title: "Content direction",
          body: "We plan to share practical guides on local commerce, trust, pricing, and how to build a better marketplace experience."
        },
      ]}
    />
  );
}
