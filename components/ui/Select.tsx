import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
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
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-xl border bg-[#FFFDF9] text-[#3C271A] appearance-none pr-10",
              "px-4 py-2.5 text-sm cursor-pointer",
              "border-[#F0E4D7] focus:border-[#D96B3D] focus:ring-2 focus:ring-[#D96B3D]/20 focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-400",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#AD7B54]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {hint && !error && <p className="mt-1 text-xs text-[#AD7B54]">{hint}</p>}
        {error && <p className="mt-1 text-xs text-red-500">⚠️ {error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
