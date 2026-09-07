import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/student-housing")({
  component: StudentHousingPage,
});

function StudentHousingPage() {
  return (
    <InfoPage
      eyebrow="Accommodation"
      title="Student housing"
      description="Student housing listings help students and families find safe, affordable, and practical living options near schools and campuses."
      items={[
        {
          title: "What matters most",
          body: "Location, price, availability, room type, and safety details are critical for student housing search and trust."
        },
        {
          title: "For landlords and agents",
          body: "Accurate property information, prompt communication, and real availability reduce confusion and increase trust."
        },
        {
          title: "Buyer protection",
          body: "Use clear terms and verified details so the booking and rental process feels transparent from the start."
        },
      ]}
    />
  );
}
