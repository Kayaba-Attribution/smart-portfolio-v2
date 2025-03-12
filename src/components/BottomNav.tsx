"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Gift, 
  BriefcaseBusiness, 
  Settings 
} from "lucide-react";
import { useUI } from "@/contexts/UIContext";

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/trade", label: "Invest", icon: ArrowLeftRight },
  { href: "/app/portfolios", label: "Portfolios", icon: BriefcaseBusiness },
  { href: "/app/rewards", label: "Rewards", icon: Gift },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isLoginOverlayVisible } = useUI();

  // Don't render if login overlay is visible
  if (isLoginOverlayVisible) return null;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-stretch h-20">
        {navItems.map(({ href, label, icon: Icon }) => {
          // Check if the current path matches this nav item's href exactly
          // or if we're on a sub-page (e.g. /app/trade/something)
          const isMain = href === "/app" && pathname === "/app";
          const isSubRoute = href !== "/app" && pathname.startsWith(href);
          const isActive = isMain || isSubRoute;

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 py-2
                ${isActive ? "text-primary" : "text-muted-foreground"}
                hover:text-primary transition-colors active:scale-95 touch-none`}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 