import {describe, expect, it} from 'vitest';
import {
  createViewDeduper,
  currencyExponent,
  mapAddedToCart,
  mapCheckoutStarted,
  mapPageViewed,
  mapProductViewed,
  pagePath,
  toMinorUnits,
  toQuantity,
  variantContentId,
} from './openAiPixel';

describe('currency conversion', () => {
  it('uses the currency exponent, not a fixed x100', () => {
    expect(currencyExponent('USD')).toBe(2);
    expect(currencyExponent('JPY')).toBe(0); // zero-decimal
    expect(currencyExponent('KWD')).toBe(3); // three-decimal
  });

  it('falls back to 2 for an unknown code', () => {
    expect(currencyExponent('ZZZ')).toBe(2);
    expect(currencyExponent('')).toBe(2);
  });

  it('converts decimals to integer minor units', () => {
    expect(toMinorUnits('25.49', 'USD')).toBe(2549);
    expect(toMinorUnits(29.99, 'USD')).toBe(2999);
    expect(toMinorUnits('1000', 'JPY')).toBe(1000);
  });

  it('rounds rather than truncating', () => {
    // 47.585 * 100 is 4758.499... in binary floating point; truncation loses a cent.
    expect(toMinorUnits('47.585', 'USD')).toBe(4759);
    expect(toMinorUnits('0.005', 'USD')).toBe(1);
  });

  it('returns null for unusable input instead of NaN', () => {
    expect(toMinorUnits(null, 'USD')).toBeNull();
    expect(toMinorUnits(undefined, 'USD')).toBeNull();
    expect(toMinorUnits('', 'USD')).toBeNull();
    expect(toMinorUnits('not-a-price', 'USD')).toBeNull();
  });

  it('always yields an integer', () => {
    for (const price of ['25.49', '0.1', '19.999', '7']) {
      expect(Number.isInteger(toMinorUnits(price, 'USD'))).toBe(true);
    }
  });
});

describe('quantities', () => {
  it('defaults to 1 and stays a positive integer', () => {
    expect(toQuantity(3)).toBe(3);
    expect(toQuantity('2')).toBe(2);
    expect(toQuantity(undefined)).toBe(1);
    expect(toQuantity(0)).toBe(1);
    expect(toQuantity(-5)).toBe(1);
    expect(toQuantity(2.4)).toBe(2);
  });
});

describe('identifiers', () => {
  it('reduces a variant GID to its numeric id', () => {
    expect(variantContentId('gid://shopify/ProductVariant/44790724296790')).toBe(
      '44790724296790',
    );
  });

  it('passes through non-GID values and rejects empty ones', () => {
    expect(variantContentId('SFDM001')).toBe('SFDM001');
    expect(variantContentId(null)).toBeNull();
    expect(variantContentId('')).toBeNull();
  });

  it('never leaks query strings or hashes into a page id', () => {
    expect(pagePath('https://drinksleepfuel.com/products/x?utm_source=chatgpt&oppref=abc')).toBe(
      '/products/x',
    );
    expect(pagePath('https://drinksleepfuel.com/cart#line-1')).toBe('/cart');
    expect(pagePath('/contact?email=someone@example.com')).toBe('/contact');
    expect(pagePath(undefined)).toBe('/');
  });
});

describe('page_viewed', () => {
  it('emits a page content with the path only', () => {
    expect(mapPageViewed('https://drinksleepfuel.com/contact?x=1', 'Contact')).toEqual({
      type: 'contents',
      contents: [{id: '/contact', content_type: 'page', name: 'Contact'}],
    });
  });
});

describe('contents_viewed', () => {
  const payload = {
    products: [
      {
        title: 'SleepFuel Drink Mix',
        variantTitle: '30 Night Supply',
        variantId: 'gid://shopify/ProductVariant/44790725443670',
        price: '63.74',
        quantity: 1,
      },
    ],
    shop: {currency: 'USD'},
  };

  it('maps a product view to documented fields only', () => {
    expect(mapProductViewed(payload)).toEqual({
      type: 'contents',
      contents: [
        {
          id: '44790725443670',
          content_type: 'product',
          quantity: 1,
          name: 'SleepFuel Drink Mix - 30 Night Supply',
          amount: 6374,
          currency: 'USD',
        },
      ],
    });
  });

  it('omits a root amount — a product view has no transaction total', () => {
    expect(mapProductViewed(payload)).not.toHaveProperty('amount');
  });

  it('returns null when nothing identifiable is present', () => {
    expect(mapProductViewed({products: [], shop: {currency: 'USD'}})).toBeNull();
    expect(mapProductViewed({products: [{title: 'No variant'}]})).toBeNull();
    expect(mapProductViewed(null)).toBeNull();
  });
});

describe('items_added', () => {
  const payload = {
    currentLine: {
      quantity: 2,
      merchandise: {
        id: 'gid://shopify/ProductVariant/44790724296790',
        title: '10 Night Supply',
        price: {amount: '25.49', currencyCode: 'USD'},
        product: {title: 'SleepFuel Drink Mix'},
      },
    },
    shop: {currency: 'USD'},
  };

  it('reports units added, not the resulting line quantity', () => {
    // One unit added to a line that already held two: Hydrogen hands us
    // currentLine.quantity === 3, but only one was added.
    const topUp = mapAddedToCart({
      ...payload,
      prevLine: {quantity: 2},
      currentLine: {...payload.currentLine, quantity: 3},
    });
    expect(topUp?.contents[0].quantity).toBe(1);
    expect(topUp?.amount).toBe(2549);
  });

  it('treats a line with no previous state as entirely new', () => {
    const fresh = mapAddedToCart({
      ...payload,
      currentLine: {...payload.currentLine, quantity: 3},
    });
    expect(fresh?.contents[0].quantity).toBe(3);
    expect(fresh?.amount).toBe(7647);
  });

  it('never reports a non-positive quantity when the delta is impossible', () => {
    const shrunk = mapAddedToCart({
      ...payload,
      prevLine: {quantity: 5},
      currentLine: {...payload.currentLine, quantity: 2},
    });
    expect(shrunk?.contents[0].quantity).toBe(1);
    expect(shrunk?.amount).toBe(2549);
  });

  it('sends only the line just added, with a line total at the root', () => {
    expect(mapAddedToCart(payload)).toEqual({
      type: 'contents',
      amount: 5098, // 2549 x 2
      currency: 'USD',
      contents: [
        {
          id: '44790724296790',
          content_type: 'product',
          quantity: 2,
          name: 'SleepFuel Drink Mix - 10 Night Supply',
          amount: 2549,
          currency: 'USD',
        },
      ],
    });
  });

  it('drops the "Default Title" placeholder from the name', () => {
    const result = mapAddedToCart({
      ...payload,
      currentLine: {
        ...payload.currentLine,
        merchandise: {...payload.currentLine.merchandise, title: 'Default Title'},
      },
    });
    expect(result?.contents[0].name).toBe('SleepFuel Drink Mix');
  });

  it('returns null without a usable line, so nothing is sent', () => {
    expect(mapAddedToCart({currentLine: null})).toBeNull();
    expect(mapAddedToCart(null)).toBeNull();
  });
});

describe('checkout_started', () => {
  const cart = {
    cost: {totalAmount: {amount: '73.09', currencyCode: 'USD'}},
    lines: {
      nodes: [
        {
          quantity: 1,
          merchandise: {
            id: 'gid://shopify/ProductVariant/44790725443670',
            title: '30 Night Supply',
            price: {amount: '73.09', currencyCode: 'USD'},
            product: {title: 'SleepFuel Drink Mix'},
          },
        },
      ],
    },
  };

  it("uses the cart's own total as the root amount", () => {
    const result = mapCheckoutStarted(cart, {currency: 'USD'});
    expect(result?.amount).toBe(7309);
    expect(result?.currency).toBe('USD');
    expect(result?.contents).toHaveLength(1);
    expect(result?.contents[0].id).toBe('44790725443670');
  });

  it('prefers the line currency over the shop currency', () => {
    const result = mapCheckoutStarted(cart, {currency: 'EUR'});
    expect(result?.currency).toBe('USD');
  });

  it('returns null for an empty cart', () => {
    expect(mapCheckoutStarted({lines: {nodes: []}}, null)).toBeNull();
    expect(mapCheckoutStarted(null)).toBeNull();
  });

  it('reports the discounted unit price, not the list price', () => {
    // A Subscribe & Save line: $29.99 list, 15% off => $25.49 charged.
    const subscribed = mapCheckoutStarted(
      {
        cost: {subtotalAmount: {amount: '50.98', currencyCode: 'USD'}},
        lines: {
          nodes: [
            {
              quantity: 2,
              cost: {amountPerQuantity: {amount: '25.49', currencyCode: 'USD'}},
              merchandise: {
                id: 'gid://shopify/ProductVariant/44790724296790',
                price: {amount: '29.99', currencyCode: 'USD'},
              },
            },
          ],
        },
      },
      {currency: 'USD'},
    );

    expect(subscribed?.contents[0].amount).toBe(2549);
    // The contents now agree with the cart's own subtotal.
    expect(subscribed?.amount).toBe(5098);
    expect(
      subscribed!.contents[0].amount! * subscribed!.contents[0].quantity!,
    ).toBe(subscribed?.amount);
  });

  it('falls back to the list price when the line states no cost', () => {
    const result = mapCheckoutStarted(
      {
        lines: {
          nodes: [
            {
              quantity: 1,
              merchandise: {
                id: 'gid://shopify/ProductVariant/44790724296790',
                price: {amount: '29.99', currencyCode: 'USD'},
              },
            },
          ],
        },
      },
      {currency: 'USD'},
    );
    expect(result?.contents[0].amount).toBe(2999);
  });

  it('prefers the merchandise subtotal over a total carrying shipping and tax', () => {
    const result = mapCheckoutStarted(
      {
        cost: {
          subtotalAmount: {amount: '50.98', currencyCode: 'USD'},
          totalAmount: {amount: '61.47', currencyCode: 'USD'},
        },
        lines: {
          nodes: [
            {
              quantity: 2,
              cost: {amountPerQuantity: {amount: '25.49', currencyCode: 'USD'}},
              merchandise: {
                id: 'gid://shopify/ProductVariant/44790724296790',
              },
            },
          ],
        },
      },
      null,
    );
    expect(result?.amount).toBe(5098);
  });

  it('keeps a genuinely free line at zero rather than falling through', () => {
    const result = mapCheckoutStarted(
      {
        lines: {
          nodes: [
            {
              quantity: 1,
              cost: {amountPerQuantity: {amount: '0.00', currencyCode: 'USD'}},
              merchandise: {
                id: 'gid://shopify/ProductVariant/44790724296790',
                price: {amount: '29.99', currencyCode: 'USD'},
              },
            },
          ],
        },
      },
      null,
    );
    expect(result?.contents[0].amount).toBe(0);
  });
});

describe('duplicate suppression', () => {
  const view = {type: 'contents', contents: [{id: '1', content_type: 'page'}]};

  it('drops an identical view event inside the window', () => {
    const allow = createViewDeduper(1000);
    expect(allow('contents_viewed', view, 0)).toBe(true);
    expect(allow('contents_viewed', view, 400)).toBe(false); // Strict Mode re-fire
  });

  it('allows the same view again once the window passes', () => {
    const allow = createViewDeduper(1000);
    expect(allow('contents_viewed', view, 0)).toBe(true);
    expect(allow('contents_viewed', view, 1500)).toBe(true);
  });

  it('treats a different payload as a different view', () => {
    const allow = createViewDeduper(1000);
    const other = {type: 'contents', contents: [{id: '2', content_type: 'page'}]};
    expect(allow('page_viewed', view, 0)).toBe(true);
    expect(allow('page_viewed', other, 10)).toBe(true);
  });

  it('never suppresses shopper actions — a real double add must both send', () => {
    const allow = createViewDeduper(1000);
    const added = {type: 'contents', amount: 2549, contents: []};
    expect(allow('items_added', added, 0)).toBe(true);
    expect(allow('items_added', added, 5)).toBe(true);
    expect(allow('checkout_started', added, 0)).toBe(true);
    expect(allow('checkout_started', added, 5)).toBe(true);
  });
});
