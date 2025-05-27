import * as React from "react";

import { cn } from "@/lib/utils";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "outline"; // Add 'outline' variant
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = "default", ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90", // Primary button styles
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80", // Secondary button styles
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground", // Outline button styles
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};
Button.displayName = "Button";

export { Button };