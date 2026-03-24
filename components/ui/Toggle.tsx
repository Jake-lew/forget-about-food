"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
}: ToggleProps) {
  const sizes = {
    sm: { track: "w-9 h-5", thumb: "w-3.5 h-3.5", translate: "translate-x-4" },
    md: { track: "w-12 h-6", thumb: "w-4.5 h-4.5", translate: "translate-x-6" },
  };

  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-3", disabled && "opacity-50")}>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96B3D] focus-visible:ring-offset-2",
          s.track,
          checked ? "bg-[#D96B3D]" : "bg-[#DDB99A]",
          disabled && "cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "inline-block rounded-full bg-white shadow transition-transform duration-200",
            s.thumb,
            "translate-x-1",
            checked && s.translate
          )}
        />
      </button>
      {(label || description) && (
        <div>
          {label && (
            <p className="text-sm font-medium text-[#3C271A] cursor-default">{label}</p>
          )}
          {description && (
            <p className="text-xs text-[#AD7B54]">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start gap-3 cursor-pointer group",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            "w-5 h-5 rounded-md border-2 transition-all duration-150 flex items-center justify-center",
            checked
              ? "bg-[#D96B3D] border-[#D96B3D]"
              : "bg-white border-[#DDB99A] group-hover:border-[#D96B3D]"
          )}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
              <path d="M10 3L5 8.5 2 5.5l-1 1 4 4 6-6.5-1-1z" />
            </svg>
          )}
        </div>
      </div>
      {(label || description) && (
        <div>
          {label && (
            <p className="text-sm font-medium text-[#3C271A]">{label}</p>
          )}
          {description && (
            <p className="text-xs text-[#AD7B54] mt-0.5">{description}</p>
          )}
        </div>
      )}
    </label>
  );
}
