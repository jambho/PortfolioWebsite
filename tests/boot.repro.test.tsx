import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen, waitFor } from "@testing-library/react";
import { BootSequence } from "../components/BootSequence";
import { buildBootLog } from "../lib/bootLog";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-booting");
});

// Uses REAL timers so React's async update batching runs the setLines updater
// on a later tick — the condition that surfaced the live `startsWith of
// undefined` crash (stale mutable `i` captured by the updater closure).
describe("BootSequence log typing (regression: stale-index crash)", () => {
  it("renders real boot lines in order with no undefined slots", async () => {
    (Element.prototype as unknown as { scrollTo: () => void }).scrollTo = () => {};
    document.documentElement.setAttribute("data-booting", "1");
    const log = buildBootLog();

    render(<BootSequence />);

    // First typed line must be the actual first boot-log entry, not all[1].
    await waitFor(
      () => expect(screen.getByText(log[0])).toBeTruthy(),
      { timeout: 2000 }
    );

    // A few lines in, they must still match the source array exactly (order + value).
    await waitFor(
      () => expect(screen.getByText(log[3])).toBeTruthy(),
      { timeout: 2000 }
    );

    // The bug rendered a literal "undefined" line (all[length]).
    expect(screen.queryByText("undefined")).toBeNull();
  });
});
