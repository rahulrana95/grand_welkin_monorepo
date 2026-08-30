import Link from "next/link";
import { notFound } from "next/navigation";
import { PricingCalendar } from "@/components/PricingCalendar";
import { PropertyForm } from "@/components/PropertyForm";
import { updateProperty } from "@/lib/actions";
import { getRepo } from "@/lib/repo";

interface PageProps {
  readonly params: Promise<{ readonly id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const property = await getRepo().getProperty(id);
  return { title: property ? property.name : "Property" };
}

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params;
  const repo = getRepo();
  const property = await repo.getProperty(id);
  if (!property) notFound();

  const [pricing, blocked] = await Promise.all([repo.getPricing(id), repo.getBlocked(id)]);

  return (
    <div className="stack">
      <div className="between">
        <div>
          <Link href="/properties" className="muted">← Properties</Link>
          <h1 style={{ margin: "0.25rem 0 0" }}>{property.name}</h1>
        </div>
        <span className={`badge badge--${property.status}`}>{property.status}</span>
      </div>

      <PricingCalendar
        propertyId={property.id}
        currency={property.currency}
        basePriceCents={property.basePriceCents}
        pricing={Object.fromEntries(pricing)}
        blocked={[...blocked]}
      />

      <h2>Details</h2>
      <PropertyForm action={updateProperty} property={property} submitLabel="Save changes" />
    </div>
  );
}
