import Link from "next/link";
import { Logo } from "./Logo";

const NAV: readonly { readonly href: string; readonly label: string }[] = [
  { href: "/destinations/amalfi-coast", label: "Destinations" },
  { href: "/#collections", label: "Collections" },
  { href: "/#journal", label: "Journal" },
  { href: "/#about", label: "Our homes" },
];

export function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "color-mix(in srgb, var(--wb-bg) 88%, transparent)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--wb-border)",
      }}
    >
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 76 }}
      >
        <Link href="/" aria-label="WelkinBliss home" style={{ display: "inline-flex" }}>
          <Logo variant="color" height={40} />
        </Link>
        <nav aria-label="Primary" style={{ display: "flex", gap: "1.75rem", alignItems: "center" }}>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="muted" style={{ fontWeight: 500 }}>
              {item.label}
            </Link>
          ))}
          <Link href="/destinations/amalfi-coast" className="btn btn--primary">
            Find your stay
          </Link>
        </nav>
      </div>
    </header>
  );
}
