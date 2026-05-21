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
 * Bottom-right sticky add-to-cart. Defaults to 10-pack + subscribe-and-save
 * per the brief. Becomes visible once the user scrolls past the hero so it
 * doesn't fight with the in-page form.
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
  const sellingPlanId = mode === 'subscribe' ? SELLING_PLAN_IDS[packKey] : undefined;
  const showStrike = mode === 'subscribe';

  return (
    <div
      className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <div
        className="flex items-center gap-4 rounded-full p-2 pl-5 shadow-2xl"
        style={{background: 'var(--color-midnight)', color: '#fff'}}
      >
        <div className="hidden sm:block">
          <div className="text-xs uppercase tracking-wider opacity-70">
            {variant.label} · {mode === 'subscribe' ? 'Subscribe' : 'One-time'}
          </div>
          <div className="text-sm font-medium">
            {showStrike && (
              <span className="opacity-60 line-through mr-2">
                {formatPrice(base)}
              </span>
            )}
            <span>{formatPrice(final)}</span>
          </div>
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
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold"
            style={{
              background: 'var(--color-awaking)',
              color: 'var(--color-midnight)',
            }}
          >
            Add to cart
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </AddToCartButton>
      </div>
    </div>
  );
}
