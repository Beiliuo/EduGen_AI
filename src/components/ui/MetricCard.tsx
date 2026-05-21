import { Card, CardContent } from "@/components/ui/Card";
import type { ReactNode } from "react";

export function MetricCard({ label, value, helper, icon }: { label: string; value: string | number; helper?: string; icon?: ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
          {helper ? <p className="mt-2 text-xs text-muted-foreground">{helper}</p> : null}
        </div>
        {icon ? <div className="rounded-md bg-muted p-2 text-primary">{icon}</div> : null}
      </CardContent>
    </Card>
  );
}
