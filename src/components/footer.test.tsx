import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./footer";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className} data-testid="footer-link">
      {children}
    </a>
  ),
}));

vi.mock("@/components/language-toggle", () => ({
  LanguageToggle: () => <button aria-label="Toggle language">EN / ML</button>,
}));

describe("Footer", () => {
  it("renders without crashing", () => {
    render(<Footer />);
    expect(screen.getByText("HomeHarvest")).toBeDefined();
  });

  it("shows brand name and tagline", () => {
    render(<Footer />);
    expect(screen.getByText("HomeHarvest")).toBeDefined();
    expect(screen.getByText("Farm Fresh, Delivered Local")).toBeDefined();
  });

  it("shows Thrissur Kerala badge", () => {
    render(<Footer />);
    expect(screen.getByText("Thrissur, Kerala")).toBeDefined();
  });

  it("shows quick links", () => {
    render(<Footer />);
    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Browse Products")).toBeDefined();
    expect(screen.getByText("My Orders")).toBeDefined();
    expect(screen.getByText("My Favourites")).toBeDefined();
  });

  it("shows vendor links", () => {
    render(<Footer />);
    expect(screen.getByText("Vendor Dashboard")).toBeDefined();
    expect(screen.getByText("List Products")).toBeDefined();
    expect(screen.getByText("Vendor FAQ")).toBeDefined();
  });

  it("shows support links", () => {
    render(<Footer />);
    expect(screen.getByText("Contact Us")).toBeDefined();
    expect(screen.getByText("Terms of Service")).toBeDefined();
    expect(screen.getByText("Privacy Policy")).toBeDefined();
    expect(screen.getByText("Help Center")).toBeDefined();
  });

  it("shows copyright text", () => {
    render(<Footer />);
    expect(screen.getByText(/2026 HomeHarvest/)).toBeDefined();
  });
});
