"use client";
import { Component, type ReactNode } from "react";

type Props = { fallbackLabel: string; children: ReactNode };
type State = { failed: boolean };

/** A dead widget must never kill the cockpit (spec §14). */
export class WidgetBoundary extends Component<Props, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full min-h-[6vh] items-center justify-center border border-dashed border-accent/30 font-term text-[max(1.1vh,10px)] tracking-widest text-accent/50">
          {this.props.fallbackLabel}
        </div>
      );
    }
    return this.props.children;
  }
}
