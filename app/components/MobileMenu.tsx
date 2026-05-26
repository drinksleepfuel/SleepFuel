import {Suspense, useEffect} from 'react';
import {Await, Link, NavLink} from 'react-router';
import {Money, useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {NAV_LINKS} from '~/components/Header';
import logoUrl from '~/assets/logo.png';

/**
 * Oura-style mobile menu: a full-screen frosted sheet that unifies the top
 * navigation and the cart under one blurred surface. The blur is set inline
 * (so the production minifier keeps it) and no transform/opacity sits on the
 * blur layer or its ancestors — otherwise backdrop-filter stops sampling the
 * page behind it.
 */
export function MobileMenu({
  cart,
  isLoggedIn,
}: {
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
}) {
  const {type, close, open} = useAside();
  const expanded = type === 'mobile';

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expanded, close]);

  return (
    <div
      className={`sf-mobile-overlay md:hidden ${expanded ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div
        className="sf-mobile-blur"
        style={{
          backdropFilter: 'blur(26px) saturate(140%)',
          WebkitBackdropFilter: 'blur(26px) saturate(140%)',
        }}
      >
        <div className="sf-mobile-content">
          {/* Top bar mirrors the header: logo + close */}
          <div className="flex items-center justify-between px-6 pt-6">
            <img
              src={logoUrl}
              alt="SleepFuel"
              className="h-7 w-auto"
              width={1076}
              height={223}
              style={{filter: 'brightness(0) invert(1)'}}
            />
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 4l10 10M14 4L4 14" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Primary nav */}
          <nav className="flex flex-1 flex-col gap-1 px-6 pt-8" role="navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                prefetch="intent"
                end
                onClick={close}
                className="border-b border-white/10 py-4 text-3xl font-medium text-white/90 hover:text-white"
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/account"
              prefetch="intent"
              onClick={close}
              className="border-b border-white/10 py-4 text-3xl font-medium text-white/90 hover:text-white"
            >
              <Suspense fallback="Account">
                <Await resolve={isLoggedIn} errorElement="Sign in">
                  {(loggedIn) => (loggedIn ? 'Account' : 'Sign in')}
                </Await>
              </Suspense>
            </NavLink>
          </nav>

          {/* Cart, unified into the same sheet */}
          <Suspense fallback={null}>
            <Await resolve={cart}>
              {(resolved) => (
                <MobileCartBlock
                  cart={resolved}
                  onViewBag={() => open('cart')}
                />
              )}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function MobileCartBlock({
  cart: original,
  onViewBag,
}: {
  cart: CartApiQueryFragment | null;
  onViewBag: () => void;
}) {
  const cart = useOptimisticCart(original);
  const count = cart?.totalQuantity ?? 0;

  return (
    <div className="border-t border-white/15 px-6 pb-10 pt-5">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-base font-semibold text-white">
          Bag{count ? ` (${count})` : ''}
        </span>
        {count > 0 && cart?.cost?.subtotalAmount ? (
          <span className="text-base font-semibold text-white">
            <Money data={cart.cost.subtotalAmount} />
          </span>
        ) : (
          <span className="text-sm text-white/60">Empty</span>
        )}
      </div>
      {count > 0 ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onViewBag}
            className="flex-1 rounded-full border border-white/30 py-3 text-center text-sm font-medium text-white hover:bg-white/10"
          >
            View bag
          </button>
          {cart?.checkoutUrl && (
            <a
              href={cart.checkoutUrl}
              className="flex-1 rounded-full bg-white py-3 text-center text-sm font-semibold text-[color:var(--color-ink)] hover:bg-white/90"
            >
              Checkout
            </a>
          )}
        </div>
      ) : (
        <Link
          to="/products/sleepfuel-drink-mix"
          className="block rounded-full bg-white py-3 text-center text-sm font-semibold text-[color:var(--color-ink)] hover:bg-white/90"
        >
          Shop SleepFuel
        </Link>
      )}
    </div>
  );
}
