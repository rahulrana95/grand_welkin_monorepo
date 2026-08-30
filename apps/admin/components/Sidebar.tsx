"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions";

const NAV: readonly { readonly href: string; readonly label: string }[] = [
  { href: "/", label: "Dashboard" },
  { href: "/properties", label: "Properties" },
  { href: "/site-copy", label: "Site copy" },
];

const RAYS: readonly (readonly [number, number, number, number])[] = [
  [55, 40, 55, 28], [41, 44, 35, 33], [69, 44, 75, 33],
  [32, 55, 21, 49], [78, 55, 89, 49], [27, 68, 15, 67], [83, 68, 95, 67],
];

export function Sidebar({ email }: { readonly email: string }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <aside style={{ background: "var(--wb-surface)", borderRight: "1px solid var(--wb-border)", padding: "1.25rem 1rem", display: "flex", flexDirection: "column", gap: "1.5rem", position: "sticky", top: 0, height: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
        <svg viewBox="0 0 120 132" height={34} fill="none" aria-hidden>
          <g strokeLinecap="round" strokeLinejoin="round" strokeWidth={4.5}>
            <path d="M26 116 L26 52 A34 34 0 0 1 94 52 L94 116" stroke="var(--wb-blue)" />
            <path d="M24 116 L96 116" stroke="var(--wb-blue)" />
            <g stroke="var(--wb-gold)" strokeWidth={3.4}>
              {RAYS.map(([a, b, c, d]) => <line key={`${a}-${b}`} x1={a} y1={b} x2={c} y2={d} />)}
            </g>
            <circle cx={55} cy={66} r={17} stroke="var(--wb-gold)" />
            <path d="M24 116 C28 100 38 88 49 90 C58 92 61 101 68 101 C75 101 80 94 86 100 C90 104 93 110 96 116" stroke="var(--wb-blue)" />
          </g>
        </svg>
        <div style={{ lineHeight: 1.05 }}>
          <div style={{ fontFamily: "var(--wb-font-display)", fontWeight: 700, color: "var(--wb-blue)" }}>WelkinBliss</div>
          <div className="muted" style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Admin</div>
        </div>
      </div>

      <nav style={{ display: "grid", gap: "0.15rem" }}>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active(item.href) ? "page" : undefined}
            style={{
              padding: "0.55rem 0.7rem", borderRadius: 8, fontWeight: 500,
              color: active(item.href) ? "var(--wb-on-primary)" : "var(--wb-text)",
              background: active(item.href) ? "var(--wb-primary)" : "transparent",
              textDecoration: "none",
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div style={{ marginTop: "auto", display: "grid", gap: "0.5rem" }}>
        <span className="muted" style={{ fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</span>
        <form action={logout}>
          <button type="submit" className="btn btn--ghost btn--sm" style={{ width: "100%" }}>Sign out</button>
        </form>
      </div>
    </aside>
  );
}
