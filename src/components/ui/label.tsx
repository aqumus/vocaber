import * as React from "react";
import { cn } from "@/lib/utils";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, htmlFor, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(`text-black text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70`, className)}
        htmlFor={htmlFor}
        {...props}
      >
        {children}
      </label>
    );
  }
);
Label.displayName = "Label";

export { Label };