import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, Phone, Camera, CheckCircle2, Store } from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { getCurrentUser, getProfile, updateProfile, uploadAvatar } from "@/lib/auth";

export const Route = createFileRoute("/seller/settings")({
  component: SellerSettings,
});

function SellerSettings() {
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(function () {
    getCurrentUser().then(function (user) {
      if (!user) return;
      setUserId(user.id);
      setEmail(user.email || "");
      getProfile(user.id)
        .then(function (profile) {
          setFullName(profile.full_name || "");
          setStoreName(profile.store_name || "");
          setPhone(profile.phone || "");
          setAvatarUrl(profile.avatar_url || "");
        })
        .finally(function () { setLoading(false); });
    });
  }, []);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setError("");
    setSaving(true);

    const avatarStep = avatarFile ? uploadAvatar(userId, avatarFile) : Promise.resolve(avatarUrl);

    avatarStep
      .then(function (newAvatarUrl) {
        return updateProfile(userId, { fullName, phone, avatarUrl: newAvatarUrl, storeName }).then(function () {
          setAvatarUrl(newAvatarUrl);
        });
      })
      .then(function () {
        setSaved(true);
        setTimeout(function () { setSaved(false); }, 2500);
      })
      .catch(function (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(function () {
        setSaving(false);
      });
  }

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your store and profile information." />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <form onSubmit={handleSave} className="max-w-xl space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="mb-4 font-semibold">Profile photo</h3>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                    {storeName ? storeName.charAt(0).toUpperCase() : "S"}
                  </div>
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent">
                <Camera className="h-4 w-4" /> Change photo
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="mb-4 font-semibold">Store & personal details</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                  <Store className="h-3.5 w-3.5" /> Store name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={function (e) { setStoreName(e.target.value); }}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
                <p className="mt-1 text-xs text-muted-foreground">This is shown publicly on your storefront.</p>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                  <User className="h-3.5 w-3.5" /> Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={function (e) { setFullName(e.target.value); }}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                  <Phone className="h-3.5 w-3.5" /> Phone number
                </label>
                <PhoneInput value={phone} onChange={setPhone} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-muted-foreground outline-none"
                />
                <p className="mt-1 text-xs text-muted-foreground">Email can't be changed here.</p>
              </div>
            </div>
          </section>

          {error ? (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl gradient-brand px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            {saved ? (
              <span className="flex items-center gap-1 text-sm font-medium text-success">
                <CheckCircle2 className="h-4 w-4" /> Saved
              </span>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
