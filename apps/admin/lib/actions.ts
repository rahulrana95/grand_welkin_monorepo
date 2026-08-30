"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, isAllowed } from "./auth";
import { getRepo } from "./repo";
import type { PropertyInput, PropertyStatus } from "./repo";

// ── Auth ─────────────────────────────────────────────────────────────────────
export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const next = String(formData.get("next") ?? "/") || "/";
  if (!isAllowed(email) || !formData.get("password")) {
    redirect(`/login?error=1${next !== "/" ? `&next=${encodeURIComponent(next)}` : ""}`);
  }
  (await cookies()).set(AUTH_COOKIE, email.trim().toLowerCase(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect(next.startsWith("/") ? next : "/");
}

export async function logout() {
  (await cookies()).delete(AUTH_COOKIE);
  redirect("/login");
}

// ── Properties ───────────────────────────────────────────────────────────────
function readPropertyInput(formData: FormData): PropertyInput {
  const num = (k: string) => Number(formData.get(k) ?? 0);
  const str = (k: string) => String(formData.get(k) ?? "");
  return {
    slug: str("slug"),
    name: str("name"),
    destinationSlug: str("destinationSlug"),
    region: str("region"),
    country: str("country"),
    countryCode: str("countryCode"),
    summary: str("summary"),
    description: str("description"),
    sleeps: num("sleeps"),
    bedrooms: num("bedrooms"),
    bathrooms: num("bathrooms"),
    basePriceCents: Math.round(num("basePrice") * 100),
    currency: str("currency") || "EUR",
    status: (str("status") || "draft") as PropertyStatus,
    uplistingPropertyId: str("uplistingPropertyId") || null,
  };
}

export async function createProperty(formData: FormData) {
  const property = await getRepo().createProperty(readPropertyInput(formData));
  revalidatePath("/properties");
  redirect(`/properties/${property.id}`);
}

export async function updateProperty(formData: FormData) {
  const id = String(formData.get("id"));
  await getRepo().updateProperty(id, readPropertyInput(formData));
  revalidatePath(`/properties/${id}`);
  revalidatePath("/properties");
}

// ── Pricing & blocking (called from the client calendar) ────────────────────
export async function applyPriceRange(propertyId: string, from: string, to: string, priceCents: number) {
  await getRepo().setPriceRange(propertyId, from, to, priceCents);
  revalidatePath(`/properties/${propertyId}`);
}

export async function toggleBlocked(propertyId: string, date: string) {
  await getRepo().toggleBlocked(propertyId, date);
  revalidatePath(`/properties/${propertyId}`);
}

// ── Site copy ────────────────────────────────────────────────────────────────
export async function updateSiteCopy(formData: FormData) {
  await getRepo().updateSiteCopy(String(formData.get("key")), String(formData.get("value")));
  revalidatePath("/site-copy");
}
