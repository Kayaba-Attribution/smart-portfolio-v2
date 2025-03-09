"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Gift, 
  Bell, 
  Settings 
} from "lucide-react";
import { useUI } from "@/contexts/UIContext";

const navItems = [
  { href: "/", label: "Portfolio", icon: LayoutDashboard },
  { href: "/trade", label: "Trade", icon: ArrowLeftRight },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/activity", label: "Activity", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
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
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 py-2
                ${isActive ? 'text-primary' : 'text-muted-foreground'}
                hover:text-primary transition-colors active:scale-95 touch-none`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
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