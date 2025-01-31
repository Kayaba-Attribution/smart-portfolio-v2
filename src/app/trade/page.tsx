"use client";

import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TradePage() {
  return (
    <PageWrapper>
      <Card>
        <CardHeader>
          <CardTitle>Trade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            Trading interface coming soon
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
} 