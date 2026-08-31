export type IconName =
  | "guests"
  | "bed"
  | "bath"
  | "pool"
  | "ac"
  | "wifi"
  | "chef"
  | "fireplace"
  | "hottub"
  | "pet"
  | "sauna"
  | "ev"
  | "amenity";

interface IconProps {
  readonly name: IconName;
  readonly size?: number;
  /** Accessible name; omit for decorative icons (then aria-hidden). */
  readonly label?: string;
}

/** Inline line-icons (no dependency), themed via `currentColor`. */
export function Icon({ name, size = 18, label }: IconProps) {
  const a11y = label ? { role: "img" as const, "aria-label": label } : { "aria-hidden": true };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...a11y}
    >
      {paths(name)}
    </svg>
  );
}

function paths(name: IconName): React.ReactNode {
  switch (name) {
    case "guests":
      return (<><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5" /></>);
    case "bed":
      return (<><path d="M3 8v11" /><path d="M3 15h18v4" /><path d="M21 19v-4a3 3 0 0 0-3-3H7v3" /><path d="M6.5 11.5a1.5 1.5 0 1 0 0-.01" /></>);
    case "bath":
      return (<><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" /><path d="M4 12V6.5A2.5 2.5 0 0 1 6.5 4a2.3 2.3 0 0 1 2 1.3" /><path d="M7.5 6.5h3" /><path d="M6 19l-1 2" /><path d="M18 19l1 2" /></>);
    case "pool":
      return (<><path d="M2 15c1.6 0 1.6-1.6 3.2-1.6S6.8 15 8.4 15 10 13.4 11.6 13.4 13.2 15 14.8 15 16.4 13.4 18 13.4 19.6 15 22 15" /><path d="M2 19c1.6 0 1.6-1.6 3.2-1.6S6.8 19 8.4 19 10 17.4 11.6 17.4 13.2 19 14.8 19 16.4 17.4 18 17.4 19.6 19 22 19" /><path d="M8 13V5.5A1.5 1.5 0 0 1 9.5 4" /><path d="M16 13V5.5A1.5 1.5 0 0 0 14.5 4" /></>);
    case "ac":
      return (<><path d="M12 3v18" /><path d="M3 12h18" /><path d="M6 6l12 12" /><path d="M18 6L6 18" /><path d="M12 3l-2 2m2-2 2 2M12 21l-2-2m2 2 2-2M3 12l2-2m-2 2 2 2M21 12l-2-2m2 2-2 2" /></>);
    case "wifi":
      return (<><path d="M4 8.5a13 13 0 0 1 16 0" /><path d="M6.5 11.5a9 9 0 0 1 11 0" /><path d="M9 14.5a5 5 0 0 1 6 0" /><path d="M12 18h.01" /></>);
    case "chef":
      return (<><path d="M6 14a4 4 0 0 1-1-7.9A4 4 0 0 1 12 4a4 4 0 0 1 7 2.1A4 4 0 0 1 18 14z" /><path d="M6 14v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" /><path d="M9 20v-3M15 20v-3M12 20v-3" /></>);
    case "fireplace":
      return (<><path d="M12 3c.8 2.5 3.5 3.6 3.5 7a3.5 3.5 0 0 1-7 0c0-1 .4-1.8 1-2.5.2 1.4 1.5 1.6 1.5.3 0-1.6.6-2.9 1-4.8z" /><path d="M12 20v0" /></>);
    case "hottub":
      return (<><path d="M12 3s4.5 4.4 4.5 8a4.5 4.5 0 0 1-9 0C7.5 7.4 12 3 12 3z" /></>);
    case "pet":
      return (<><circle cx="7" cy="9" r="1.6" /><circle cx="12" cy="7" r="1.6" /><circle cx="17" cy="9" r="1.6" /><path d="M12 12c-2.5 0-4.5 2-4.5 4a2.5 2.5 0 0 0 2.5 2.5c.9 0 1.4-.4 2-.4s1.1.4 2 .4A2.5 2.5 0 0 0 16.5 16c0-2-2-4-4.5-4z" /></>);
    case "sauna":
      return (<><path d="M8 3c-1 1.5-1 3 0 4.5S9 10.5 8 12" /><path d="M12 3c-1 1.5-1 3 0 4.5s1 3 0 4.5" /><path d="M16 3c-1 1.5-1 3 0 4.5s1 3 0 4.5" /><path d="M4 16h16v2a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" /></>);
    case "ev":
      return (<><path d="M13 3 5 13h6l-1 8 8-10h-6z" /></>);
    case "amenity":
      return (<><path d="M20 6 9 17l-5-5" /></>);
    default: {
      const _exhaustive: never = name;
      return _exhaustive;
    }
  }
}

/** Map an amenity's stable schema.org name to its icon. */
export function amenityIconFor(schemaName: string): IconName {
  switch (schemaName) {
    case "Private pool":
      return "pool";
    case "Air conditioning":
      return "ac";
    case "Wi-Fi":
      return "wifi";
    case "Chef service":
      return "chef";
    case "Fireplace":
      return "fireplace";
    case "Hot tub":
      return "hottub";
    case "Pet-friendly":
      return "pet";
    case "Sauna":
      return "sauna";
    case "EV charger":
      return "ev";
    default:
      return "amenity";
  }
}
