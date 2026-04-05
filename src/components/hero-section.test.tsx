import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "./hero-section";

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
    h1: ({
      children,
      className,
      ...props
    }: {
      children: React.ReactNode;
      className?: string;
    }) => (
      <h1 className={className} {...props}>
        {children}
      </h1>
    ),
    p: ({
      children,
      className,
      ...props
    }: {
      children: React.ReactNode;
      className?: string;
    }) => (
      <p className={className} {...props}>
        {children}
      </p>
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
    section: ({
      children,
      className,
      ...props
    }: {
      children: React.ReactNode;
      className?: string;
    }) => (
      <section className={className} {...props}>
        {children}
      </section>
    ),
  },
  useScroll: () => ({ scrollYProgress: 0 }),
  useTransform: () => 0,
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("HeroSection", () => {
  it("renders without crashing", () => {
    render(<HeroSection />);
    expect(screen.getAllByText("Farm Fresh").length).toBeGreaterThanOrEqual(1);
  });

  it("shows main heading", () => {
    render(<HeroSection />);
    expect(screen.getByText("Delivered Daily")).toBeDefined();
  });

  it("shows Thrissur Kerala badge", () => {
    render(<HeroSection />);
    expect(screen.getByText("Thrissur, Kerala")).toBeDefined();
  });

  it("shows feature cards", () => {
    render(<HeroSection />);
    expect(screen.getByText("Fast Delivery")).toBeDefined();
    expect(screen.getByText("Organic")).toBeDefined();
    expect(screen.getByText("Easy Order")).toBeDefined();
  });
});
