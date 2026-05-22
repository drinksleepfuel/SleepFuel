import {useState} from 'react';
import type {Route} from './+types/products.$handle';
import {Analytics} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {StickyAddToCart} from '~/components/StickyAddToCart';
import {useAside} from '~/components/Aside';
import {
  PRODUCT,
  SELLING_PLAN_IDS,
  SUBSCRIBE_DISCOUNT,
  VARIANTS,
  formatPrice,
  priceFor,
  type PackKey,
  type PurchaseMode,
} from '~/lib/sleepfuelProduct';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'SleepFuel Drink Mix — Mixed Berry Sleep Supplement'},
    {name: 'description', content: PRODUCT.tagline},
    {rel: 'canonical', href: `/products/${PRODUCT.handle}`},
  ];
};

export async function loader(_args: Route.LoaderArgs) {
  return {};
}

export default function ProductPage() {
  const [packKey, setPackKey] = useState<PackKey>('pack10');
  const [mode, setMode] = useState<PurchaseMode>('subscribe');

  return (
    <>
      <Hero
        packKey={packKey}
        setPackKey={setPackKey}
        mode={mode}
        setMode={setMode}
      />
      <FeatureCallouts />
      <FAQSection />

      <StickyAddToCart packKey={packKey} mode={mode} />

      <Analytics.ProductView
        data={{
          products: [
            {
              id: VARIANTS[packKey].merchandiseId,
              title: PRODUCT.title,
              price: String(priceFor(packKey, mode).final),
              vendor: 'SleepFuel',
              variantId: VARIANTS[packKey].merchandiseId,
              variantTitle: VARIANTS[packKey].label,
              quantity: 1,
            },
          ],
        }}
      />
    </>
  );
}

/* ============================================================
   Hero — product image bleeds off the left edge; buy box right
   ============================================================ */

function Hero({
  packKey,
  setPackKey,
  mode,
  setMode,
}: {
  packKey: PackKey;
  setPackKey: (k: PackKey) => void;
  mode: PurchaseMode;
  setMode: (m: PurchaseMode) => void;
}) {
  const {open} = useAside();
  const variant = VARIANTS[packKey];
  const {base, final} = priceFor(packKey, mode);
  const showStrike = mode === 'subscribe';
  const sellingPlanId =
    mode === 'subscribe' ? SELLING_PLAN_IDS[packKey] : undefined;

  return (
    <section className="grid items-stretch lg:grid-cols-[1.05fr_1fr]">
      {/* Left: full-bleed product image (touches the left viewport edge) */}
      <div className="relative min-h-[52vh] lg:min-h-[88vh]">
        <HeroVisual />
      </div>

      {/* Right: buy box */}
      <div className="flex items-center px-5 py-12 sm:px-8 lg:px-14 lg:py-20">
        <div className="mx-auto w-full max-w-md">
          <p className="text-sm font-medium text-[color:var(--color-muted)]">
            SleepFuel Drink Mix · Mixed Berry
          </p>
          <h1 className="mt-2 text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            {PRODUCT.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[color:var(--color-muted)]">
            {PRODUCT.tagline}
          </p>

          {/* Pack selector */}
          <fieldset className="mt-8">
            <legend className="text-sm font-medium text-[color:var(--color-ink)]">
              Choose your size
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(['pack10', 'pack30'] as PackKey[]).map((k) => {
                const v = VARIANTS[k];
                const p = priceFor(k, mode);
                const selected = packKey === k;
                const recommended = k === 'pack30';
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setPackKey(k)}
                    aria-pressed={selected}
                    className={`relative rounded-2xl border bg-white p-4 text-left transition-all ${
                      selected
                        ? 'border-[color:var(--color-ink)] ring-1 ring-[color:var(--color-ink)]'
                        : 'border-[color:var(--color-border)] hover:border-[color:var(--color-muted)]'
                    }`}
                  >
                    {recommended && (
                      <span className="absolute -top-2 right-3 rounded-full bg-[color:var(--color-blue)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Best value
                      </span>
                    )}
                    <span className="block text-sm font-semibold">
                      {v.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-[color:var(--color-muted)]">
                      {formatPrice(p.final / v.servings)}/night
                    </span>
                    <span className="mt-2 block text-base font-semibold">
                      {showStrike && (
                        <span className="mr-1 text-sm font-normal text-[color:var(--color-muted)] line-through">
                          {formatPrice(p.base)}
                        </span>
                      )}
                      {formatPrice(p.final)}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Purchase mode */}
          <fieldset className="mt-4 overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-white">
            <label
              className={`flex cursor-pointer items-start gap-3 p-4 ${
                mode === 'subscribe' ? '' : 'opacity-70'
              }`}
            >
              <input
                type="radio"
                name="mode"
                checked={mode === 'subscribe'}
                onChange={() => setMode('subscribe')}
                className="mt-1 accent-[color:var(--color-blue)]"
              />
              <span className="flex-1">
                <span className="flex items-center gap-2">
                  <strong className="text-sm">Subscribe &amp; Save</strong>
                  <span className="rounded-full bg-[color:var(--color-sand)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-ink)]">
                    Save {Math.round(SUBSCRIBE_DISCOUNT * 100)}%
                  </span>
                </span>
                <span className="mt-0.5 block text-sm text-[color:var(--color-muted)]">
                  Delivered monthly. Cancel anytime.
                </span>
              </span>
            </label>
            <div className="border-t border-[color:var(--color-border)]" />
            <label
              className={`flex cursor-pointer items-start gap-3 p-4 ${
                mode === 'onetime' ? '' : 'opacity-70'
              }`}
            >
              <input
                type="radio"
                name="mode"
                checked={mode === 'onetime'}
                onChange={() => setMode('onetime')}
                className="mt-1 accent-[color:var(--color-blue)]"
              />
              <span className="flex-1">
                <strong className="text-sm">One-time purchase</strong>
                <span className="mt-0.5 block text-sm text-[color:var(--color-muted)]">
                  No subscription. Pay full price.
                </span>
              </span>
            </label>
          </fieldset>

          {/* Add to cart */}
          <AddToCartButton
            analytics={{type: 'hero-cta', packKey, mode}}
            lines={[
              {
                merchandiseId: variant.merchandiseId,
                quantity: 1,
                ...(sellingPlanId ? {sellingPlanId} : {}),
              },
            ]}
            onClick={() => open('cart')}
            className="btn-blue mt-6 w-full text-base"
          >
            Add to Cart —{' '}
            {showStrike && (
              <span className="ml-1 text-white/60 line-through">
                {formatPrice(base)}
              </span>
            )}{' '}
            {formatPrice(final)}
          </AddToCartButton>

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[color:var(--color-muted)]">
            <li className="flex items-center gap-1.5">
              <Check /> Free US shipping
            </li>
            <li className="flex items-center gap-1.5">
              <Check /> Cancel anytime
            </li>
            <li className="flex items-center gap-1.5">
              <Check /> 100% money-back
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div
      className="absolute inset-0 h-full w-full overflow-hidden"
      style={{
        background:
          'radial-gradient(120% 90% at 25% 25%, #3a4a6e 0%, #232a3f 45%, #14161f 100%)',
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white/90">
          <div className="text-xs uppercase tracking-[0.4em] text-white/60">
            SleepFuel
          </div>
          <div className="mt-3 text-6xl leading-none tracking-tight sm:text-7xl">
            Sleep
            <br />
            Mix
          </div>
          <div className="mt-4 text-xs uppercase tracking-[0.4em] text-white/60">
            Mixed Berry
          </div>
        </div>
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ============================================================
   3 feature callouts with images
   ============================================================ */

function FeatureCallouts() {
  const features = [
    {
      eyebrow: 'Engineered in every way',
      title: 'Deep sleep, by design',
      copy: 'Five evidence-backed actives at clinical doses — magnesium, L-theanine, glycine, B6, and a low, body-clock-friendly dose of melatonin.',
      gradient:
        'radial-gradient(120% 100% at 30% 20%, #4a5578 0%, #2a3147 55%, #181b27 100%)',
    },
    {
      eyebrow: 'Mixed berry like you’ve never tasted',
      title: 'Actually delicious',
      copy: 'No chalky aftertaste, no sugar crash. One stick into cold or warm water and you’re set for the night.',
      gradient:
        'radial-gradient(120% 100% at 70% 30%, #7a4a63 0%, #45283a 55%, #1f1620 100%)',
    },
    {
      eyebrow: 'Made for you and all you do',
      title: 'Wake up clear',
      copy: 'Deeper, more restorative sleep with no morning grogginess and no melatonin hangover.',
      gradient:
        'radial-gradient(120% 100% at 40% 30%, #4d6160 0%, #2c3a39 55%, #141a19 100%)',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="grid gap-6 md:grid-cols-3">
        {features.map((f) => (
          <article key={f.title} className="flex flex-col">
            <div
              className="aspect-[3/4] w-full overflow-hidden rounded-3xl"
              style={{background: f.gradient}}
              aria-hidden="true"
            />
            <h3 className="mt-6 text-2xl tracking-tight">{f.title}</h3>
            <p className="mt-1 text-sm font-medium uppercase tracking-wide text-[color:var(--color-muted)]">
              {f.eyebrow}
            </p>
            <p className="mt-3 leading-relaxed text-[color:var(--color-ink)]">
              {f.copy}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   6 expandable FAQs (inline, Oura accordion style)
   ============================================================ */

const FAQS: Array<{q: string; a: string}> = [
  {
    q: 'What’s in SleepFuel?',
    a: 'Five evidence-backed ingredients: 300mg magnesium glycinate, 200mg L-theanine, 0.5mg melatonin, 3g glycine, and 1.5mg vitamin B6. Mixed-berry natural flavor, no sugar, no artificial colors.',
  },
  {
    q: 'When and how do I take it?',
    a: 'Mix one stick into cold or warm water about 30 minutes before bed. Make it part of a wind-down ritual — dim lights, no screens, a glass of SleepFuel.',
  },
  {
    q: 'Will I wake up groggy?',
    a: 'No. Because we use a low melatonin dose and no sedating ingredients, most people report waking up clear and rested rather than knocked out.',
  },
  {
    q: 'Is it safe to take every night?',
    a: 'SleepFuel is formulated for nightly use and none of the ingredients are habit-forming. As with any supplement, talk to your doctor if you’re pregnant, nursing, or taking medication.',
  },
  {
    q: 'How does Subscribe & Save work?',
    a: 'Subscribe and save 20% on every order. We ship a fresh box monthly — pause, skip, or cancel anytime from your account in two clicks.',
  },
  {
    q: 'What’s your return policy?',
    a: 'If SleepFuel isn’t working for you, we’ll refund your first box — no questions asked. Just email support@sleepfuel.com.',
  },
];

function FAQSection() {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-28 sm:px-6 lg:px-8">
      <h2 className="text-3xl tracking-tight sm:text-4xl">
        Frequently asked questions
      </h2>
      <div className="mt-8 border-t border-[color:var(--color-border)]">
        {FAQS.map((faq) => (
          <FAQItem key={faq.q} faq={faq} />
        ))}
      </div>
    </section>
  );
}

function FAQItem({faq}: {faq: {q: string; a: string}}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[color:var(--color-border)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="text-lg">{faq.q}</span>
        <span
          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border)] transition-transform ${
            open ? 'rotate-45' : ''
          }`}
          aria-hidden="true"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M7 1v12M1 7h12" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="max-w-prose pb-5 pr-10 leading-relaxed text-[color:var(--color-muted)]">
          {faq.a}
        </p>
      )}
    </div>
  );
}
