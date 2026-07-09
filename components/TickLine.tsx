type TickLineProps = { className?: string; delayMs?: number };

/** dex-ui AnimatedTickLine: hairline that grows open with end ticks (spec §9.2). */
export function TickLine({ className = "", delayMs = 0 }: TickLineProps) {
  return (
    <div
      aria-hidden
      className={`hairline h-px origin-center ${className}`}
      style={{
        animation: `tick-grow 0.4s var(--ease-overshoot) both`,
        animationDelay: `${delayMs}ms`,
      }}
    />
  );
}
