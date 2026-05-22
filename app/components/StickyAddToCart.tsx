import {useEffect, useState} from 'react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {
  SELLING_PLAN_IDS,
  VARIANTS,
  formatPrice,
  priceFor,
  type PackKey,
  type PurchaseMode,
} from '~/lib/sleepfuelProduct';

type Props = {
  packKey?: PackKey;
  mode?: PurchaseMode;
};

/**
 * Oura-style sticky add-to-cart bar: a frosted, slightly transparent
 * rounded bar pinned to the bottom. Product thumbnail + name + variant on
 * the left; price + blue Add to Cart button on the right. Defaults to the
 * 10-pack subscribe-and-save per the brief. Reveals after the hero scrolls
 * out of view.
 */
export function StickyAddToCart({
  packKey = 'pack10',
  mode = 'subscribe',
}: Props) {
  const [visible, setVisible] = useState(false);
  const {open} = useAside();

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const variant = VARIANTS[packKey];
  const {base, final} = priceFor(packKey, mode);
  const sellingPlanId =
    mode === 'subscribe' ? SELLING_PLAN_IDS[packKey] : undefined;
  const showStrike = mode === 'subscribe';

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 transition-all duration-300 sm:bottom-4 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-6 opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <div className="mx-auto w-full px-0 sm:max-w-3xl sm:px-4">
        <div className="glass flex items-center justify-between gap-3 border-t border-white/40 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:rounded-2xl sm:border sm:px-4">
          {/* Left: thumbnail + name */}
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="hidden h-12 w-12 shrink-0 rounded-xl sm:block"
              style={{
                background:
                  'radial-gradient(120% 100% at 30% 25%, #3a4a6e 0%, #232a3f 60%, #14161f 100%)',
              }}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[color:var(--color-ink)]">
                {PRODUCT_NAME}
              </div>
              <div className="truncate text-xs text-[color:var(--color-muted)]">
                {variant.label} ·{' '}
                {mode === 'subscribe' ? 'Subscribe & Save' : 'One-time'}
              </div>
            </div>
          </div>

          {/* Right: price + CTA */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right text-sm font-semibold text-[color:var(--color-ink)]">
              {showStrike && (
                <span className="mr-1 font-normal text-[color:var(--color-muted)] line-through">
                  {formatPrice(base)}
                </span>
              )}
              {formatPrice(final)}
            </div>
            <AddToCartButton
              analytics={{type: 'sticky-cta', packKey, mode}}
              lines={[
                {
                  merchandiseId: variant.merchandiseId,
                  quantity: 1,
                  ...(sellingPlanId ? {sellingPlanId} : {}),
                },
              ]}
              onClick={() => open('cart')}
              className="btn-blue px-5 py-2.5 text-sm"
            >
              Add to Cart
            </AddToCartButton>
          </div>
        </div>
      </div>
    </div>
  );
}

const PRODUCT_NAME = 'SleepFuel Drink Mix';
