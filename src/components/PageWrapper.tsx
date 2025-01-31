"use client";

import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="container p-4 space-y-4 h-full overflow-y-auto">
      {children}
    </div>
  );
} 