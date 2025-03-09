"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { PlusCircle, Share2 } from "lucide-react";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone) {
    return null;
  }

  return (
    <Card className="w-[380px] mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Install Our App</CardTitle>
        <CardDescription>
          Get the best experience by installing our app on your device
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!isIOS && (
          <Button className="w-full" size="lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add to Home Screen
          </Button>
        )}
        {isIOS && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Share2 className="h-5 w-5" />
              <span>Tap the share button</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <PlusCircle className="h-5 w-5" />
              <span>Then select &quot;Add to Home Screen&quot;</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
