import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { getSession } from "@/lib/auth";

/** Protected shell — sidebar + content. Middleware also guards, but re-check here. */
export default async function AppLayout({ children }: { readonly children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <div className="admin-shell">
      <Sidebar email={session.email} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
