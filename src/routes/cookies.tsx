import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/cookies")({
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Cookies policy"
      description="SABU uses cookies to keep the platform usable, remember preferences, support secure sessions, and improve marketplace performance."
      items={[
        {
          title: "What cookies do",
          body: "Cookies help with login sessions, app behavior, marketplace preferences, analytics, and the overall shopping experience."
        },
        {
          title: "Your options",
          body: "You can manage browser settings to restrict or delete cookies, although some platform features may not function properly if cookies are disabled."
        },
        {
          title: "Why they matter",
          body: "Cookies support app stability, session continuity, and better product discovery and checkout flows."
        },
      ]}
    />
  );
}
