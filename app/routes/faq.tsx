import {useState} from 'react';
import type {Route} from './+types/faq';

export const meta: Route.MetaFunction = () => [
  {title: 'FAQs — SleepFuel'},
  {
    name: 'description',
    content: 'Common questions about SleepFuel Drink Mix, ingredients, and subscriptions.',
  },
];

type FAQ = {q: string; a: string};

const SECTIONS: Array<{heading: string; faqs: FAQ[]}> = [
  {
    heading: 'Getting started',
    faqs: [
      {
        q: 'What is SleepFuel?',
        a: 'SleepFuel is a doctor-formulated nightly drink mix that helps you fall asleep faster, stay asleep longer, and wake up feeling clear. One mixed-berry stick, mixed into water 30 minutes before bed.',
      },
      {
        q: 'When should I take it?',
        a: 'About 30 minutes before bed. Some people prefer to take it as part of a wind-down ritual — dim the lights, no screens, a glass of SleepFuel, and a book.',
      },
      {
        q: 'How long until I feel a difference?',
        a: 'Most people notice deeper sleep within 3–5 nights. The full picture — falling asleep faster, fewer night wakings, clearer mornings — typically settles in over 2–3 weeks of consistent use.',
      },
    ],
  },
  {
    heading: 'Ingredients & safety',
    faqs: [
      {
        q: 'What’s in SleepFuel?',
        a: 'Five evidence-backed ingredients: 300mg magnesium glycinate, 200mg L-theanine, 0.5mg melatonin, 3g glycine, and 1.5mg vitamin B6. Mixed-berry natural flavor. No sugar, no artificial colors.',
      },
      {
        q: 'Is the melatonin dose low?',
        a: 'Yes, intentionally. Research consistently shows that low doses (0.3–1mg) match the body’s natural melatonin signal better than the 5–10mg megadoses found in most gummies, with fewer morning side effects.',
      },
      {
        q: 'Is it safe to take every night?',
        a: 'SleepFuel is formulated for nightly use. None of the ingredients are habit-forming. As with any supplement, talk to your doctor if you’re pregnant, nursing, taking medications, or have a medical condition.',
      },
      {
        q: 'Will I wake up groggy?',
        a: 'That’s the most common feedback we hear — people are surprised by how clear they feel. Because we use a low melatonin dose and no sedating ingredients, you wake up rested, not knocked out.',
      },
    ],
  },
  {
    heading: 'Subscription & shipping',
    faqs: [
      {
        q: 'How does Subscribe & Save work?',
        a: 'Subscribe and get 20% off every order. We ship a fresh box on a monthly cadence (you can change the frequency anytime). You can pause, skip, or cancel from your account in two clicks — no calling, no friction.',
      },
      {
        q: 'Can I switch between the 10-pack and 30-pack?',
        a: 'Yes, anytime. Just edit your subscription from your account dashboard.',
      },
      {
        q: 'Where do you ship?',
        a: 'We currently ship anywhere in the US. International shipping is in the works — drop your email and we’ll let you know when it lights up in your region.',
      },
      {
        q: 'How long does shipping take?',
        a: 'Orders ship within 1 business day. Standard US delivery is 3–5 business days. Free shipping on every order.',
      },
      {
        q: 'What’s your return policy?',
        a: 'If SleepFuel isn’t working for you, we’ll refund your first box — no questions asked. Email support@sleepfuel.com and we’ll handle it.',
      },
    ],
  },
];

export default function FAQ() {
  return (
    <>
      <section
        style={{background: 'var(--color-neutral)'}}
        className="py-24"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p
            className="text-sm font-semibold uppercase tracking-[0.3em]"
            style={{color: 'var(--color-recovery)'}}
          >
            FAQs
          </p>
          <h1
            className="mt-4 text-5xl font-semibold leading-tight tracking-tight sm:text-6xl"
            style={{fontFamily: 'var(--font-display)', color: 'var(--color-midnight)'}}
          >
            Everything you wanted to know
            <br />
            <span style={{color: 'var(--color-recovery)'}}>about better sleep.</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <h2
                className="text-2xl font-semibold"
                style={{fontFamily: 'var(--font-display)', color: 'var(--color-midnight)'}}
              >
                {section.heading}
              </h2>
              <div className="mt-6 divide-y divide-[color:var(--color-jet)]">
                {section.faqs.map((faq) => (
                  <FAQItem key={faq.q} faq={faq} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-20 rounded-3xl p-8 text-center"
          style={{background: 'var(--color-midnight)', color: '#fff'}}
        >
          <h3
            className="text-2xl font-semibold"
            style={{fontFamily: 'var(--font-display)'}}
          >
            Still have questions?
          </h3>
          <p className="mt-2" style={{color: 'var(--color-jet)'}}>
            Our team usually replies the same day.
          </p>
          <a
            href="mailto:support@sleepfuel.com"
            className="mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 font-medium"
            style={{background: 'var(--color-awaking)', color: 'var(--color-midnight)'}}
          >
            support@sleepfuel.com
          </a>
        </div>
      </section>
    </>
  );
}

function FAQItem({faq}: {faq: FAQ}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-6 text-left"
        aria-expanded={open}
      >
        <span className="text-lg font-medium" style={{color: 'var(--color-midnight)'}}>
          {faq.q}
        </span>
        <span
          className={`mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform ${
            open ? 'rotate-45' : ''
          }`}
          style={{background: 'var(--color-neutral)', color: 'var(--color-midnight)'}}
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 1v12M1 7h12" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="mt-3 max-w-prose pr-12 text-[color:var(--color-recovery)]">
          {faq.a}
        </p>
      )}
    </div>
  );
}
