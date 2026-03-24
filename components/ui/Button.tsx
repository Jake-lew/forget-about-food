"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "sage";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variants = {
      primary:
        "bg-[#D96B3D] text-white hover:bg-[#C05530] active:bg-[#9E4226] shadow-sm hover:shadow-warm focus-visible:ring-[#D96B3D]",
      secondary:
        "bg-[#FAE5DB] text-[#9E4226] hover:bg-[#F5C9B6] active:bg-[#EEAA8D] focus-visible:ring-[#D96B3D]",
      ghost:
        "bg-transparent text-[#72492C] hover:bg-[#FAE5DB] active:bg-[#F5C9B6] focus-visible:ring-[#D96B3D]",
      outline:
        "border-2 border-[#D96B3D] text-[#D96B3D] bg-transparent hover:bg-[#FAE5DB] active:bg-[#F5C9B6] focus-visible:ring-[#D96B3D]",
      danger:
        "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-500",
      sage: "bg-[#5A8A56] text-white hover:bg-[#466F42] active:bg-[#345531] focus-visible:ring-[#5A8A56]",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-5 py-3 gap-2",
      xl: "text-lg px-7 py-4 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children && <span>Loading…</span>}
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && icon}
            {children}
            {icon && iconPosition === "right" && icon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
