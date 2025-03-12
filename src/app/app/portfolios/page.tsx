"use client";

import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PortfoliosPage() {
  return (
    <PageWrapper>
      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            Portfolio coming soon
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
} 