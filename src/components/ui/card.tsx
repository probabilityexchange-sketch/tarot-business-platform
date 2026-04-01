import * as React from "react";
import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  surface?: "low" | "high" | "highest";
};

export function Card({ 
  className, 
  surface = "high", 
  ...props 
}: CardProps) {
  const surfaces = {
    low: "bg-surface-container-low",
    high: "bg-surface-container-high",
    highest: "bg-surface-container-highest",
  };

  return (
    <div
      className={cn(
        "rounded-lg p-8 transition-all duration-250 ease-snappy hover:bg-surface-container-highest/80",
        surfaces[surface],
        className
      )}
      {...props}
    />
  );
}
