/**
 * Continuous scrolling promo bar at the very top of every page.
 * Update the messages below to change what runs across the top.
 * CSS lives in app/styles/app.css (`.sf-ticker*` + `@keyframes sf-ticker-scroll`).
 */
const TICKER_MESSAGES = [
  'Free US shipping on orders $50+',
  'Subscribe & Save 20% — cancel anytime',
  '6 evidence-backed ingredients',
  'Fall asleep faster. Wake up clear.',
  'Powered by Magnesium, L-Theanine + micro-dose Melatonin',
];

export function PromoTicker() {
  return (
    <div
      className="sf-ticker relative z-40"
      style={{
        background: 'var(--color-midnight)',
        color: 'rgba(255, 255, 255, 0.92)',
      }}
      aria-label="Announcements"
    >
      <div className="sf-ticker-track py-2.5 sm:py-3">
        <TickerRow />
        <TickerRow ariaHidden />
      </div>
    </div>
  );
}

function TickerRow({ariaHidden = false}: {ariaHidden?: boolean}) {
  return (
    <ul
      className="flex shrink-0 items-center gap-10 pr-10 text-[11px] font-medium uppercase tracking-[0.18em] sm:text-xs"
      aria-hidden={ariaHidden || undefined}
    >
      {TICKER_MESSAGES.map((msg, i) => (
        <li key={i} className="flex shrink-0 items-center gap-10">
          <span>{msg}</span>
          <span className="opacity-40" aria-hidden="true">
            •
          </span>
        </li>
      ))}
    </ul>
  );
}
