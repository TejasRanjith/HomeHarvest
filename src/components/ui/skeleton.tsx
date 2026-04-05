import { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "card" | "image";
}

const variantStyles: Record<string, string> = {
  text: "h-4 rounded animate-shimmer",
  circle: "rounded-full animate-shimmer",
  card: "rounded-2xl animate-shimmer",
  image: "rounded-xl animate-shimmer",
};

export function Skeleton({
  variant = "text",
  className = "",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={`bg-gray-200 ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}
