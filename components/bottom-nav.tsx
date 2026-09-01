"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "首页", icon: "⌂" },
  { href: "/week", label: "本周方案", icon: "▣" },
  { href: "/shopping", label: "采购清单", icon: "□" },
  { href: "/profile", label: "我的", icon: "○" }
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottomNav" aria-label="主导航">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={active ? "navItem active" : "navItem"}>
            <span className="navIcon" aria-hidden>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
