"use client";

import { useRef, useState, useTransition } from "react";
import type { PropertyPhoto } from "@/lib/repo";
import { deletePhoto, movePhoto, updatePhotoAlt, uploadPhotos } from "@/lib/actions";

interface PhotoManagerProps {
  readonly propertyId: string;
  readonly photos: readonly PropertyPhoto[];
}

/**
 * Property photo library: upload (multiple), reorder, edit alt text, delete.
 * Uploads post originals to a bound server action; the repo stores them in Supabase
 * Storage and generates responsive variants (ADR 0002 §5).
 */
export function PhotoManager({ propertyId, photos }: PhotoManagerProps) {
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const onUpload = async (formData: FormData) => {
    setUploading(true);
    try {
      await uploadPhotos(propertyId, formData);
      formRef.current?.reset();
    } finally {
      setUploading(false);
    }
  };

  const busy = pending || uploading;

  return (
    <section className="card stack" aria-busy={busy}>
      <div className="between">
        <h2 style={{ margin: 0 }}>Photos</h2>
        <span className="muted" style={{ fontSize: "0.8rem" }}>{photos.length} uploaded</span>
      </div>

      <form ref={formRef} action={onUpload} className="row" style={{ gap: "0.75rem", flexWrap: "wrap" }}>
        <input
          className="input"
          type="file"
          name="photos"
          accept="image/*"
          multiple
          required
          style={{ maxWidth: 360 }}
        />
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </form>

      {photos.length === 0 ? (
        <p className="muted" style={{ margin: 0 }}>
          No photos yet. Upload JPG/PNG/WebP — responsive AVIF/WebP variants are generated automatically.
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {photos.map((photo, index) => (
            <li key={photo.id} className="stack" style={{ gap: "0.5rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview; sources are Storage/data URLs */}
              <img
                src={photo.url}
                alt={photo.alt || "Property photo"}
                style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", borderRadius: 10, background: "var(--wb-surface-tinted)" }}
              />
              <input
                className="input"
                defaultValue={photo.alt}
                placeholder="Alt text (accessibility & SEO)"
                aria-label="Alt text"
                onBlur={(e) => {
                  if (e.target.value !== photo.alt) {
                    startTransition(() => void updatePhotoAlt(propertyId, photo.id, e.target.value));
                  }
                }}
              />
              <div className="row" style={{ gap: "0.35rem" }}>
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={busy || index === 0}
                  aria-label="Move left"
                  onClick={() => startTransition(() => void movePhoto(propertyId, photo.id, "up"))}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={busy || index === photos.length - 1}
                  aria-label="Move right"
                  onClick={() => startTransition(() => void movePhoto(propertyId, photo.id, "down"))}
                >
                  →
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={busy}
                  style={{ marginLeft: "auto", color: "#b3261e" }}
                  onClick={() => startTransition(() => void deletePhoto(propertyId, photo.id))}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
