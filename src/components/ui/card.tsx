import * as React from "react";
import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  elevation?: "low" | "high" | "highest";
};

export function Card({ 
  className, 
  elevation = "high", 
  ...props 
}: CardProps) {
  const elevations = {
    low: "bg-surface-container-low",
    high: "bg-surface-container-high",
    highest: "bg-surface-container-highest",
  };

  return (
    <div
      className={cn(
        "rounded-lg p-spacing-8 border-none transition-all duration-250 ease-snappy hover:bg-surface-container-highest/80",
        elevations[elevation],
        className
      )}
      {...props}
    />
  );
}
