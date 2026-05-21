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
    {
      name: 'description',
      content: PRODUCT.tagline,
    },
    {rel: 'canonical', href: `/products/${PRODUCT.handle}`},
  ];
};

/**
 * Loader is currently a no-op. Once the product exists in Shopify with handle
 * `sleepfuel-drink-mix`, wire the PRODUCT_QUERY back in and merge real
 * variant/sellingPlan IDs into `app/lib/sleepfuelProduct.ts`.
 */
export async function loader(_args: Route.LoaderArgs) {
  return {};
}

export default function ProductPage() {
  const [packKey, setPackKey] = useState<PackKey>('pack10');
  const [mode, setMode] = useState<PurchaseMode>('subscribe');

  return (
    <>
      <Hero packKey={packKey} setPackKey={setPackKey} mode={mode} setMode={setMode} />
      <BenefitsStrip />
      <HowItWorks />
      <Ingredients />
      <Testimonials />
      <ScienceCTA />

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
   Hero
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
  const sellingPlanId = mode === 'subscribe' ? SELLING_PLAN_IDS[packKey] : undefined;

  return (
    <section
      className="relative overflow-hidden"
      style={{background: 'var(--color-neutral)'}}
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        {/* Product visual */}
        <div className="order-2 lg:order-1">
          <ProductVisual />
        </div>

        {/* Buy box */}
        <div className="order-1 flex flex-col gap-6 lg:order-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
            style={{background: 'var(--color-awaking)', color: 'var(--color-midnight)'}}
          >
            New · Doctor-formulated
          </div>

          <h1
            className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            style={{fontFamily: 'var(--font-display)', color: 'var(--color-midnight)'}}
          >
            {PRODUCT.title}
          </h1>

          <p className="max-w-md text-lg leading-relaxed text-[color:var(--color-recovery)]">
            {PRODUCT.tagline}
          </p>

          {/* Pack selector */}
          <fieldset className="grid grid-cols-2 gap-3">
            <legend className="sr-only">Choose your pack size</legend>
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
                  className={`relative flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-all ${
                    selected
                      ? 'border-[color:var(--color-midnight)] bg-white'
                      : 'border-[color:var(--color-jet)] bg-white/60 hover:border-[color:var(--color-recovery)]'
                  }`}
                  aria-pressed={selected}
                >
                  {recommended && (
                    <span
                      className="absolute -top-2 right-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        background: 'var(--color-golden)',
                        color: 'var(--color-midnight)',
                      }}
                    >
                      Best value
                    </span>
                  )}
                  <span className="text-sm font-semibold">{v.label}</span>
                  <span className="text-xs text-[color:var(--color-recovery)]">
                    {v.servings} servings · {formatPrice(p.final / v.servings)}/night
                  </span>
                  <span className="mt-1 text-lg font-semibold">
                    {showStrike && (
                      <span className="mr-1 text-sm font-normal opacity-50 line-through">
                        {formatPrice(p.base)}
                      </span>
                    )}
                    {formatPrice(p.final)}
                  </span>
                </button>
              );
            })}
          </fieldset>

          {/* Purchase mode */}
          <fieldset className="rounded-2xl border-2 border-[color:var(--color-midnight)] bg-white">
            <legend className="sr-only">Purchase mode</legend>
            <label
              className={`flex cursor-pointer items-start gap-3 p-4 ${
                mode === 'subscribe' ? '' : 'opacity-70'
              }`}
            >
              <input
                type="radio"
                name="mode"
                value="subscribe"
                checked={mode === 'subscribe'}
                onChange={() => setMode('subscribe')}
                className="mt-1"
              />
              <span className="flex-1">
                <span className="flex items-center gap-2">
                  <strong>Subscribe & Save</strong>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      background: 'var(--color-awaking)',
                      color: 'var(--color-midnight)',
                    }}
                  >
                    Save {Math.round(SUBSCRIBE_DISCOUNT * 100)}%
                  </span>
                </span>
                <span className="block text-sm text-[color:var(--color-recovery)]">
                  Auto-delivered monthly. Cancel anytime.
                </span>
              </span>
            </label>
            <div className="border-t border-[color:var(--color-jet)]" />
            <label
              className={`flex cursor-pointer items-start gap-3 p-4 ${
                mode === 'onetime' ? '' : 'opacity-70'
              }`}
            >
              <input
                type="radio"
                name="mode"
                value="onetime"
                checked={mode === 'onetime'}
                onChange={() => setMode('onetime')}
                className="mt-1"
              />
              <span className="flex-1">
                <strong>One-time purchase</strong>
                <span className="block text-sm text-[color:var(--color-recovery)]">
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
            className="btn-primary w-full text-base"
          >
            Add to cart — {showStrike && (
              <span className="mr-1 opacity-60 line-through">{formatPrice(base)}</span>
            )}{formatPrice(final)}
          </AddToCartButton>

          <ul className="grid grid-cols-1 gap-2 text-sm text-[color:var(--color-recovery)] sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <Check /> Free US shipping
            </li>
            <li className="flex items-center gap-2">
              <Check /> Cancel anytime
            </li>
            <li className="flex items-center gap-2">
              <Check /> 100% money-back
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function ProductVisual() {
  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-3xl"
      style={{
        background:
          'radial-gradient(circle at 30% 30%, var(--color-sunset) 0%, var(--color-midnight) 60%, var(--color-charcoal) 100%)',
      }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center text-center"
        style={{color: 'var(--color-awaking)'}}
      >
        <div>
          <div className="text-sm uppercase tracking-[0.3em] opacity-70">SleepFuel</div>
          <div
            className="mt-2 text-5xl font-semibold sm:text-6xl"
            style={{fontFamily: 'var(--font-display)'}}
          >
            Sleep
            <br />
            Mix
          </div>
          <div className="mt-3 text-sm uppercase tracking-[0.3em] opacity-70">
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
      width="16"
      height="16"
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
   Below the fold sections
   ============================================================ */

function BenefitsStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-3">
        {PRODUCT.benefits.map((b, i) => (
          <div key={b.title} className="flex flex-col gap-3">
            <div
              className="inline-flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                background:
                  i === 0
                    ? 'var(--color-awaking)'
                    : i === 1
                    ? 'var(--color-golden)'
                    : 'var(--color-sunset)',
                color: i === 2 ? '#fff' : 'var(--color-midnight)',
              }}
            >
              <BenefitIcon i={i} />
            </div>
            <h3
              className="text-2xl font-semibold"
              style={{fontFamily: 'var(--font-display)'}}
            >
              {b.title}
            </h3>
            <p className="text-[color:var(--color-recovery)]">{b.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BenefitIcon({i}: {i: number}) {
  if (i === 0) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 14.5A9 9 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (i === 1) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 18l4-6 4 4 6-9 4 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HowItWorks() {
  const steps = [
    {n: 1, t: 'Mix one stick into water', d: 'Cold or warm. Mixed berry — actually tastes good.'},
    {n: 2, t: 'Drink 30 min before bed', d: 'Your nervous system starts to settle in under an hour.'},
    {n: 3, t: 'Wake up clear', d: 'Deeper sleep, no grogginess, no melatonin hangover.'},
  ];

  return (
    <section
      className="py-20"
      style={{background: 'var(--color-midnight)', color: '#fff'}}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl"
          style={{fontFamily: 'var(--font-display)'}}
        >
          A nightly ritual that actually <span style={{color: 'var(--color-awaking)'}}>works</span>.
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="flex flex-col gap-3">
              <span
                className="text-sm font-semibold"
                style={{color: 'var(--color-awaking)'}}
              >
                Step {s.n}
              </span>
              <h3
                className="text-2xl font-semibold"
                style={{fontFamily: 'var(--font-display)'}}
              >
                {s.t}
              </h3>
              <p style={{color: 'var(--color-jet)'}}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Ingredients() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <h2
            className="text-4xl font-semibold leading-tight sm:text-5xl"
            style={{fontFamily: 'var(--font-display)', color: 'var(--color-midnight)'}}
          >
            What&rsquo;s in every stick.
          </h2>
          <p className="mt-4 max-w-md text-[color:var(--color-recovery)]">
            Five evidence-backed ingredients at clinically meaningful doses. No mystery proprietary blends. No fillers.
          </p>
        </div>
        <ul className="divide-y divide-[color:var(--color-jet)]">
          {PRODUCT.ingredients.map((ing) => (
            <li key={ing.name} className="flex items-start gap-4 py-4">
              <span
                className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={{background: 'var(--color-awaking)', color: 'var(--color-midnight)'}}
              >
                {ing.dose}
              </span>
              <div>
                <div className="font-semibold">{ing.name}</div>
                <div className="text-sm text-[color:var(--color-recovery)]">
                  {ing.benefit}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      q: 'I&rsquo;m a chronic 3am-waker. Two weeks on SleepFuel and I&rsquo;m sleeping through.',
      a: 'Maya R.',
      r: 'Verified subscriber',
    },
    {
      q: 'Doesn&rsquo;t knock me out. I just… fall asleep like a normal person again.',
      a: 'Jordan K.',
      r: 'Verified subscriber',
    },
    {
      q: 'The mornings are the real difference. I wake up actually feeling rested.',
      a: 'Priya S.',
      r: 'Verified subscriber',
    },
  ];

  return (
    <section
      className="py-20"
      style={{background: 'var(--color-neutral)'}}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          className="text-center text-4xl font-semibold sm:text-5xl"
          style={{fontFamily: 'var(--font-display)', color: 'var(--color-midnight)'}}
        >
          Trusted by 12,000+ dreamers.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {quotes.map((quote, i) => (
            <figure
              key={i}
              className="flex flex-col gap-4 rounded-2xl bg-white p-6"
            >
              <Stars />
              <blockquote
                className="text-lg leading-relaxed"
                style={{color: 'var(--color-midnight)'}}
                dangerouslySetInnerHTML={{__html: `&ldquo;${quote.q}&rdquo;`}}
              />
              <figcaption className="text-sm">
                <div className="font-semibold">{quote.a}</div>
                <div className="text-[color:var(--color-recovery)]">{quote.r}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stars() {
  return (
    <div className="flex gap-1" style={{color: 'var(--color-golden)'}}>
      {Array.from({length: 5}, (_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1l2.2 4.5L15 6.2l-3.5 3.4.8 4.8L8 12.1 3.7 14.4l.8-4.8L1 6.2l4.8-.7L8 1z" />
        </svg>
      ))}
    </div>
  );
}

function ScienceCTA() {
  return (
    <section
      className="py-20"
      style={{background: 'var(--color-charcoal)', color: '#fff'}}
    >
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2
          className="text-4xl font-semibold leading-tight sm:text-5xl"
          style={{fontFamily: 'var(--font-display)'}}
        >
          Built on the <span style={{color: 'var(--color-awaking)'}}>science of sleep</span>.
        </h2>
        <p className="mt-4 text-lg" style={{color: 'var(--color-jet)'}}>
          Every ingredient is dosed to the level shown in peer-reviewed sleep research — not the homeopathic doses you&rsquo;ll find in most gummies.
        </p>
        <a href="/about" className="btn-gold mt-8">
          Read the research
        </a>
      </div>
    </section>
  );
}
