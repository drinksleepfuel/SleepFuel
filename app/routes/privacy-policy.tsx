import type {Route} from './+types/privacy-policy';

const EFFECTIVE_DATE = 'May 29, 2026';
const CONTACT_EMAIL = 'support@sleepfuel.co';

export const meta: Route.MetaFunction = () => [
  {title: 'Privacy Policy — SleepFuel'},
  {
    name: 'description',
    content:
      'How SleepFuel collects, uses, and protects your personal information.',
  },
  {rel: 'canonical', href: '/privacy-policy'},
];

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
      <p className="text-sm font-medium uppercase tracking-wide text-[color:var(--color-muted)]">
        Legal
      </p>
      <h1
        className="mt-2 text-[44px] font-normal leading-[1.05] tracking-tight sm:text-5xl"
        style={{fontFamily: 'var(--font-display)'}}
      >
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm text-[color:var(--color-muted)]">
        Last updated: {EFFECTIVE_DATE}
      </p>

      <div className="mt-10 space-y-10">
        <Lead>
          This Privacy Policy explains how SleepFuel (&ldquo;SleepFuel,&rdquo;
          &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects,
          uses, and shares information about you when you visit our website,
          purchase our products, or otherwise interact with us. By using our
          site, you agree to the practices described below.
        </Lead>

        <Section title="Information we collect">
          <P>We collect the following categories of information:</P>
          <List
            items={[
              'Information you provide — such as your name, email address, shipping and billing address, phone number, and order details when you create an account, place an order, or subscribe to our emails.',
              'Payment information — processed securely by our payment provider. We do not store full payment card numbers on our servers.',
              'Automatically collected data — such as your IP address, device and browser type, pages viewed, and referring URLs, gathered through cookies and similar technologies.',
            ]}
          />
        </Section>

        <Section title="How we use your information">
          <P>We use the information we collect to:</P>
          <List
            items={[
              'Process and fulfill your orders and subscriptions, and send related confirmations.',
              'Provide customer support and respond to your requests.',
              'Send you marketing communications, where permitted, and let you opt out at any time.',
              'Improve our products, website, and overall customer experience.',
              'Detect, prevent, and address fraud, security issues, and technical problems.',
              'Comply with our legal obligations.',
            ]}
          />
        </Section>

        <Section title="How we share your information">
          <P>
            We do not sell your personal information. We share it only with:
          </P>
          <List
            items={[
              'Service providers who help us operate our business — including payment processors, shipping carriers, email platforms, and analytics providers — under contracts that require them to protect your data.',
              'Legal and safety recipients, when required to comply with applicable law, regulation, legal process, or enforceable governmental request.',
              'A successor entity in connection with a merger, acquisition, or sale of assets.',
            ]}
          />
        </Section>

        <Section title="Cookies and tracking">
          <P>
            We use cookies and similar technologies to keep your cart working,
            remember your preferences, measure site performance, and support
            marketing. You can control cookies through your browser settings,
            though disabling them may affect how the site functions.
          </P>
        </Section>

        <Section title="Data retention">
          <P>
            We retain your information for as long as needed to provide our
            services, comply with our legal obligations, resolve disputes, and
            enforce our agreements. When information is no longer required, we
            delete or anonymize it.
          </P>
        </Section>

        <Section title="Data security">
          <P>
            We use reasonable administrative, technical, and physical safeguards
            designed to protect your information. However, no method of
            transmission or storage is completely secure, and we cannot
            guarantee absolute security.
          </P>
        </Section>

        <Section title="Your rights and choices">
          <P>
            Depending on where you live, you may have the right to access,
            correct, or delete your personal information, or to object to or
            restrict certain processing. You can also unsubscribe from marketing
            emails at any time using the link in each message. To exercise these
            rights, contact us using the details below.
          </P>
        </Section>

        <Section title="Children's privacy">
          <P>
            Our products and website are not directed to children under 13, and
            we do not knowingly collect personal information from them. If you
            believe a child has provided us information, please contact us so we
            can remove it.
          </P>
        </Section>

        <Section title="Third-party links">
          <P>
            Our site may link to third-party websites and services that we do
            not control. This Privacy Policy does not apply to those sites, and
            we encourage you to review their privacy practices.
          </P>
        </Section>

        <Section title="Changes to this policy">
          <P>
            We may update this Privacy Policy from time to time. When we do, we
            will revise the &ldquo;Last updated&rdquo; date above. Material
            changes will be communicated as required by law.
          </P>
        </Section>

        <Section title="Contact us">
          <P>
            If you have questions about this Privacy Policy or how we handle your
            information, contact us at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-[color:var(--color-blue)] underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </P>
        </Section>

        <p className="border-t border-[color:var(--color-border)] pt-8 text-xs leading-relaxed text-[color:var(--color-muted)]">
          This page is provided as a general template and does not constitute
          legal advice. Please review it with a qualified attorney to ensure it
          fits your business and complies with the laws that apply to you.
        </p>
      </div>
    </div>
  );
}

function Lead({children}: {children: React.ReactNode}) {
  return (
    <p className="text-lg leading-relaxed text-[color:var(--color-ink)]">
      {children}
    </p>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-medium tracking-tight text-[color:var(--color-ink)]">
        {title}
      </h2>
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
