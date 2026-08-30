import logo from "@/assets/sabu-logo.jpg";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="/" className={`flex items-center ${className}`}>
      <img
        src={logo}
        alt="SABU Marketplace"
        className="h-11 w-auto object-contain"
      />
    </a>
  );
}
