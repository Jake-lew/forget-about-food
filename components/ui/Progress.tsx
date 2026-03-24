import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  variant = "default",
  size = "md",
  label,
  showValue = false,
  className,
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const trackColors = {
    default: "bg-[#F0E4D7]",
    success: "bg-green-100",
    warning: "bg-amber-100",
    danger: "bg-red-100",
  };

  const fillColors = {
    default: "bg-[#D96B3D]",
    success: "bg-green-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  };

  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-[#72492C]">{label}</span>}
          {showValue && (
            <span className="text-xs text-[#AD7B54]">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        className={cn("w-full rounded-full overflow-hidden", trackColors[variant], heights[size])}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            fillColors[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
