import {useRef, useState, type ReactElement} from 'react';
import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {Analytics} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {StickyAddToCart} from '~/components/StickyAddToCart';
import {useAside} from '~/components/Aside';
import heroImage from '~/assets/hero.jpg';
import featureCounterImage from '~/assets/feature-counter.jpg';
import featureBerriesImage from '~/assets/feature-berries.jpg';
import featureWakeImage from '~/assets/feature-wake.jpg';
import formulaImage from '~/assets/formula-glass.jpg';
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

export type HeroImage = {url: string; altText: string};

const PRODUCT_HERO_QUERY = `#graphql
  query ProductHero($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      images(first: 12) {
        nodes {
          id
          url
          altText
        }
      }
    }
  }
` as const;

export async function loader({context}: Route.LoaderArgs) {
  let heroImages: HeroImage[] = [];
  try {
    const {product} = await context.storefront.query<{
      product?: {
        images: {nodes: Array<{url: string; altText: string | null}>};
      } | null;
    }>(PRODUCT_HERO_QUERY, {variables: {handle: PRODUCT.handle}});

    heroImages = (product?.images?.nodes ?? [])
      .filter((node) => Boolean(node?.url))
      .map((node) => ({url: node.url, altText: node.altText ?? ''}));
  } catch {
    // Hero imagery is non-critical — fall back to the bundled photo below.
    heroImages = [];
  }

  return {heroImages};
}

export default function ProductPage() {
  const {heroImages} = useLoaderData<typeof loader>();
  const [packKey, setPackKey] = useState<PackKey>('pack10');
  const [mode, setMode] = useState<PurchaseMode>('subscribe');

  return (
    <>
      <Hero
        heroImages={heroImages}
        packKey={packKey}
        setPackKey={setPackKey}
        mode={mode}
        setMode={setMode}
      />
      <FeatureCallouts />
      <CompetitorSection />
      <FormulaScience />
      <UgcSection />
      <FAQSection />
      <MocktailsSection />

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
  heroImages,
  packKey,
  setPackKey,
  mode,
  setMode,
}: {
  heroImages: HeroImage[];
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
        <HeroVisual images={heroImages} />
      </div>

      {/* Right: buy box */}
      <div className="flex items-center px-5 py-12 sm:px-8 lg:px-14 lg:py-20">
        <div className="mx-auto w-full max-w-md">
          <p className="text-sm font-medium text-[color:var(--color-muted)]">
            SleepFuel Drink Mix · Mixed Berry
          </p>
          <h1 className="mt-2 text-[54px] font-normal leading-[1.05] tracking-tight sm:text-[72px]">
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
          <div className="mt-6 flex justify-center">
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
              className="btn-blue px-8 text-base"
            >
              Add to Cart —{' '}
              {showStrike && (
                <span className="ml-1 text-white/60 line-through">
                  {formatPrice(base)}
                </span>
              )}{' '}
              {formatPrice(final)}
            </AddToCartButton>
          </div>

          <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-[color:var(--color-muted)]">
            <li className="flex items-center gap-1.5">
              <Check /> Free US shipping $50+
            </li>
            <li className="flex items-center gap-1.5">
              <Check /> Cancel anytime
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function HeroVisual({images}: {images: HeroImage[]}) {
  // Split hero: video pane (placeholder for now) on the left, still on the right.
  // Uses the Shopify product images for both panes; the "video coming" overlay
  // makes it clear the left pane is where the real product video will land.
  const videoStill =
    images[0]?.url ?? (heroImage as unknown as string);
  const stillImage =
    images[1]?.url ?? images[0]?.url ?? (heroImage as unknown as string);
  const stillAlt =
    images[1]?.altText || images[0]?.altText || 'SleepFuel drink mix';

  return (
    <div className="absolute inset-y-0 right-0 left-0 overflow-hidden rounded-b-[1.75rem] lg:-left-16 lg:rounded-b-none lg:rounded-tr-[2.75rem] lg:rounded-br-[2.75rem]">
      <div className="grid h-full w-full grid-cols-2 gap-1">
        {/* Left: video pane — placeholder until the real product video lands. */}
        <div className="relative h-full overflow-hidden">
          <img
            src={videoStill}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 sm:h-20 sm:w-20"
              style={{
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 20 20"
                fill="rgba(255,255,255,0.95)"
                aria-hidden="true"
                className="sm:h-7 sm:w-7"
              >
                <path d="M7 5v10l8-5-8-5z" />
              </svg>
            </div>
          </div>
          <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white/90 lg:left-20">
            Video coming
          </span>
        </div>

        {/* Right: still image. */}
        <div className="relative h-full overflow-hidden">
          <img
            src={stillImage}
            alt={stillAlt}
            className="h-full w-full object-cover"
            loading="eager"
          />
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
    <section className="mx-auto max-w-7xl px-5 pt-20 pb-10 sm:px-6 lg:px-8 lg:pt-28 lg:pb-14">
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
      <div className="mx-auto max-w-7xl px-5 pt-10 pb-20 sm:px-6 lg:px-8 lg:pt-14 lg:pb-28">
        <h2 className="max-w-4xl text-[36px] font-normal leading-[1.05] tracking-tight sm:text-[45px] lg:text-[54px]">
          Synergistic Ingredients.{' '}
          <span className="text-[color:var(--color-muted)]">Better Sleep.</span>
        </h2>

        <div className="mt-12 grid items-start gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
          {/* Left: image container */}
          <div className="overflow-hidden rounded-3xl">
            <img
              src={formulaImage}
              alt="A SleepFuel stick pack beside a glass of mixed berry sleep drink with fresh lavender"
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
    a: 'If SleepFuel isn’t working for you, we’ll refund your first box — no questions asked. Just email support@sleepfuel.co.',
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

/* ============================================================
   Sleep Mocktails — 3 recipes built around one SleepFuel stick
   ============================================================ */

type Mocktail = {
  name: string;
  description: string;
  href: string; // full recipe lives on the blog
  tone: 'cherry' | 'chamomile' | 'latte';
};

const MOCKTAILS: Mocktail[] = [
  {
    name: 'Tart Cherry Sleep Cooler',
    description:
      'A crisp berry-forward sipper — tart cherry juice is nature’s melatonin, doubled up with SleepFuel.',
    href: '/blogs/recipes/tart-cherry-sleep-cooler',
    tone: 'cherry',
  },
  {
    name: 'Chamomile Moon Sipper',
    description:
      'Herbal and warm on the palate, cool in the glass — for the nights that ask you to slow down.',
    href: '/blogs/recipes/chamomile-moon-sipper',
    tone: 'chamomile',
  },
  {
    name: 'Golden Slumber Latte',
    description:
      'A creamy, warm-spiced wind-down. Serve gently warm on cold nights or over ice when it’s mild.',
    href: '/blogs/recipes/golden-slumber-latte',
    tone: 'latte',
  },
];

function MocktailsSection() {
  return (
    <section className="bg-[color:var(--color-cream)]">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-wide text-[color:var(--color-muted)]">
            Sleep Mocktails
          </p>
          <h2 className="mt-2 text-[36px] font-normal leading-[1.05] tracking-tight sm:text-[45px] lg:text-[54px]">
            Turn your SleepFuel into a wind-down ritual.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-[color:var(--color-muted)]">
            Three easy sleep-friendly mocktails. Each starts with one stick of
            SleepFuel and takes under two minutes.
          </p>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {MOCKTAILS.map((r) => (
            <RecipeCard key={r.name} recipe={r} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RecipeCard({recipe}: {recipe: Mocktail}) {
  return (
    <Link
      to={recipe.href}
      prefetch="intent"
      className="group flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-cream)]"
    >
      <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl">
        <RecipeIllustration tone={recipe.tone} />
      </div>
      <h3 className="mt-5 text-2xl tracking-tight transition-colors group-hover:text-[color:var(--color-blue)]">
        {recipe.name}
      </h3>
      <p className="mt-2 leading-relaxed text-[color:var(--color-muted)]">
        {recipe.description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-ink)] transition-transform group-hover:translate-x-0.5">
        Read the recipe
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

const TONE_GRADIENTS: Record<Mocktail['tone'], string> = {
  cherry: 'linear-gradient(180deg, #b8556b 0%, #4a1a26 100%)',
  chamomile: 'linear-gradient(180deg, #d8a660 0%, #5f4218 100%)',
  latte: 'linear-gradient(180deg, #d9c9a6 0%, #8c6a3a 100%)',
};

function RecipeIllustration({tone}: {tone: Mocktail['tone']}) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{background: TONE_GRADIENTS[tone]}}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 260"
        width="55%"
        fill="none"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M60 40 H140 L128 210 Q128 240 100 240 Q72 240 72 210 Z" />
        <path d="M60 40 H140" />
        <path d="M72 210 Q100 210 128 210" />
        <path d="M155 62 l6 12 12 6 -12 6 -6 12 -6 -12 -12 -6 12 -6 Z" strokeWidth="1.8" />
      </svg>
    </div>
  );
}

/* ============================================================
   Competitor comparison — public facts only, dashes where unclear
   ============================================================ */

const COMPETITORS = [
  'Beam Dream',
  'AGZ',
  'Moon Juice Sleepy',
  'Moonbrew',
] as const;

type CompetitorCells = [string, string, string, string];
type CompetitorRow = {
  label: string;
  sleepfuel: string;
  others: CompetitorCells;
};

const COMPETITOR_ROWS: CompetitorRow[] = [
  {
    label: 'Melatonin',
    sleepfuel: '2 mg · micro-dose',
    others: ['3 mg', '—', '0.3 mg phyto', '—'],
  },
  {
    label: 'Magnesium',
    sleepfuel: '200 mg glycinate',
    others: [
      '150 mg bisglycinate',
      'Magtein L-threonate (dose unclear)',
      '200 mg (bisglycinate + gluconate)',
      '57 mg (MagnesiREM)',
    ],
  },
  {
    label: 'L-Theanine',
    sleepfuel: '200 mg',
    others: ['200 mg', 'Listed (dose unclear)', '112 mg', '250 mg'],
  },
  {label: 'GABA', sleepfuel: '200 mg', others: ['—', '—', '—', '—']},
  {
    label: 'Lemon balm',
    sleepfuel: '100 mg',
    others: ['—', 'Listed (dose unclear)', '—', '—'],
  },
  {
    label: 'No morning grogginess',
    sleepfuel: '✓',
    others: ['✓', '✓', '✓', 'Unclear'],
  },
  {
    label: 'Cost per night',
    sleepfuel: '$2.80 · one-time',
    others: ['$1.33', 'Unclear', '$1.40', 'Unclear'],
  },
];

function CompetitorSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-16 pb-12 sm:px-6 lg:px-8 lg:pt-20 lg:pb-16">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wide text-[color:var(--color-muted)]">
          The competition
        </p>
        <h2 className="mt-2 text-[36px] font-normal leading-[1.05] tracking-tight sm:text-[45px] lg:text-[54px]">
          How SleepFuel stacks up.
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-[color:var(--color-muted)]">
          A quick, honest look at how our formula compares to popular sleep
          drinks. Publicly verifiable facts only — dashes where a competitor
          doesn&rsquo;t disclose.
        </p>
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[880px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th
                scope="col"
                className="w-[22%] px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-[color:var(--color-muted)]"
              >
                <span className="sr-only">Category</span>
              </th>
              {/* SleepFuel header — animated aurora placeholder for the real
                  looped product video. */}
              <th
                scope="col"
                className="sf-cell-video rounded-t-2xl px-3 py-4 text-center text-base font-semibold"
              >
                SleepFuel
              </th>
              {COMPETITORS.map((name) => (
                <th
                  key={name}
                  scope="col"
                  className="px-3 py-4 text-center text-sm font-medium text-[color:var(--color-ink)]"
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPETITOR_ROWS.map((row, i) => {
              const last = i === COMPETITOR_ROWS.length - 1;
              return (
                <tr key={row.label}>
                  <th
                    scope="row"
                    className="border-t border-[color:var(--color-border)] px-3 py-4 text-left font-medium text-[color:var(--color-ink)]"
                  >
                    {row.label}
                  </th>
                  <td
                    className={`sf-cell-video border-t border-white/15 px-3 py-4 text-center font-semibold ${
                      last ? 'rounded-b-2xl' : ''
                    }`}
                  >
                    {row.sleepfuel}
                  </td>
                  {row.others.map((v, j) => (
                    <td
                      key={j}
                      className="border-t border-[color:var(--color-border)] px-3 py-4 text-center text-[color:var(--color-muted)]"
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-[color:var(--color-muted)]">
        Competitor data pulled from each brand&rsquo;s public product pages.
        Doses, formulations, and prices may change.
      </p>
    </section>
  );
}

/* ============================================================
   UGC vertical-video carousel — placeholder cards for now
   ============================================================ */

type UgcTone = 'midnight' | 'plum' | 'olive' | 'sand' | 'rose';

const UGC_CARDS: Array<{handle: string; tone: UgcTone}> = [
  {handle: '@sleeplover', tone: 'midnight'},
  {handle: '@midnightmuse', tone: 'plum'},
  {handle: '@wellnessritual', tone: 'olive'},
  {handle: '@nightowl.co', tone: 'sand'},
  {handle: '@shutteye_official', tone: 'rose'},
];

const UGC_GRADIENTS: Record<UgcTone, string> = {
  midnight: 'linear-gradient(160deg, #4a5578 0%, #1a1f30 100%)',
  plum: 'linear-gradient(160deg, #7a4a63 0%, #2a1522 100%)',
  olive: 'linear-gradient(160deg, #4d6160 0%, #1a2726 100%)',
  sand: 'linear-gradient(160deg, #b89870 0%, #4a3820 100%)',
  rose: 'linear-gradient(160deg, #c47b8a 0%, #4a1e2a 100%)',
};

function UgcSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const t = trackRef.current;
    if (!t) return;
    const card = t.querySelector('[data-ugc-card]') as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 /* gap-6 */ : t.clientWidth;
    setActive(Math.round(t.scrollLeft / step));
  };

  const goTo = (i: number) => {
    const t = trackRef.current;
    if (!t) return;
    const card = t.querySelector('[data-ugc-card]') as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 : t.clientWidth;
    const clamped = Math.max(0, Math.min(UGC_CARDS.length - 1, i));
    t.scrollTo({left: step * clamped, behavior: 'smooth'});
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="flex items-end justify-between gap-6">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-wide text-[color:var(--color-muted)]">
            From the community
          </p>
          <h2 className="mt-2 text-[32px] font-normal leading-[1.1] tracking-tight sm:text-[40px] lg:text-[48px]">
            Better sleepers, real routines.
          </h2>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {UGC_CARDS.map((c) => (
          <UgcCard key={c.handle} handle={c.handle} tone={c.tone} />
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {UGC_CARDS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show video ${i + 1} of ${UGC_CARDS.length}`}
            aria-current={active === i}
            className={`h-2 rounded-full shadow-sm ring-1 ring-black/10 transition-all ${
              active === i
                ? 'w-6 bg-[color:var(--color-ink)]'
                : 'w-2 bg-[color:var(--color-border)] hover:bg-[color:var(--color-muted)]'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function UgcCard({handle, tone}: {handle: string; tone: UgcTone}) {
  return (
    <figure
      data-ugc-card
      className="flex w-[240px] shrink-0 snap-center flex-col sm:w-[260px] lg:w-[280px]"
    >
      <div
        className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl"
        style={{background: UGC_GRADIENTS[tone]}}
      >
        {/* subtle centered play triangle to signal "video coming" */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="rgba(255,255,255,0.9)"
              aria-hidden="true"
            >
              <path d="M7 5v10l8-5-8-5z" />
            </svg>
          </div>
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white/85">
          Video coming
        </span>
      </div>
      <figcaption className="mt-4 text-center text-sm font-medium tracking-tight text-[color:var(--color-ink)]">
        {handle}
      </figcaption>
    </figure>
  );
}
