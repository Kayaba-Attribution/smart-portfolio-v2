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

const navItems = [
  { href: "/", label: "Portfolio", icon: LayoutDashboard },
  { href: "/trade", label: "Trade", icon: ArrowLeftRight },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/activity", label: "Activity", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 h-full
                ${isActive ? 'text-primary' : 'text-muted-foreground'}
                hover:text-primary transition-colors`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 