import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "./product-card";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: {
      children: React.ReactNode;
      className?: string;
    }) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    button: ({
      children,
      className,
      ...props
    }: {
      children: React.ReactNode;
      className?: string;
    }) => (
      <button className={className} {...props}>
        {children}
      </button>
    ),
    span: ({
      children,
      className,
      ...props
    }: {
      children: React.ReactNode;
      className?: string;
    }) => (
      <span className={className} {...props}>
        {children}
      </span>
    ),
    svg: ({
      children,
      className,
      ...props
    }: {
      children: React.ReactNode;
      className?: string;
    }) => (
      <svg className={className} {...props}>
        {children}
      </svg>
    ),
    path: ({ ...props }: Record<string, unknown>) => <path {...props} />,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/hooks/use-cart", () => ({
  useCart: () => ({ addItem: vi.fn() }),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

vi.mock("@/lib/supabase", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({ data: [], error: null }),
      delete: () => ({
        eq: () => ({ eq: () => ({ data: null, error: null }) }),
      }),
      insert: () => ({ data: null, error: null }),
    }),
    auth: { getUser: () => ({ data: { user: null }, error: null }) },
  }),
}));

vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

const mockProduct = {
  id: "test-product-1",
  name: "Fresh Tomatoes",
  name_ml: "ചുവന്ന തക്കാളി",
  description: "Organic farm fresh tomatoes",
  price: 40,
  unit: "kg",
  stock_quantity: 50,
  is_available: true,
  is_featured: false,
  min_order_quantity: 1,
  category_id: "cat-1",
  vendor_id: "vendor-1",
  image_urls: ["https://example.com/tomato.jpg"],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  vendor: {
    id: "vendor-1",
    vendor_name: "Green Farms",
    full_name: "John Doe",
    vendor_verified: false,
  },
};

describe("ProductCard", () => {
  it("renders without crashing", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByAltText("Fresh Tomatoes")).toBeDefined();
  });

  it("shows product image with correct alt", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByAltText("Fresh Tomatoes")).toBeDefined();
  });

  it("shows in stock status when available", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("In Stock")).toBeDefined();
  });

  it("shows out of stock when not available", () => {
    const outOfStockProduct = { ...mockProduct, is_available: false };
    render(<ProductCard product={outOfStockProduct} />);
    expect(screen.getByText("Out of Stock")).toBeDefined();
  });

  it("shows Add to Cart button", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Add to Cart")).toBeDefined();
  });
});
