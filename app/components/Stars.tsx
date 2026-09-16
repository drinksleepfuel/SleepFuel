/**
 * Star row used by the review section and the buy-box summary.
 * Renders half-stars via a clipped overlay so 4.53 reads honestly.
 */
export function Stars({
  rating,
  size = 16,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(5, rating));

  return (
    <span
      className={`inline-flex items-center${className ? ` ${className}` : ''}`}
      role="img"
      aria-label={`${clamped.toFixed(1)} out of 5 stars`}
    >
      <span className="relative inline-flex">
        <span className="inline-flex text-[color:var(--color-border)]">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={size} />
          ))}
        </span>
        <span
          className="absolute inset-0 inline-flex overflow-hidden text-[#f5a623]"
          style={{width: `${(clamped / 5) * 100}%`}}
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={size} />
          ))}
        </span>
      </span>
    </span>
  );
}

function Star({size}: {size: number}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77 4.8 17.5l.99-5.78-4.21-4.1 5.82-.85z" />
    </svg>
  );
}

/**
 * Thousands separator that is identical on the server and in the browser.
 * `Number.toLocaleString()` resolves locale data differently in the worker
 * runtime than in the browser, which produced a hydration mismatch.
 */
export function formatCount(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
