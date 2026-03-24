"use client";

import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  emoji?: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  hint?: string;
  maxItems?: number;
  columns?: 2 | 3 | 4;
}

export function MultiSelect({
  options,
  value,
  onChange,
  label,
  hint,
  maxItems,
  columns = 3,
}: MultiSelectProps) {
  const toggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      if (maxItems && value.length >= maxItems) return;
      onChange([...value, optValue]);
    }
  };

  const colClasses = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#3C271A] mb-2">
          {label}
          {maxItems && (
            <span className="ml-2 text-xs text-[#AD7B54] font-normal">
              (select up to {maxItems})
            </span>
          )}
        </label>
      )}
      <div className={cn("grid gap-2", colClasses[columns])}>
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          const disabled = !selected && maxItems !== undefined && value.length >= maxItems;

          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => toggle(opt.value)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150",
                "text-left w-full",
                selected
                  ? "bg-[#FAE5DB] border-[#D96B3D] text-[#9E4226] shadow-sm"
                  : "bg-[#FFFDF9] border-[#F0E4D7] text-[#72492C] hover:border-[#DDB99A] hover:bg-[#FAF0DE]",
                disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {opt.emoji && <span className="text-base leading-none">{opt.emoji}</span>}
              <span className="flex-1 truncate">{opt.label}</span>
              {selected && (
                <svg
                  className="w-4 h-4 text-[#D96B3D] flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      {hint && (
        <p className="mt-2 text-xs text-[#AD7B54]">{hint}</p>
      )}
    </div>
  );
}
