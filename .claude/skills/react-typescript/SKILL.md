---
name: react-typescript
description: Use when writing or reviewing React components, hooks, or context in TypeScript (.tsx). Frontend-specific typing — readable prop interfaces, discriminated-union props for mutually exclusive states, correctly typed hooks (useState/useRef/useReducer), typed DOM events, and typed context. No `any`, no `React.FC`.
---

# React + TypeScript

Frontend layer on top of `typescript-style`, `typescript-generics`, and
`typescript-switch-exhaustive` — all of those still apply. This skill covers the
React-specific patterns. Optimise for a reader scanning a component cold.

## 1. Props — `interface`, explicit, no `React.FC`

Type the props object directly. Don't use `React.FC` (it muddies generics and
implicitly pulls in `children` whether you want it or not). Declare `children`
explicitly only when the component accepts it.

```tsx
interface ButtonProps {
  readonly label: string;
  readonly onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly variant?: "primary" | "secondary"; // union literal, not a free string
  readonly disabled?: boolean;
  readonly children?: React.ReactNode;         // only because this one nests
}

function Button({ label, onClick, variant = "primary", disabled }: ButtonProps) {
  return (
    <button className={variant} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

- Mark props `readonly` — components must not mutate their props.
- Constrain string props to union literals (`"primary" | "secondary"`) instead of
  `string` whenever the set is known.
- Reuse DOM types when wrapping an element:
  `interface InputProps extends React.ComponentPropsWithoutRef<"input"> { … }`.

## 2. Mutually-exclusive props → discriminated union

When some props only make sense together (or are forbidden together), model it as a
discriminated union on a `variant`/`status` discriminant. This makes illegal prop
combinations **unrepresentable** — the compiler rejects them at the call site.

```tsx
type AlertProps =
  | { status: "success"; message: string }
  | { status: "error"; message: string; onRetry: () => void } // retry only on error
  | { status: "loading" };                                     // no message here

function Alert(props: AlertProps) {
  switch (props.status) {            // exhaustive switch — see typescript-switch-exhaustive
    case "success":
      return <p className="ok">{props.message}</p>;
    case "error":
      return (
        <p className="err">
          {props.message} <button onClick={props.onRetry}>Retry</button>
        </p>
      );
    case "loading":
      return <Spinner />;
    default:
      return assertNever(props);
  }
}
```

## 3. Hooks — type the state, not the setter

- `useState`: let inference work for primitives (`useState(0)`, `useState("")`). Add
  an explicit generic when the initial value is `null`/`undefined` or a union, so
  the state isn't wrongly narrowed.
- Model loading/data/error as **one discriminated union**, not three loose booleans
  — it removes impossible states (`isLoading && error`).

```tsx
const [count, setCount] = useState(0);                  // inferred number
const [user, setUser] = useState<User | null>(null);    // explicit — initial is null

type FetchState<Data> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Data }
  | { status: "error"; error: string };
const [state, setState] = useState<FetchState<User>>({ status: "idle" });
```

- `useRef`: `useRef<HTMLInputElement>(null)` for DOM refs;
  `useRef<number>(0)` for mutable instance values.
- `useReducer`: type state and a discriminated-union action; the reducer is an
  exhaustive `switch` (see `typescript-switch-exhaustive`).

## 4. Events — always name the element

Use React's synthetic event types and specify the element — that's what determines
which fields exist on `event.target`/`event.currentTarget`.

```tsx
const onChange = (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value);
const onSubmit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); /* … */ };
const onClick  = (event: React.MouseEvent<HTMLButtonElement>) => { /* … */ };
```

Don't write a bare `React.ChangeEvent` or fall back to `any` on an event.

## 5. Context — typed, with a guarded hook

Default the context to `undefined` and expose a hook that throws when used outside
its provider, so consumers get a non-null type and a clear runtime error.

```tsx
interface AuthContextValue {
  readonly user: User | null;
  readonly signOut: () => void;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (value === undefined) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return value; // narrowed to AuthContextValue
}
```

## 6. Generic components — only with a real relationship

A list/select whose item type flows to its render callback is a legitimate generic
(the Golden Rule from `typescript-generics` holds). Don't make a component generic
just to look reusable.

```tsx
interface ListProps<Item> {
  readonly items: readonly Item[];
  readonly getKey: (item: Item) => string;
  readonly renderItem: (item: Item) => React.ReactNode;
}
function List<Item>({ items, getKey, renderItem }: ListProps<Item>) {
  return <ul>{items.map((item) => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>;
}
```

## Checklist
- [ ] Props are a `readonly` `interface`; no `React.FC`; `children` declared only if used.
- [ ] Known string props are union literals, not `string`.
- [ ] Mutually-exclusive props use a discriminated union, rendered via exhaustive `switch`.
- [ ] Async UI is one `FetchState` union, not scattered booleans.
- [ ] Event handlers name their element type; no `any` on events.
- [ ] Context exposes a guarded hook that throws outside its provider.
