import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Store, Upload, FileCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { getCurrentUser, submitSellerApplication, type IdType } from "@/lib/auth";

export const Route = createFileRoute("/buyer/become-seller")({
  component: BecomeSeller,
});

function BecomeSeller() {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [idType, setIdType] = useState<IdType>("nin");
  const [idNumber, setIdNumber] = useState("");
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!idDocument) {
      setError("Please upload a copy of your ID document.");
      return;
    }
    if (idDocument.size > 5 * 1024 * 1024) {
      setError("File is too large. Please upload something under 5MB.");
      return;
    }

    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        navigate({ to: "/login" });
        return;
      }
      await submitSellerApplication(user.id, {
        businessName,
        businessAddress,
        phone,
        idType,
        idNumber,
        idDocument,
      });
      navigate({ to: "/buyer" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Become a seller"
        subtitle="Verify your identity to open a store on SABU. Reviews typically take 1-2 business days."
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Store className="h-4 w-4 text-primary" /> Business details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Business / store name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. TechPro Store"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Business address</label>
              <input
                type="text"
                required
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="e.g. 14 Adeola Odeku St, Victoria Island, Lagos"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Phone number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="080X XXX XXXX"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <FileCheck className="h-4 w-4 text-primary" /> Identity verification
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">ID type</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value as IdType)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="nin">National ID (NIN)</option>
                <option value="drivers_license">Driver's License</option>
                <option value="voters_card">Voter's Card</option>
                <option value="passport">International Passport</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">ID number</label>
              <input
                type="text"
                required
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Enter the number on your ID"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Upload ID document</label>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-6 text-center text-sm text-muted-foreground hover:bg-accent">
                <Upload className="h-5 w-5" />
                {idDocument ? idDocument.name : "Click to upload a clear photo or scan (max 5MB)"}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  required
                  className="hidden"
                  onChange={(e) => setIdDocument(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl gradient-brand py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {loading ? "Submitting..." : "Submit for review"}
        </button>
      </form>
    </div>
  );
}