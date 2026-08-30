import Link from "next/link";
import { COLLECTIONS } from "@/lib/collections";
import { DESTINATIONS } from "@/lib/data";
import { SITE } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer style={{ background: "var(--wb-surface-tinted)", borderTop: "1px solid var(--wb-border)" }}>
      <div
        className="container section"
        style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <div>
          <Logo variant="color" height={44} />
          <p className="muted" style={{ maxWidth: 280, marginTop: "1rem" }}>
            {SITE.description}
          </p>
        </div>
        <nav aria-label="Destinations">
          <h3 style={{ fontSize: "1rem" }}>Destinations</h3>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.5rem" }}>
            {DESTINATIONS.map((d) => (
              <li key={d.slug}>
                <Link href={`/destinations/${d.slug}`} className="muted">
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Collections">
          <h3 style={{ fontSize: "1rem" }}>Collections</h3>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.5rem" }}>
            {COLLECTIONS.map((c) => (
              <li key={c.slug}>
                <Link href={`/collections/${c.slug}`} className="muted">{c.title}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Company">
          <h3 style={{ fontSize: "1rem" }}>WelkinBliss</h3>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.5rem" }}>
            <li><Link href="/explore" className="muted">Explore all stays</Link></li>
            <li><Link href="/#about" className="muted">Our homes</Link></li>
            <li><Link href="/#journal" className="muted">Journal</Link></li>
            <li><Link href="/#about" className="muted">The WelkinBliss promise</Link></li>
          </ul>
        </nav>
      </div>
      <div className="container" style={{ paddingBlock: "1.5rem", borderTop: "1px solid var(--wb-border)" }}>
        <p className="muted" style={{ fontSize: "0.85rem" }}>
          © {new Date().getFullYear()} {SITE.name}. {SITE.tagline}.
        </p>
      </div>
    </footer>
  );
}
