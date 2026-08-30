import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { SITE_COPY_TAG } from "@/lib/site-copy";

/**
 * On-demand cache revalidation. The admin app (or a Supabase webhook) calls this
 * after editing site copy so the change appears immediately instead of waiting for
 * the cache TTL. Guarded by REVALIDATE_SECRET; disabled (401) when it is unset.
 *
 *   POST /api/revalidate            header: x-revalidate-secret: <secret>
 *   body (optional): { "tag": "site-copy" }   // defaults to the site-copy tag
 */
const ALLOWED_TAGS = new Set<string>([SITE_COPY_TAG]);

export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.REVALIDATE_SECRET;
  const provided =
    request.headers.get("x-revalidate-secret") ?? new URL(request.url).searchParams.get("secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tag = await requestedTag(request);
  if (!ALLOWED_TAGS.has(tag)) {
    return NextResponse.json({ error: `Unknown tag: ${tag}` }, { status: 400 });
  }
  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, tag });
}

async function requestedTag(request: Request): Promise<string> {
  try {
    const body = (await request.json()) as { tag?: unknown };
    if (typeof body.tag === "string" && body.tag) return body.tag;
  } catch {
    /* no/invalid body → default */
  }
  return SITE_COPY_TAG;
}
