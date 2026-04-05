import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  default: "bg-gray-100 text-gray-800",
  success: "bg-[#8FBC8F] text-white",
  warning: "bg-[#E9C4A6] text-[#5C4033]",
  danger: "bg-red-500 text-white",
  info: "bg-blue-100 text-blue-800",
};

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
