import React from "react";
import { Card } from "@/components/ui/card";

export default function DashboardStatCard({ icon: Icon, label, value }) {
  return (
    <Card className="flex items-center justify-between px-4 py-1">
      <div className="flex items-center gap-4">
        <Icon className="text-primary" />
        <div>
          <p className="text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}
