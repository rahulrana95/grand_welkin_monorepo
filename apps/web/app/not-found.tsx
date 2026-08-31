import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** Branded 404 — keeps visitors moving instead of a dead end (and avoids soft-404s). */
export default function NotFound() {
  return (
    <section className="container section" style={{ textAlign: "center", maxWidth: 640 }}>
      <p className="eyebrow">404</p>
      <h1 style={{ marginTop: "0.25rem" }}>This page has drifted off</h1>
      <p className="muted" style={{ fontSize: "1.1rem", margin: "0.75rem auto 2rem" }}>
        The page you’re after isn’t here. Let’s get you back to somewhere serene.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/" className="btn btn--primary">Back home</Link>
        <Link href="/explore" className="btn btn--ghost">Explore every stay</Link>
      </div>
    </section>
  );
}
