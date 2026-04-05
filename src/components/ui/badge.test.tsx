import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders without crashing", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toBeDefined();
  });

  it("renders default variant", () => {
    render(<Badge variant="default">Default</Badge>);
    expect(screen.getByText("Default")).toBeDefined();
  });

  it("renders success variant", () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText("Success")).toBeDefined();
  });

  it("renders warning variant", () => {
    render(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText("Warning")).toBeDefined();
  });

  it("renders danger variant", () => {
    render(<Badge variant="danger">Danger</Badge>);
    expect(screen.getByText("Danger")).toBeDefined();
  });

  it("renders info variant", () => {
    render(<Badge variant="info">Info</Badge>);
    expect(screen.getByText("Info")).toBeDefined();
  });
});
