import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "flat" | "highlight";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({
  variant = "default",
  padding = "md",
  hover = false,
  className,
  children,
  ...props
}: CardProps) {
  const variants = {
    default: "bg-[#FFFDF9] border border-[#F0E4D7]",
    elevated: "bg-[#FFFDF9] border border-[#F0E4D7] shadow-[0_4px_24px_-4px_rgba(60,39,26,0.1)]",
    flat: "bg-[#FAF0DE] border border-[#F0E4D7]",
    highlight: "bg-gradient-to-br from-[#FAE5DB] to-[#FDF8F0] border border-[#F5C9B6]",
  };

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "rounded-2xl",
        variants[variant],
        paddings[padding],
        hover && "transition-all duration-200 hover:shadow-[0_8px_32px_-4px_rgba(60,39,26,0.14)] hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold text-[#3C271A]", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-[#AD7B54] mt-1", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-4 pt-4 border-t border-[#F0E4D7] flex items-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
