import { login } from "@/lib/actions";

export const metadata = { title: "Sign in" };

interface LoginProps {
  readonly searchParams: Promise<{ readonly error?: string; readonly next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginProps) {
  const { error, next } = await searchParams;
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "1.5rem" }}>
      <form action={login} className="card stack" style={{ width: "100%", maxWidth: 380 }}>
        <div>
          <p className="eyebrow">WelkinBliss</p>
          <h1 style={{ margin: 0 }}>Admin sign in</h1>
        </div>
        {error ? <p role="alert" style={{ color: "#b3261e", margin: 0 }}>That email isn’t on the admin allowlist.</p> : null}
        <label className="field">
          <span>Email</span>
          <input className="input" type="email" name="email" required autoComplete="username" placeholder="admin@welkinbliss.com" />
        </label>
        <label className="field">
          <span>Password</span>
          <input className="input" type="password" name="password" required autoComplete="current-password" />
        </label>
        <input type="hidden" name="next" value={next ?? "/"} />
        <button type="submit" className="btn btn--primary">Sign in</button>
        <p className="muted" style={{ fontSize: "0.78rem", margin: 0 }}>
          Mock auth — allowlisted email + any password (Supabase Auth replaces this). Default:
          {" "}<code>admin@welkinbliss.com</code>.
        </p>
      </form>
    </div>
  );
}
