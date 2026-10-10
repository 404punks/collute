import type { NavIcon } from "@/lib/navigation";

type Props = { name: NavIcon | "search" | "close"; className?: string };

export function Icon({ name, className = "h-5 w-5" }: Props) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
        </svg>
      );
    case "following":
      return (
        <svg {...common}>
          <path d="M16 20v-1.2A3.8 3.8 0 0 0 12.2 15H7.8A3.8 3.8 0 0 0 4 18.8V20" />
          <circle cx="10" cy="8" r="3" />
          <path d="M20 20v-1.2A3.8 3.8 0 0 0 17.5 15.2" />
          <path d="M16.2 5.2a3 3 0 0 1 0 5.6" />
        </svg>
      );
    case "trending":
      return (
        <svg {...common}>
          <path d="M4 16.5 9.2 11l3.3 3.2L20 7" />
          <path d="M14.5 7H20v5.5" />
        </svg>
      );
    case "explore":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="m14.8 9.2-1.2 4.4-4.4 1.2 1.2-4.4z" />
        </svg>
      );
    case "bookmarks":
      return (
        <svg {...common}>
          <path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.2L6 20V5.5a1 1 0 0 1 1-1z" />
        </svg>
      );
    case "notifications":
      return (
        <svg {...common}>
          <path d="M6 16.5h12l-1.2-2.1V10a4.8 4.8 0 1 0-9.6 0v4.4z" />
          <path d="M10 18.2a2 2 0 0 0 4 0" />
        </svg>
      );
    case "profile":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 19.2a6.5 6.5 0 0 1 13 0" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    default:
      return null;
  }
}
