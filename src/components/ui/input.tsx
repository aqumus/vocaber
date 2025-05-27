import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement>(({ className, type, ...props }, ref) => {
  return (
    <input // Ensure input text color is readable, e.g., black on a light background, and border is grey
      className={cn("flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 text-black", className)}
      type={type}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input'

export { Input};