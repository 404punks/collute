"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import { accountNav, mainNav, type NavItem } from "@/lib/navigation";

function active(pathname: string, item: NavItem) {
  if (item.match === "exact") return pathname === item.href;
  if (item.href === "/profile/me") return pathname.startsWith("/profile");
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function NavLinks({
  unread = 0,
  onNavigate,
  showAccount = true,
}: {
  unread?: number;
  onNavigate?: () => void;
  showAccount?: boolean;
}) {
  const pathname = usePathname();
  const items = showAccount ? [...mainNav, ...accountNav] : mainNav;
  return (
    <nav className="grid gap-1" aria-label="Primary">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="nav-link"
          aria-current={active(pathname, item) ? "page" : undefined}
          onClick={onNavigate}
        >
          <Icon name={item.icon} />
          <span className="nav-label">{item.label}</span>
          {item.href === "/notifications" && unread > 0 ? (
            <span className="badge official ml-auto">{unread}</span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
