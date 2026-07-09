import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useTypewriter } from "../hooks/useTypewriter";
import { useLocalStorage } from "../hooks/useLocalStorage";

afterEach(cleanup);

describe("useTypewriter", () => {
  it("reveals text progressively and reports done", () => {
    vi.useFakeTimers();
    // Pin randomness so the burst logic is deterministic (no burst) — keeps the
    // 200ms checkpoint mid-reveal instead of intermittently completing early.
    const rnd = vi.spyOn(Math, "random").mockReturnValue(0.9);
    const { result } = renderHook(() => useTypewriter("HELLO WORLD", 40));
    expect(result.current.out).toBe("");
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current.out.length).toBeGreaterThan(0);
    expect(result.current.out.length).toBeLessThan(11);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.out).toBe("HELLO WORLD");
    expect(result.current.done).toBe(true);
    rnd.mockRestore();
    vi.useRealTimers();
  });
  it("skip() reveals everything at once", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTypewriter("HELLO", 10));
    act(() => { result.current.skip(); });
    expect(result.current.out).toBe("HELLO");
    expect(result.current.done).toBe(true);
    vi.useRealTimers();
  });
});

describe("useLocalStorage", () => {
  it("reads and writes", () => {
    const { result } = renderHook(() => useLocalStorage("jb-test"));
    act(() => { result.current[1]("abc"); });
    expect(result.current[0]).toBe("abc");
    expect(localStorage.getItem("jb-test")).toBe("abc");
  });
});
