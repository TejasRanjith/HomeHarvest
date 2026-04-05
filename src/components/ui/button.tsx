"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantStyles: Record<string, string> = {
  primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow hover:shadow-md focus:ring-[var(--primary)]",
  secondary:
    "bg-[var(--secondary)] text-white hover:bg-[var(--secondary-dark)] shadow hover:shadow-md focus:ring-[var(--secondary)]",
  outline:
    "bg-transparent border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white focus:ring-[var(--primary)]",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 hover:shadow-sm focus:ring-gray-400",
  danger: "bg-red-500 text-white hover:bg-red-600 shadow hover:shadow-md focus:ring-red-500",
};

const sizeStyles: Record<string, string> = {
  sm: "px-4 py-1.5 text-sm rounded-full",
  md: "px-6 py-2 text-sm rounded-full uppercase tracking-wider",
  lg: "px-8 py-3 text-base rounded-full uppercase tracking-wider",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      className = "",
      children,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        className={`
          inline-flex items-center justify-center font-semibold transition-all
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
