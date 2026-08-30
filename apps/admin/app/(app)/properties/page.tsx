import Link from "next/link";
import { getRepo } from "@/lib/repo";

export const metadata = { title: "Properties" };

const price = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

export default async function PropertiesPage() {
  const properties = await getRepo().listProperties();
  return (
    <div className="stack">
      <div className="between">
        <div>
          <p className="eyebrow">Manage</p>
          <h1 style={{ margin: 0 }}>Properties</h1>
        </div>
        <Link href="/properties/new" className="btn btn--primary">New property</Link>
      </div>

      <table className="table">
        <thead>
          <tr><th>Name</th><th>Destination</th><th>Status</th><th>Base / night</th><th /></tr>
        </thead>
        <tbody>
          {properties.map((p) => (
            <tr key={p.id}>
              <td><Link href={`/properties/${p.id}`} style={{ fontWeight: 600 }}>{p.name}</Link></td>
              <td className="muted">{p.destinationSlug}</td>
              <td><span className={`badge badge--${p.status}`}>{p.status}</span></td>
              <td>{price(p.basePriceCents, p.currency)}</td>
              <td style={{ textAlign: "right" }}><Link href={`/properties/${p.id}`} className="btn btn--ghost btn--sm">Edit</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
