import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {
  CartApiQueryFragment,
  HeaderQuery,
} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';

interface HeaderProps {
  header: HeaderQuery | null;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

const NAV_LINKS = [
  {label: 'Shop', to: '/products/sleepfuel-drink-mix'},
  {label: 'About', to: '/about'},
];

export function Header({cart, isLoggedIn}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 w-full glass border-b border-[color:var(--color-jet)]"
      style={{height: 'var(--header-height)'}}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink prefetch="intent" to="/" end className="flex items-center">
          <Logo />
        </NavLink>

        <HeaderMenu viewport="desktop" />

        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </div>
    </header>
  );
}

function Logo() {
  return (
    <span
      className="text-2xl font-semibold tracking-tight"
      style={{
        fontFamily: 'var(--font-display)',
        color: 'var(--color-midnight)',
      }}
    >
      SleepFuel<sup className="text-xs">®</sup>
    </span>
  );
}

export function HeaderMenu({viewport}: {viewport: Viewport}) {
  const {close} = useAside();
  const className =
    viewport === 'desktop'
      ? 'hidden md:flex items-center gap-8'
      : 'flex flex-col gap-4 p-4';

  return (
    <nav className={className} role="navigation">
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.to}
          prefetch="intent"
          to={link.to}
          end
          onClick={close}
          className={({isActive}) =>
            `text-sm font-medium transition-colors hover:text-[color:var(--color-midnight)] ${
              isActive
                ? 'text-[color:var(--color-midnight)]'
                : 'text-[color:var(--color-recovery)]'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      <NavLink
        prefetch="intent"
        to="/account"
        className="hidden text-sm font-medium text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)] md:block"
      >
        <Suspense fallback="Account">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <CartToggle cart={cart} />
      <HeaderMenuMobileToggle />
    </div>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      type="button"
      onClick={() => open('mobile')}
      className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-ink)] hover:bg-white/50"
      aria-label="Open menu"
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 5h16v1.6H2zM2 9.2h16v1.6H2zM2 13.4h16V15H2z" />
      </svg>
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-ink)] hover:bg-white/50 md:h-10 md:w-auto md:gap-2 md:px-4"
      aria-label={`Open cart (${count ?? 0} items)`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          d="M3 5h2l2 9h9l2-7H6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="8" cy="17" r="1" />
        <circle cx="15" cy="17" r="1" />
      </svg>
      <span className="hidden text-sm font-medium md:inline">
        {count === null ? <>&nbsp;</> : count}
      </span>
      {count !== null && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--color-blue)] px-1 text-[10px] font-semibold text-white md:hidden">
          {count}
        </span>
      )}
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}
