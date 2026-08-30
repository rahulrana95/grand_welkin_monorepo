import Link from "next/link";
import { getRepo } from "@/lib/repo";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [properties, copy] = await Promise.all([getRepo().listProperties(), getRepo().listSiteCopy()]);
  const published = properties.filter((p) => p.status === "published").length;
  const drafts = properties.filter((p) => p.status === "draft").length;

  const stats: readonly { readonly label: string; readonly value: number }[] = [
    { label: "Properties", value: properties.length },
    { label: "Published", value: published },
    { label: "Drafts", value: drafts },
    { label: "Site copy keys", value: copy.length },
  ];

  return (
    <div className="stack">
      <div className="between">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
        </div>
        <Link href="/properties/new" className="btn btn--primary">New property</Link>
      </div>

      <div className="grid2">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div style={{ fontFamily: "var(--wb-font-display)", fontSize: "2rem", color: "var(--wb-primary)" }}>{s.value}</div>
            <div className="muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card stack">
        <div className="between">
          <h2 style={{ margin: 0 }}>Recent properties</h2>
          <Link href="/properties" className="btn btn--ghost btn--sm">View all</Link>
        </div>
        <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
          {properties.slice(0, 5).map((p) => (
            <li key={p.id}><Link href={`/properties/${p.id}`}>{p.name}</Link> <span className="muted">· {p.status}</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
