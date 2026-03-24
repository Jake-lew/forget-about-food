import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#3C271A] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-[#AD7B54] pointer-events-none">
              {icon}
            </div>
          )}
          {prefix && (
            <span className="absolute left-3.5 text-[#AD7B54] text-sm font-medium">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-xl border bg-[#FFFDF9] text-[#3C271A] placeholder-[#C7A07E] transition-all duration-200",
              "px-4 py-2.5 text-sm",
              "border-[#F0E4D7] focus:border-[#D96B3D] focus:ring-2 focus:ring-[#D96B3D]/20 focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#FAF0DE]",
              error && "border-red-400 focus:border-red-400 focus:ring-red-400/20",
              icon && "pl-10",
              prefix && "pl-8",
              suffix && "pr-10",
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3.5 text-[#AD7B54] text-sm">
              {suffix}
            </span>
          )}
        </div>
        {hint && !error && (
          <p className="mt-1 text-xs text-[#AD7B54]">{hint}</p>
        )}
        {error && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <span>⚠️</span> {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#3C271A] mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border bg-[#FFFDF9] text-[#3C271A] placeholder-[#C7A07E] transition-all duration-200",
            "px-4 py-3 text-sm resize-none",
            "border-[#F0E4D7] focus:border-[#D96B3D] focus:ring-2 focus:ring-[#D96B3D]/20 focus:outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-400 focus:border-red-400 focus:ring-red-400/20",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="mt-1 text-xs text-[#AD7B54]">{hint}</p>}
        {error && <p className="mt-1 text-xs text-red-500">⚠️ {error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
