import {useRef, useState, type ReactElement} from 'react';
import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {Analytics} from '@shopify/hydrogen';
import {OkendoReviews, OkendoStarRating} from '@okendo/shopify-hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import FeatureCallouts from '~/sections/feature-callouts';
import FeatureCalloutItem from '~/sections/feature-callout-item';
import FormulaScience from '~/sections/formula-science';
import IngredientItem from '~/sections/ingredient-item';
import FAQSection from '~/sections/faq';
import FAQItem from '~/sections/faq-item';
import type {IngredientIconKey} from '~/sections/ingredient-icons';
import MocktailsSection from '~/sections/mocktails';
import MocktailCard from '~/sections/mocktail-card';
import CompetitorSection from '~/sections/competitor';
import CompetitorRow from '~/sections/competitor-row';
import UgcSection from '~/sections/ugc';
import UgcCard, {type UgcTone} from '~/sections/ugc-card';
import OkendoReviewsSection from '~/sections/okendo-reviews';
import {StickyAddToCart} from '~/components/StickyAddToCart';
import {useAside} from '~/components/Aside';
import heroImage from '~/assets/hero.jpg';
import featureCounterImage from '~/assets/feature-counter.jpg';
import featureBerriesImage from '~/assets/feature-berries.jpg';
import featureWakeImage from '~/assets/feature-wake.jpg';
import heroVideo from '~/assets/hero-video.mp4';
import mocktailChamomileImage from '~/assets/mocktail-chamomile.jpg';
import mocktailCherryImage from '~/assets/mocktail-cherry.jpg';
import mocktailLatteImage from '~/assets/mocktail-latte.jpg';
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
export type ReviewSnippet = {value: string} | null;

const PRODUCT_PAGE_QUERY = `#graphql
  query ProductPage($handle: String!, $country: CountryCode, $language: LanguageCode)
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
      okendoStarRatingSnippet: metafield(namespace: "okendo", key: "StarRatingSnippet") {
        value
      }
      okendoReviewsSnippet: metafield(namespace: "okendo", key: "ReviewsWidgetSnippet") {
        value
      }
    }
  }
` as const;

export async function loader({context}: Route.LoaderArgs) {
  let heroImages: HeroImage[] = [];
  let okendoStarRatingSnippet: ReviewSnippet = null;
  let okendoReviewsSnippet: ReviewSnippet = null;

  try {
    const {product} = await context.storefront.query<{
      product?: {
        images: {nodes: Array<{url: string; altText: string | null}>};
        okendoStarRatingSnippet: {value: string} | null;
        okendoReviewsSnippet: {value: string} | null;
      } | null;
    }>(PRODUCT_PAGE_QUERY, {variables: {handle: PRODUCT.handle}});

    heroImages = (product?.images?.nodes ?? [])
      .filter((node) => Boolean(node?.url))
      .map((node) => ({url: node.url, altText: node.altText ?? ''}));
    okendoStarRatingSnippet = product?.okendoStarRatingSnippet ?? null;
    okendoReviewsSnippet = product?.okendoReviewsSnippet ?? null;
  } catch {
    // Product data is non-critical — fall back to bundled hero + no reviews.
    heroImages = [];
  }

  return {heroImages, okendoStarRatingSnippet, okendoReviewsSnippet};
}

export default function ProductPage() {
  const {heroImages, okendoStarRatingSnippet, okendoReviewsSnippet} =
    useLoaderData<typeof loader>();
  const [packKey, setPackKey] = useState<PackKey>('pack10');
  const [mode, setMode] = useState<PurchaseMode>('subscribe');

  return (
    <>
      <Hero
        heroImages={heroImages}
        okendoStarRatingSnippet={okendoStarRatingSnippet}
        packKey={packKey}
        setPackKey={setPackKey}
        mode={mode}
        setMode={setMode}
      />
      <FeatureCallouts>
        {FEATURES.map((f) => (
          <FeatureCalloutItem
            key={f.title}
            eyebrow={f.eyebrow}
            title={f.title}
            copy={f.copy}
            image={f.image}
            alt={f.alt}
          />
        ))}
      </FeatureCallouts>
      <CompetitorSection
        eyebrow="The competition"
        heading="How SleepFuel stacks up."
        intro="A quick, honest look at how our formula compares to the field of popular sleep drinks."
        ourLabel="SleepFuel"
        theirLabel="Others"
      >
        {COMPETITOR_ROWS.map((row) => (
          <CompetitorRow
            key={row.label}
            label={row.label}
            sleepfuel={row.sleepfuel}
            others={row.others}
          />
        ))}
      </CompetitorSection>
      <FormulaScience
        heading="Synergistic Ingredients."
        headingAccent="Better Sleep."
        videoLabel="Mixing SleepFuel into a glass"
      >
        {INGREDIENTS.map((ing) => (
          <IngredientItem
            key={ing.name}
            name={ing.name}
            dose={ing.dose}
            benefit={ing.benefit}
            icon={ing.icon}
          />
        ))}
      </FormulaScience>
      <UgcSection
        eyebrow="From the community"
        heading="Better sleepers, real routines."
      >
        {UGC_CARDS.map((c) => (
          <UgcCard key={c.handle} handle={c.handle} tone={c.tone} />
        ))}
      </UgcSection>
      <OkendoReviewsSection snippet={okendoReviewsSnippet} />
      <FAQSection heading="Frequently asked questions">
        {FAQS.map((faq) => (
          <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
        ))}
      </FAQSection>
      <MocktailsSection
        eyebrow="Sleep Mocktails"
        heading="Turn your SleepFuel into a wind-down ritual."
        intro="Three easy sleep-friendly mocktails. Each starts with one stick of SleepFuel and takes under two minutes."
      >
        {MOCKTAILS.map((r) => (
          <MocktailCard
            key={r.name}
            name={r.name}
            description={r.description}
            href={r.href}
            image={r.image}
            imageAlt={r.imageAlt}
          />
        ))}
      </MocktailsSection>

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
  okendoStarRatingSnippet,
  packKey,
  setPackKey,
  mode,
  setMode,
}: {
  heroImages: HeroImage[];
  okendoStarRatingSnippet: ReviewSnippet;
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
      <div className="flex items-center px-5 pt-12 pb-6 sm:px-8 sm:py-12 lg:px-14 lg:py-20">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-[54px] font-normal leading-[1.05] tracking-tight sm:text-[72px]">
            {PRODUCT.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[color:var(--color-muted)]">
            {PRODUCT.tagline}
          </p>

          {/* Okendo star badge — links to the full reviews widget below. */}
          <OkendoStarRating
            className="mt-4"
            productId={PRODUCT.id}
            okendoStarRatingSnippet={okendoStarRatingSnippet}
          />

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
        {/* Left: looped hero product video. */}
        <div className="relative h-full overflow-hidden">
          <video
            src={heroVideo}
            poster={videoStill}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="SleepFuel drink mix pour"
            className="h-full w-full object-cover"
          />
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

/* ============================================================
   3 feature callouts with images
   ============================================================ */

/**
 * Card content for `<FeatureCallouts>`. Lives here until the Weaverse Studio
 * project owns this section's content; the section itself is already
 * schema-driven and editable.
 */
const FEATURES = [
  {
    eyebrow: 'Engineered in every way',
    title: 'Deep sleep, by design',
    copy: 'Six evidence-backed actives — magnesium glycinate, L-theanine, GABA, inositol, lemon balm, and a micro-dose of melatonin.',
    image: featureCounterImage as unknown as string,
    alt: 'SleepFuel mixed berry drink mix sticks on a marble counter',
  },
  {
    eyebrow: 'Mixed berry like you’ve never tasted',
    title: 'Actually delicious',
    copy: 'No chalky aftertaste, no sugar crash. One stick into cold or warm water and you’re set for the night.',
    image: featureBerriesImage as unknown as string,
    alt: 'A SleepFuel drink mix stick resting on a bowl of fresh mixed berries',
  },
  {
    eyebrow: 'Made for you and all you do',
    title: 'Wake up clear',
    copy: 'Deeper, more restorative sleep with no morning grogginess and no melatonin hangover.',
    image: featureWakeImage as unknown as string,
    alt: 'A woman waking up rested in lavender pajamas beside a glass of water',
  },
];

/* ============================================================
   Ingredient science — synergistic formula, Oura-style icon grid
   ============================================================ */

const INGREDIENTS: Array<{
  name: string;
  dose: string;
  benefit: string;
  icon: IngredientIconKey;
}> = [
  {
    name: 'Magnesium Glycinate',
    dose: '200 mg · 48% DV',
    benefit:
      'Relaxes tight muscles and settles the nervous system as you wind down.',
    icon: 'crystal',
  },
  {
    name: 'L-Theanine',
    dose: '200 mg',
    benefit:
      'A calming amino acid from tea that quiets a racing mind without sedation.',
    icon: 'teacup',
  },
  {
    name: 'GABA',
    dose: '200 mg',
    benefit:
      'The brain’s primary calming neurotransmitter — dials down mental chatter.',
    icon: 'mind',
  },
  {
    name: 'Inositol',
    dose: '200 mg',
    benefit:
      'Supports a balanced mood so the mind can let go and ease toward rest.',
    icon: 'molecule',
  },
  {
    name: 'Lemon Balm Extract',
    dose: '100 mg · leaf',
    benefit:
      'A time-honored calming herb that softens tension and restlessness.',
    icon: 'leaf',
  },
  {
    name: 'Melatonin',
    dose: '2 mg · micro-dose',
    benefit:
      'A micro-dose that gently cues your body clock for sleep — no morning grogginess.',
    icon: 'moon',
  },
];

/* ============================================================
   6 expandable FAQs (inline, Oura accordion style)
   ============================================================ */

const FAQS: Array<{q: string; a: string}> = [
  {
    q: 'Will I feel groggy the next morning?',
    a: 'This is the number one fear with anything sleep-related, and it’s why we use 2mg of melatonin instead of the 5–10mg you’ll find in most sleep aids. That’s a low, physiologic dose, enough to support your natural wind-down without the next-day fog high-dose melatonin is known for. The rest of the formula, magnesium glycinate and L-theanine, works with your body’s own relaxation pathways, not against them.',
  },
  {
    q: 'Is SleepFuel habit-forming?',
    a: 'No. There’s nothing in SleepFuel that creates dependency. It’s a blend of minerals, amino acids, and botanicals that support your body’s natural sleep process, not a sedative. You can use it nightly or just when you need it, and stop anytime.',
  },
  {
    q: 'Why only 2mg of melatonin? Other brands have 10mg.',
    a: 'Because more isn’t better. Research suggests lower doses closer to what your body produces naturally are effective for supporting sleep onset. High doses are where grogginess and vivid-dream complaints come from. We dosed for how you feel at 7am, not for a bigger number on the label.',
  },
  {
    q: 'How fast does it work, and when should I take it?',
    a: 'Mix one stick pack into 6–8 oz of water about 30 minutes before bed. Most people feel the wind-down effect the first night. The magnesium benefits build with consistent use, so it gets better over the first couple of weeks.',
  },
  {
    q: 'What does it taste like?',
    a: 'Mixed Berry. Lightly sweet, with subtle lavender notes and no sugar, sweetened with stevia. It’s designed to be a ritual you actually look forward to, not something you choke down.',
  },
  {
    q: 'What’s in it, and why those ingredients?',
    a: 'Five actives, each at a deliberate dose: magnesium glycinate (200mg) for relaxation and muscle ease, L-theanine (200mg) to quiet a racing mind, GABA (200mg) and lemon balm (100mg) to support calm, and 2mg of melatonin to cue sleep onset. Full amounts are on the label. No proprietary blends, no hidden doses.',
  },
  {
    q: 'Can I take it every night?',
    a: 'Yes, SleepFuel is formulated for nightly use. All ingredients are within established daily-use ranges, including the 200mg of magnesium, which sits comfortably under the supplemental daily limit.',
  },
  {
    q: 'Can I take SleepFuel with other supplements or medications?',
    a: 'If you take prescription medications, especially sedatives, blood pressure medication, or antidepressants, check with your doctor first. Same if you already take a magnesium supplement, so you don’t double up.',
  },
  {
    q: 'Is it safe during pregnancy or for kids?',
    a: 'SleepFuel is formulated for adults 18 and over. If you’re pregnant or nursing, talk to your doctor before use.',
  },
  {
    q: 'Does it have sugar, calories, or anything artificial?',
    a: 'No sugar (it’s sweetened with stevia) and zero calories per serving. It’s vegan, and colored with vegetable extract, not artificial dyes.',
  },
  {
    q: 'Where is it made, and can I trust what’s in it?',
    a: 'SleepFuel is made in the USA in a GMPC Certified Facility. Every active and its exact dose is printed on the label. No proprietary blends, nothing hidden. What you read is what’s in the stick pack.',
  },
  {
    q: 'How does the subscription work? Can I cancel?',
    a: 'Subscribe & Save gets you 15% off every order, shipped monthly. Skip, pause, or cancel anytime from your account page in about two clicks. No emails, no phone calls, no retention scripts.',
  },
  {
    q: 'How fast is shipping?',
    a: 'Orders ship within 1–2 business days from Texas. Free shipping on every subscription order.',
  },
];

/* ============================================================
   Okendo reviews widget — full review list from the store's Okendo
   metafield, enhanced client-side by @okendo/shopify-hydrogen.
   ============================================================ */

/* ============================================================
   Sleep Mocktails — 3 recipes built around one SleepFuel stick
   ============================================================ */

type Mocktail = {
  name: string;
  description: string;
  href: string; // full recipe lives on the blog
  image?: string;
  imageAlt?: string;
};

const MOCKTAILS: Mocktail[] = [
  {
    name: 'Tart Cherry Sleep Cooler',
    description:
      'A crisp berry-forward sipper — tart cherry juice is nature’s melatonin, doubled up with SleepFuel.',
    href: '/blogs/recipes/tart-cherry-sleep-cooler',
    image: mocktailCherryImage,
    imageAlt:
      'A calming SleepFuel berry smoothie in a glass',
  },
  {
    name: 'Chamomile Moon Sipper',
    description:
      'Herbal and warm on the palate, cool in the glass — for the nights that ask you to slow down.',
    href: '/blogs/recipes/chamomile-moon-sipper',
    image: mocktailChamomileImage,
    imageAlt:
      'A SleepFuel chamomile mocktail splashing in a glass with fresh berries',
  },
  {
    name: 'Golden Slumber Latte',
    description:
      'A creamy, warm-spiced wind-down. Serve gently warm on cold nights or over ice when it’s mild.',
    href: '/blogs/recipes/golden-slumber-latte',
    image: mocktailLatteImage,
    imageAlt:
      'A tall glass of iced SleepFuel mocktail with strawberries, blackberries, and eucalyptus',
  },
];

/* ============================================================
   Competitor comparison — public facts only, dashes where unclear
   ============================================================ */

type CompetitorRow = {
  label: string;
  sleepfuel: string;
  others: string;
};

const COMPETITOR_ROWS: CompetitorRow[] = [
  {label: 'Magnesium', sleepfuel: '200 mg', others: '< 200 mg'},
  {
    label: 'Melatonin',
    sleepfuel: '2 mg · micro-dose',
    others: '> 3 mg · large dose',
  },
  {label: 'L-Theanine', sleepfuel: '200 mg', others: '< 200 mg'},
  {label: 'GABA', sleepfuel: '200 mg', others: '< 200 mg'},
  {label: 'Lemon balm', sleepfuel: '100 mg', others: 'Not included'},
  {label: 'Sugar free', sleepfuel: 'Yes', others: 'No'},
  {label: 'Tastes great', sleepfuel: 'Always', others: 'No'},
  {label: 'No next-day grogginess', sleepfuel: 'Never', others: 'Always'},
  {label: 'Cost per night', sleepfuel: '~$2', others: '> $3'},
];

/* ============================================================
   UGC vertical-video carousel — placeholder cards for now
   ============================================================ */

const UGC_CARDS: Array<{handle: string; tone: UgcTone}> = [
  {handle: '@sleeplover', tone: 'midnight'},
  {handle: '@midnightmuse', tone: 'plum'},
  {handle: '@wellnessritual', tone: 'olive'},
  {handle: '@nightowl.co', tone: 'sand'},
  {handle: '@shutteye_official', tone: 'rose'},
];
