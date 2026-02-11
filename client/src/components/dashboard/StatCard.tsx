import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  className?: string;
  loading?: boolean;
}

export function StatCard({ title, value, icon: Icon, description, trend, className, loading }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden card-hover border-border/60", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground font-sans">
          {title}
        </CardTitle>
        <div className="p-2 bg-primary/5 rounded-lg">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold font-display tracking-tight text-foreground">{value}</div>
            {(description || trend) && (
              <p className="text-xs text-muted-foreground">
                {trend && <span className="text-green-600 font-medium mr-1">{trend}</span>}
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
