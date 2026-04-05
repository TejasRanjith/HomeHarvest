import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchBar } from "./search-bar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("SearchBar", () => {
  it("renders without crashing", () => {
    render(<SearchBar initialValue="" />);
    expect(screen.getByRole("textbox")).toBeDefined();
  });

  it("has correct aria-label", () => {
    render(<SearchBar initialValue="" />);
    expect(screen.getByLabelText("Search products")).toBeDefined();
  });

  it("shows initial value", () => {
    render(<SearchBar initialValue="tomatoes" />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("tomatoes");
  });
});
