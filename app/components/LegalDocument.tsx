import {Link} from 'react-router';

/**
 * Shared layout for Shopify policies and pages, matching the hand built
 * Privacy Policy and Contact pages: eyebrow, display heading, readable
 * column. Body HTML comes from Shopify and is styled by `.legal-body` in
 * app.css; run it through `formatLegalHtml` first.
 */
export function LegalDocument({
  eyebrow,
  title,
  html,
  backLink,
}: {
  eyebrow?: string;
  title: string;
  html: string;
  backLink?: {to: string; label: string};
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
      {backLink ? (
        <div className="mb-8">
          <Link
            to={backLink.to}
            prefetch="intent"
            className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
          >
            ← {backLink.label}
          </Link>
        </div>
      ) : null}
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-wide text-[color:var(--color-muted)]">
          {eyebrow}
        </p>
      ) : null}
      <h1
        className="mt-2 text-[44px] font-normal leading-[1.05] tracking-tight sm:text-5xl"
        style={{fontFamily: 'var(--font-display)'}}
      >
        {title}
      </h1>

      <div
        className="legal-body mt-10"
        dangerouslySetInnerHTML={{__html: html}}
      />
    </div>
  );
}
