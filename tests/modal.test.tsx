import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { ProjectModalHost } from "../components/ProjectModalHost";
import { emit } from "../lib/bus";

afterEach(cleanup);

describe("ProjectModalHost", () => {
  it("opens the full dossier on bus event and closes on Escape", () => {
    render(<ProjectModalHost />);
    act(() => { emit("openProject", 3); });
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("SDSU Thrift Website")).toBeTruthy();
    expect(screen.getByText(/Led the development of a student marketplace/)).toBeTruthy();
    expect(screen.getByText(/Reduced page load time by 50%/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /view code/i }).getAttribute("href")).toBe(
      "https://github.com/leanneallen/sdsuthrift"
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
