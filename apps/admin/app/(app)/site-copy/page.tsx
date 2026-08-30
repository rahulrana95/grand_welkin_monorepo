import { updateSiteCopy } from "@/lib/actions";
import { getRepo } from "@/lib/repo";

export const metadata = { title: "Site copy" };

export default async function SiteCopyPage() {
  const copy = await getRepo().listSiteCopy();
  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Content</p>
        <h1 style={{ margin: 0 }}>Site copy</h1>
        <p className="muted">Editable strings the public site reads by key.</p>
      </div>

      {copy.map((c) => (
        <form key={c.key} action={updateSiteCopy} className="card stack" style={{ gap: "0.6rem" }}>
          <input type="hidden" name="key" value={c.key} />
          <div className="between">
            <code style={{ fontSize: "0.85rem", color: "var(--wb-primary)" }}>{c.key}</code>
            <button type="submit" className="btn btn--ghost btn--sm">Save</button>
          </div>
          <textarea className="textarea" name="value" defaultValue={c.value} />
        </form>
      ))}
    </div>
  );
}
