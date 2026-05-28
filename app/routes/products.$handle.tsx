import {useState, type ReactElement} from 'react';
import type {Route} from './+types/products.$handle';
import {Analytics} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {StickyAddToCart} from '~/components/StickyAddToCart';
import {useAside} from '~/components/Aside';
import heroImage from '~/assets/hero.jpg';
import featureCounterImage from '~/assets/feature-counter.jpg';
import featureBerriesImage from '~/assets/feature-berries.jpg';
import featureWakeImage from '~/assets/feature-wake.jpg';
import formulaPlaceholder from '~/assets/formula-placeholder.svg';
import {
  BEST_VALUE_KEY,
  PACK_ORDER,
  PRODUCT,
  SUBSCRIBE_DISCOUNT,
  VARIANTS,
  formatPrice,
  priceFor,
  sellingPlanFor,
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
      <FormulaScience />
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
    mode === 'subscribe' ? sellingPlanFor(packKey) : undefined;

  return (
    <section className="grid items-stretch overflow-hidden lg:grid-cols-[1.05fr_1fr]">
      {/* Left: product image — rounded on the visible (right) side, bleeds
          completely off the left edge of the page. */}
      <div className="relative min-h-[52vh] lg:min-h-[88vh]">
        <HeroVisual />
      </div>

      {/* Right: buy box */}
      <div className="flex items-center px-5 py-12 sm:px-8 lg:px-14 lg:py-20">
        <div className="mx-auto w-full max-w-md">
          <p className="text-sm font-medium text-[color:var(--color-muted)]">
            SleepFuel Drink Mix · Mixed Berry
          </p>
          <h1 className="mt-2 text-7xl font-normal leading-[1.05] tracking-tight sm:text-8xl">
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
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {PACK_ORDER.map((k) => {
                const v = VARIANTS[k];
                const p = priceFor(k, mode);
                const selected = packKey === k;
                const recommended = k === BEST_VALUE_KEY;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setPackKey(k)}
                    aria-pressed={selected}
                    className={`relative rounded-2xl border bg-white p-3 text-left transition-all ${
                      selected
                        ? 'border-[color:var(--color-ink)] ring-1 ring-[color:var(--color-ink)]'
                        : 'border-[color:var(--color-border)] hover:border-[color:var(--color-muted)]'
                    }`}
                  >
                    {recommended && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[color:var(--color-blue)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                        Best value
                      </span>
                    )}
                    <span className="block text-sm font-semibold">
                      {v.servings} Nights
                    </span>
                    <span className="mt-0.5 block text-[11px] text-[color:var(--color-muted)]">
                      {formatPrice(p.final / v.servings)}/night
                    </span>
                    <span className="mt-2 block text-sm font-semibold leading-tight">
                      {showStrike && (
                        <span className="block text-[11px] font-normal text-[color:var(--color-muted)] line-through">
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
    <div className="absolute inset-y-0 right-0 left-0 overflow-hidden rounded-b-[1.75rem] lg:-left-16 lg:rounded-b-none lg:rounded-tr-[2.75rem] lg:rounded-br-[2.75rem]">
      <img
        src={heroImage}
        alt="A woman taking SleepFuel in bed at golden hour"
        className="h-full w-full object-cover"
        loading="eager"
      />
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
      copy: 'Six evidence-backed actives — magnesium glycinate, L-theanine, GABA, inositol, lemon balm, and a micro-dose of melatonin.',
      image: featureCounterImage,
      alt: 'SleepFuel mixed berry drink mix sticks on a marble counter',
      gradient:
        'radial-gradient(120% 100% at 30% 20%, #4a5578 0%, #2a3147 55%, #181b27 100%)',
    },
    {
      eyebrow: 'Mixed berry like you’ve never tasted',
      title: 'Actually delicious',
      copy: 'No chalky aftertaste, no sugar crash. One stick into cold or warm water and you’re set for the night.',
      image: featureBerriesImage,
      alt: 'A SleepFuel drink mix stick resting on a bowl of fresh mixed berries',
      gradient:
        'radial-gradient(120% 100% at 70% 30%, #7a4a63 0%, #45283a 55%, #1f1620 100%)',
    },
    {
      eyebrow: 'Made for you and all you do',
      title: 'Wake up clear',
      copy: 'Deeper, more restorative sleep with no morning grogginess and no melatonin hangover.',
      image: featureWakeImage,
      alt: 'A woman waking up rested in lavender pajamas beside a glass of water',
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
              style={f.image ? undefined : {background: f.gradient}}
            >
              {f.image ? (
                <img
                  src={f.image}
                  alt={f.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
            </div>
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
   Ingredient science — synergistic formula, Oura-style icon grid
   ============================================================ */

type IngredientIcon = (props: {className?: string}) => ReactElement;

function Glyph({
  className,
  children,
}: {
  className?: string;
  children: ReactElement | ReactElement[];
}) {
  return (
    <svg
      className={className}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const CrystalIcon: IngredientIcon = ({className}) => (
  <Glyph className={className}>
    <path d="M3.5 8 L7 4 H17 L20.5 8 L12 20.5 Z" />
    <path d="M3.5 8 H20.5" />
    <path d="M9.5 8 L12 20.5 L14.5 8" />
    <path d="M7 4 L9.5 8 M17 4 L14.5 8" />
  </Glyph>
);

const TeaCupIcon: IngredientIcon = ({className}) => (
  <Glyph className={className}>
    <path d="M5 9.5 H16 V12 A5.5 5.5 0 0 1 5 12 Z" />
    <path d="M16 10 H18.5 A2 2 0 0 1 18.5 14 H17.5" />
    <path d="M4.5 20.5 H16.5" />
    <path d="M8 3 C 9 4.5, 7 5.5, 8 7" />
    <path d="M12 3 C 13 4.5, 11 5.5, 12 7" />
  </Glyph>
);

const MindIcon: IngredientIcon = ({className}) => (
  <Glyph className={className}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="6" />
    <path d="M6.5 13 L8 8.5 L9.5 15 L11 11 H17.5" />
  </Glyph>
);

const MoleculeIcon: IngredientIcon = ({className}) => (
  <Glyph className={className}>
    <path d="M16 5.1 L20 12 L16 18.9 L8 18.9 L4 12 L8 5.1 Z" />
    <circle cx="16" cy="5.1" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="20" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="16" cy="18.9" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="8" cy="18.9" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="8" cy="5.1" r="1.3" fill="currentColor" stroke="none" />
  </Glyph>
);

const LeafIcon: IngredientIcon = ({className}) => (
  <Glyph className={className}>
    <path d="M4 20 C 4 12, 12 4, 20 4 C 20 12, 12 20, 4 20 Z" />
    <path d="M4 20 C 9 15, 14 10, 20 4" />
    <path d="M8.5 11.5 L11 13.5 M11.5 8 L14 10" />
  </Glyph>
);

const MoonIcon: IngredientIcon = ({className}) => (
  <Glyph className={className}>
    <path d="M20.5 14 A8.5 8.5 0 1 1 10 3.5 A6.6 6.6 0 0 0 20.5 14 Z" />
    <path d="M18 4 l.7 1.6 1.6 .7 -1.6 .7 -.7 1.6 -.7 -1.6 -1.6 -.7 1.6 -.7 Z" />
  </Glyph>
);

const INGREDIENTS: Array<{
  name: string;
  dose: string;
  benefit: string;
  Icon: IngredientIcon;
}> = [
  {
    name: 'Magnesium Glycinate',
    dose: '200 mg · 48% DV',
    benefit:
      'Relaxes tight muscles and settles the nervous system as you wind down.',
    Icon: CrystalIcon,
  },
  {
    name: 'L-Theanine',
    dose: '200 mg',
    benefit:
      'A calming amino acid from tea that quiets a racing mind without sedation.',
    Icon: TeaCupIcon,
  },
  {
    name: 'GABA',
    dose: '200 mg',
    benefit:
      'The brain’s primary calming neurotransmitter — dials down mental chatter.',
    Icon: MindIcon,
  },
  {
    name: 'Inositol',
    dose: '200 mg',
    benefit:
      'Supports a balanced mood so the mind can let go and ease toward rest.',
    Icon: MoleculeIcon,
  },
  {
    name: 'Lemon Balm Extract',
    dose: '100 mg · leaf',
    benefit:
      'A time-honored calming herb that softens tension and restlessness.',
    Icon: LeafIcon,
  },
  {
    name: 'Melatonin',
    dose: '2 mg · micro-dose',
    benefit:
      'A micro-dose that gently cues your body clock for sleep — no morning grogginess.',
    Icon: MoonIcon,
  },
];

function FormulaScience() {
  return (
    <section className="bg-[color:var(--color-cream)]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
        <h2 className="max-w-4xl text-5xl font-normal leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          Synergistic Ingredients.{' '}
          <span className="text-[color:var(--color-muted)]">Better Sleep.</span>
        </h2>

        <div className="mt-12 grid items-start gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
          {/* Left: image container */}
          <div className="overflow-hidden rounded-3xl">
            <img
              src={formulaPlaceholder}
              alt="SleepFuel formula — image placeholder"
              className="aspect-[4/3] w-full object-cover lg:aspect-[4/5]"
              loading="lazy"
            />
          </div>

          {/* Right: ingredient grid */}
          <div>
            <dl className="grid gap-x-8 gap-y-9 sm:grid-cols-2">
              {INGREDIENTS.map(({name, dose, benefit, Icon}) => (
                <div key={name} className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eae3da] text-[color:var(--color-ink)]">
                    <Icon className="h-[22px] w-[22px]" />
                  </span>
                  <div>
                    <dt className="font-medium leading-tight">{name}</dt>
                    <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-[color:var(--color-muted)]">
                      {dose}
                    </p>
                    <dd className="mt-1.5 text-sm leading-relaxed text-[color:var(--color-muted)]">
                      {benefit}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
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
    a: 'Six evidence-backed ingredients: 200mg magnesium glycinate, 200mg L-theanine, 200mg GABA, 200mg inositol, 100mg lemon balm extract, and a 2mg micro-dose of melatonin. Mixed-berry natural flavor, no sugar, no artificial colors.',
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
    <section className="mx-auto w-full max-w-3xl px-5 pb-28 sm:px-6 lg:px-8">
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
        className="flex w-full items-center justify-between gap-6 py-5 text-left outline-none focus:outline-none focus-visible:text-[color:var(--color-blue)]"
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
