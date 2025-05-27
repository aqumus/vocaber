import * as React from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, children }) => {
  if (!open) {
    return null;
  }

  // Basic implementation - a more robust dialog would use portals and focus management
  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/50", open ? "" : "hidden")}>
      {children}
    </div>
  );
};

interface DialogContentProps {
  children?: React.ReactNode;
  className?: string;
}

const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn("relative w-full max-w-lg rounded-lg border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full", className)}
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
    >
      {children}
    </div>
  );
};

interface DialogHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  className,
}) => { 
  return <div className={`mb-4 ${className}`}>{children}</div>;
}; 

interface DialogTitleProps {
  children?: React.ReactNode;
  className?: string;
}

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => {
  return <h2 className={cn("text-2xl font-semibold leading-none tracking-tight text-black", className)}>{children}</h2>;
};

interface DialogFooterProps {
  children?: React.ReactNode;
  className?: string;
}

const DialogFooter: React.FC<DialogFooterProps> = ({ children, className }) => {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>{children}</div>;
};

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter };