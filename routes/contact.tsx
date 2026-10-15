import type {Route} from './+types/contact';

const CONTACT_EMAIL = 'support@sleepfuel.co';

export const meta: Route.MetaFunction = () => [
  {title: 'Contact, Shipping & Returns — SleepFuel'},
  {
    name: 'description',
    content:
      'Get in touch with the SleepFuel team, and read how shipping and returns work.',
  },
  {rel: 'canonical', href: '/contact'},
];

export default function Contact() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
      <p className="text-sm font-medium uppercase tracking-wide text-[color:var(--color-muted)]">
        Support
      </p>
      <h1
        className="mt-2 text-[44px] font-normal leading-[1.05] tracking-tight sm:text-5xl"
        style={{fontFamily: 'var(--font-display)'}}
      >
        Contact, Shipping &amp; Returns
      </h1>

      <div className="mt-10 space-y-10">
        <Section title="Get in touch">
          <P>
            Email us at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline hover:text-[color:var(--color-blue)]"
            >
              {CONTACT_EMAIL}
            </a>{' '}
            and a real person will get back to you. Include your order number if
            you have one, so we can find you faster.
          </P>
        </Section>

        <Section title="Shipping">
          <List
            items={[
              'Orders ship within 1 to 2 business days from Texas.',
              'Free shipping on every subscription order.',
              'Free US shipping on one-time orders over $50.',
            ]}
          />
        </Section>

        <Section title="Returns">
          <List
            items={[
              'Return any unopened, unused package within 30 days of delivery for a full refund of the product price.',
              'For health and safety reasons, we can’t accept opened boxes or individual stick packs.',
              'Return shipping is paid by the customer, and original shipping charges are not refundable.',
              'If your order arrives damaged, defective, or wrong, we’ll replace it or refund you in full, shipping included. No need to send it back.',
              'Approved refunds go back to your original payment method within 5 to 10 business days.',
            ]}
          />
          <P>
            To start a return, email{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline hover:text-[color:var(--color-blue)]"
            >
              {CONTACT_EMAIL}
            </a>{' '}
            with your order number before sending anything back. For damaged or
            wrong items, include a photo. Read the full{' '}
            <a
              href="/policies/refund-policy"
              className="underline hover:text-[color:var(--color-blue)]"
            >
              refund policy
            </a>
            .
          </P>
        </Section>

        <Section title="Subscriptions">
          <P>
            Subscribe &amp; Save orders ship monthly at 15% off. You can skip,
            pause, or cancel anytime from your account page, in about two
            clicks. No emails or phone calls required.
          </P>
        </Section>

        <Section title="About the product">
          <P>
            SleepFuel is made in the USA in a GMPC Certified Facility. Every
            active ingredient and its exact dose is printed on the label. It is
            formulated for adults 18 and over. If you are pregnant, nursing, or
            taking prescription medication, talk to your doctor before use.
          </P>
        </Section>
      </div>
    </div>
  );
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section>
      <h2 className="text-2xl tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function P({children}: {children: React.ReactNode}) {
  return (
    <p className="leading-relaxed text-[color:var(--color-muted)]">{children}</p>
  );
}

function List({items}: {items: string[]}) {
  return (
    <ul className="list-disc space-y-2 pl-5 leading-relaxed text-[color:var(--color-muted)]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
