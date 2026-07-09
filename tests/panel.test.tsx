import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Panel } from "../components/Panel";
import { WidgetBoundary } from "../components/WidgetBoundary";

afterEach(cleanup);

function Bomb(): never {
  throw new Error("boom");
}

describe("Panel", () => {
  it("renders two-part title and children with stagger index", () => {
    const { container } = render(
      <Panel index={3} titleLeft="PANEL" titleRight="SYSTEM">
        <p>body</p>
      </Panel>
    );
    expect(screen.getByText("PANEL")).toBeTruthy();
    expect(screen.getByText("SYSTEM")).toBeTruthy();
    expect(screen.getByText("body")).toBeTruthy();
    const root = container.querySelector("section")!;
    expect(root.getAttribute("style")).toContain("--i: 3");
    expect(root.getAttribute("data-augmented-ui")).toBeTruthy();
  });
});

describe("WidgetBoundary", () => {
  it("catches render errors and shows on-brand fallback", () => {
    render(
      <WidgetBoundary fallbackLabel="GLOBE OFFLINE">
        <Bomb />
      </WidgetBoundary>
    );
    expect(screen.getByText("GLOBE OFFLINE")).toBeTruthy();
  });
});
