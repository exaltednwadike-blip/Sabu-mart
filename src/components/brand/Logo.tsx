import logo from "@/assets/sabu-logo.asset.json";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="/" className={`flex items-center gap-2 ${className}`}>
      <img
        src={logo.url}
        alt="SABU Marketplace"
        width={40}
        height={40}
        className="h-10 w-10 rounded-lg object-cover"
      />
      <div className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-tight text-primary">
          SABU
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Marketplace
        </span>
      </div>
    </a>
  );
}
