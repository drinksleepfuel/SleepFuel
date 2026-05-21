import {NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery | null;
  publicStoreDomain: string;
}

const FOOTER_COLUMNS = [
  {
    heading: 'Shop',
    links: [
      {label: 'SleepFuel Drink Mix', to: '/products/sleepfuel-drink-mix'},
      {label: 'Subscribe & Save', to: '/products/sleepfuel-drink-mix#subscribe'},
    ],
  },
  {
    heading: 'Company',
    links: [
      {label: 'About', to: '/about'},
      {label: 'FAQs', to: '/faq'},
    ],
  },
  {
    heading: 'Support',
    links: [
      {label: 'Contact', to: '/contact'},
      {label: 'Account', to: '/account'},
    ],
  },
];

const FDA_DISCLAIMER = `* These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure or prevent any disease.
Information on this site is provided for informational purposes only. It is not meant to substitute for medical advice from your physician or other medical professional. You should not use the information contained herein for diagnosing or treating a health problem or disease, or prescribing any medication. Carefully read all product documentation. If you have or suspect that you have a medical problem, promptly contact your regular health care provider.`;

export function Footer(_props: FooterProps) {
  return (
    <footer
      className="mt-auto"
      style={{background: 'var(--color-midnight)', color: '#fff'}}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div
              className="text-2xl font-semibold tracking-tight"
              style={{fontFamily: 'var(--font-display)'}}
            >
              SleepFuel<sup className="text-xs">®</sup>
            </div>
            <p
              className="mt-4 max-w-xs text-sm leading-relaxed"
              style={{color: 'var(--color-jet)'}}
            >
              A nightly drink mix engineered for deeper rest and better
              mornings.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3
                className="text-sm font-semibold uppercase tracking-wider"
                style={{color: 'var(--color-awaking)'}}
              >
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      prefetch="intent"
                      className="text-sm transition-opacity hover:opacity-100"
                      style={{color: 'var(--color-jet)'}}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 border-t pt-8 text-xs leading-relaxed"
          style={{borderColor: 'var(--color-recovery)', color: 'var(--color-jet)'}}
        >
          <p className="whitespace-pre-line">{FDA_DISCLAIMER}</p>
          <p className="mt-6 opacity-70">
            © {new Date().getFullYear()} SleepFuel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
