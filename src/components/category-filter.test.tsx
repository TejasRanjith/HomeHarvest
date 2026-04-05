import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryFilter } from "./category-filter";

vi.mock("framer-motion", () => ({
  motion: {
    button: ({
      children,
      className,
      onClick,
    }: {
      children: React.ReactNode;
      className?: string;
      onClick?: () => void;
    }) => (
      <button className={className} onClick={onClick}>
        {children}
      </button>
    ),
    div: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => <div className={className}>{children}</div>,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockCategories = [
  {
    id: "1",
    name: "Vegetables",
    name_ml: "പച്ചക്കറികൾ",
    slug: "thrissur-chantha-vegetables",
    description: "Fresh vegetables",
    image_url: "",
    sort_order: 1,
    is_active: true,
    created_at: "2026-01-01",
  },
  {
    id: "2",
    name: "Rice & Grains",
    name_ml: "അരി",
    slug: "palakkad-rice-grains",
    description: "Rice and grains",
    image_url: "",
    sort_order: 2,
    is_active: true,
    created_at: "2026-01-01",
  },
];

describe("CategoryFilter", () => {
  it("renders without crashing", () => {
    render(
      <CategoryFilter categories={mockCategories} activeCategory={null} />,
    );
    expect(screen.getByText(/All/)).toBeDefined();
  });

  it("shows category names", () => {
    render(
      <CategoryFilter categories={mockCategories} activeCategory={null} />,
    );
    expect(screen.getByText("Vegetables")).toBeDefined();
    expect(screen.getByText("Rice & Grains")).toBeDefined();
  });
});
