import Link from "next/link";
import { PropertyForm } from "@/components/PropertyForm";
import { createProperty } from "@/lib/actions";

export const metadata = { title: "New property" };

export default function NewPropertyPage() {
  return (
    <div className="stack">
      <div>
        <Link href="/properties" className="muted">← Properties</Link>
        <h1 style={{ margin: "0.25rem 0 0" }}>New property</h1>
      </div>
      <PropertyForm action={createProperty} submitLabel="Create property" />
    </div>
  );
}
