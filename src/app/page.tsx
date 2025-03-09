"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InstallPrompt } from "@/components/InstallPrompt";

export default function LandingPage() {
  const router = useRouter();
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const isPWA = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(isPWA);

    // If PWA, redirect to app
    if (isPWA) {
      router.push("/app");
    }
  }, [router]);

  // Show landing page only for web
  if (isStandalone) return null;

  return (
    <div className="min-h-screen">
      {/* Your landing page content */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-sm z-50">
        {/* Landing nav */}
      </header>

      <main>
        {/* Hero section */}
        <section className="min-h-screen flex items-center justify-center">
          <div className="container">
            <h1>Smart Portfolio</h1>
            <p>Decentralized Portfolio Management Made Easy</p>
            <InstallPrompt />
          </div>
        </section>

        {/* Other landing sections */}
      </main>

      <footer>{/* Landing footer */}</footer>
    </div>
  );
}
