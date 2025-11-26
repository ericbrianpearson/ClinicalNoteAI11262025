import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 
    | "default" 
    | "destructive" 
    | "outline" 
    | "secondary" 
    | "ghost" 
    | "link"
    | "success"
    | "warning";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base button styles
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          
          // Variant styles - theme-aware
          {
            // Default/Primary variant
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow": 
              variant === "default",
            
            // Destructive variant
            "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm": 
              variant === "destructive",
            
            // Success variant
            "bg-success text-success-foreground hover:bg-success/90 shadow-sm": 
              variant === "success",
            
            // Warning variant
            "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm": 
              variant === "warning",
            
            // Outline variant
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground": 
              variant === "outline",
            
            // Secondary variant
            "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm": 
              variant === "secondary",
            
            // Ghost variant
            "hover:bg-accent hover:text-accent-foreground": 
              variant === "ghost",
            
            // Link variant
            "text-primary underline-offset-4 hover:underline": 
              variant === "link",
          },
          
          // Size styles
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };