export type NavIcon =
  | "home"
  | "following"
  | "trending"
  | "explore"
  | "bookmarks"
  | "notifications"
  | "profile"
  | "settings";

export type NavItem = {
  href: string;
  label: string;
  icon: NavIcon;
  match: "exact" | "prefix";
};

export const mainNav: NavItem[] = [
  { href: "/", label: "Home", icon: "home", match: "exact" },
  { href: "/following", label: "Following", icon: "following", match: "prefix" },
  { href: "/trending", label: "Trending", icon: "trending", match: "prefix" },
  { href: "/explore", label: "Explore Tokens", icon: "explore", match: "prefix" },
  { href: "/bookmarks", label: "Bookmarks", icon: "bookmarks", match: "prefix" },
  { href: "/notifications", label: "Notifications", icon: "notifications", match: "prefix" },
];

export const accountNav: NavItem[] = [
  { href: "/profile/me", label: "Profile", icon: "profile", match: "prefix" },
  { href: "/settings", label: "Settings", icon: "settings", match: "prefix" },
];
