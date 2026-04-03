import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "default" | "sm" | "lg";
};

export function Button({ 
  className, 
  variant = "primary", 
  size = "default",
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-primary text-[#21005d] hover:bg-primary/90",
    secondary: "glass border border-secondary/30 text-secondary hover:bg-secondary/10 hover:border-secondary/50",
    tertiary: "text-tertiary underline-offset-4 hover:underline decoration-2 transition-all duration-250 ease-snappy",
  };

  const sizes = {
    default: "px-8 py-4 text-sm",
    sm: "px-4 py-2 text-xs",
    lg: "px-10 py-6 text-lg",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[0.5rem] font-label uppercase tracking-[0.05em] transition-all duration-250 ease-snappy disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
