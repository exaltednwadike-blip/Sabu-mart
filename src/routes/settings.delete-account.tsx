import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { checkAccountDeletionBlockers, deleteMyAccount } from "@/lib/account-deletion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/settings/delete-account")({
  component: DeleteAccountPage,
  loader: async () => checkAccountDeletionBlockers(),
});

function DeleteAccountPage() {
  const { blockers } = Route.useLoaderData();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blocked = blockers.length > 0;

  async function handleDelete() {
    setSubmitting(true);
    setError(null);
    try {
      await deleteMyAccount({ data: { confirmation: confirmText } });
      navigate({ to: "/" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-4">Delete my account</h1>

      {blocked ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Your account can&apos;t be deleted yet because you have payment
            history tied to it. This keeps order and financial records
            accurate for everyone involved.
          </p>
          <ul className="list-disc pl-5 text-sm">
            {blockers.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This permanently deletes your profile, cart, wishlist, reviews,
            and any draft/unpaid listings. This cannot be undone.
          </p>
          <Input
            placeholder='Type "DELETE" to confirm'
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            variant="destructive"
            disabled={confirmText !== "DELETE" || submitting}
            onClick={handleDelete}
          >
            {submitting ? "Deleting…" : "Permanently delete my account"}
          </Button>
        </div>
      )}
    </div>
  );
}
