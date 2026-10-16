import {createHash, createHmac} from 'node:crypto';
import {describe, expect, it} from 'vitest';
import {
  ATTR_CONSENT,
  ATTR_OBREF,
  ATTR_OPPREF,
  buildOrderCreatedEvent,
  capiRequestBody,
  mergeAttributionAttributes,
  normalizeEmail,
  normalizePhone,
  readCookie,
  sanitizeRef,
  verifyShopifyHmac,
  webSha256,
  type ShopifyOrder,
} from './openAiCapi';

const sha = async (value: string) =>
  createHash('sha256').update(value).digest('hex');

const NOW = Date.parse('2026-10-16T15:00:00Z');

function order(overrides: Partial<ShopifyOrder> = {}): ShopifyOrder {
  return {
    id: 5550001,
    created_at: '2026-10-16T09:30:00-05:00',
    currency: 'USD',
    subtotal_price: '50.98',
    current_subtotal_price: '50.98',
    email: '  Jane.Doe@Example.com ',
    phone: null,
    browser_ip: '203.0.113.9',
    client_details: {user_agent: 'Mozilla/5.0'},
    customer: {id: 77, first_name: 'Jane', last_name: 'Doe'},
    billing_address: {
      city: 'Denver',
      province: 'Colorado',
      zip: '80204',
      country_code: 'US',
      phone: '(303) 555-0100',
    },
    note_attributes: [
      {name: ATTR_OPPREF, value: 'opp_abc123'},
      {name: ATTR_OBREF, value: 'ob.987'},
      {name: ATTR_CONSENT, value: '1'},
    ],
    line_items: [
      {
        variant_id: 4455667788,
        title: 'SleepFuel Drink Mix',
        variant_title: '10 Night Supply',
        quantity: 2,
        price: '29.99',
        total_discount: '9.00',
      },
    ],
    ...overrides,
  };
}

describe('refs and cookies', () => {
  it('accepts opaque tokens and rejects anything else', () => {
    expect(sanitizeRef(' abc-123_X.y~z:%2B/= ')).toBe('abc-123_X.y~z:%2B/=');
    expect(sanitizeRef('')).toBeNull();
    expect(sanitizeRef('<script>')).toBeNull();
    expect(sanitizeRef('a b')).toBeNull();
    expect(sanitizeRef('x'.repeat(600))).toBeNull();
    expect(sanitizeRef(42)).toBeNull();
  });

  it('reads a cookie by exact name', () => {
    const cookies = 'a=1; __oppref=opp%3Dabc; __obref=ob1; x__oppref=nope';
    expect(readCookie(cookies, '__oppref')).toBe('opp=abc');
    expect(readCookie(cookies, '__obref')).toBe('ob1');
    expect(readCookie(cookies, 'missing')).toBeNull();
    expect(readCookie('', '__oppref')).toBeNull();
  });
});

describe('mergeAttributionAttributes', () => {
  const existing = [
    {key: 'gift_note', value: 'Happy birthday'},
    {key: ATTR_OPPREF, value: 'old'},
  ];

  it('keeps other attributes and replaces ours', () => {
    expect(
      mergeAttributionAttributes(existing, {oppref: 'new', obref: 'ob'}),
    ).toEqual([
      {key: 'gift_note', value: 'Happy birthday'},
      {key: ATTR_OPPREF, value: 'new'},
      {key: ATTR_OBREF, value: 'ob'},
      {key: ATTR_CONSENT, value: '1'},
    ]);
  });

  it('removes ours when cleared', () => {
    expect(mergeAttributionAttributes(existing, null)).toEqual([
      {key: 'gift_note', value: 'Happy birthday'},
    ]);
  });
});

describe('identifier normalisation', () => {
  it('lowercases and trims emails', () => {
    expect(normalizeEmail('  Jane.Doe@Example.com ')).toBe(
      'jane.doe@example.com',
    );
    expect(normalizeEmail('not-an-email')).toBeNull();
  });

  it('keeps digits with the country code', () => {
    expect(normalizePhone('(303) 555-0100')).toBe('13035550100');
    expect(normalizePhone('+44 020 7946 0958')).toBe('4402079460958');
    expect(normalizePhone('123')).toBeNull();
  });
});

describe('buildOrderCreatedEvent', () => {
  it('maps a consented order with attribution and hashed identifiers', async () => {
    const event = await buildOrderCreatedEvent(order(), sha, NOW);
    expect(event).toMatchObject({
      id: 'order_5550001',
      type: 'order_created',
      timestamp_ms: Date.parse('2026-10-16T09:30:00-05:00'),
      oppref: 'opp_abc123',
      source_url: 'https://drinksleepfuel.com/checkout',
      action_source: 'web',
      opt_out: false,
      data: {
        type: 'contents',
        amount: 5098,
        currency: 'USD',
        contents: [
          {
            id: '4455667788',
            name: 'SleepFuel Drink Mix - 10 Night Supply',
            content_type: 'product',
            quantity: 2,
            // (29.99 x 2 - 9.00) / 2 = 25.49 charged per unit
            amount: 2549,
            currency: 'USD',
          },
        ],
      },
    });
    expect(event?.user).toEqual({
      obref: 'ob.987',
      emails_sha256: [await sha('jane.doe@example.com')],
      phone_numbers_sha256: [await sha('13035550100')],
      first_names_sha256: [await sha('jane')],
      last_names_sha256: [await sha('doe')],
      external_ids_sha256: [await sha('77')],
      regions: ['Colorado'],
      cities: ['Denver'],
      postal_codes: ['80204'],
      countries: ['US'],
      ip_address: '203.0.113.9',
      user_agent: 'Mozilla/5.0',
    });
  });

  it('reports orders without consent as opted out, with no personal data', async () => {
    const event = await buildOrderCreatedEvent(
      order({note_attributes: [{name: ATTR_OPPREF, value: 'opp_abc123'}]}),
      sha,
      NOW,
    );
    expect(event?.opt_out).toBe(true);
    expect(event).not.toHaveProperty('oppref');
    expect(event).not.toHaveProperty('user');
    expect(event?.data.amount).toBe(5098);
  });

  it('skips orders older than 7 days and orders with no items', async () => {
    expect(
      await buildOrderCreatedEvent(
        order({created_at: '2026-10-01T00:00:00Z'}),
        sha,
        NOW,
      ),
    ).toBeNull();
    expect(
      await buildOrderCreatedEvent(order({line_items: []}), sha, NOW),
    ).toBeNull();
    expect(await buildOrderCreatedEvent(order({id: null}), sha, NOW)).toBeNull();
  });

  it('drops a malformed ref even with consent', async () => {
    const event = await buildOrderCreatedEvent(
      order({
        note_attributes: [
          {name: ATTR_OPPREF, value: 'bad ref <x>'},
          {name: ATTR_CONSENT, value: '1'},
        ],
      }),
      sha,
      NOW,
    );
    expect(event).not.toHaveProperty('oppref');
    expect(event?.opt_out).toBe(false);
  });

  it('marks test orders as validate only', async () => {
    const event = await buildOrderCreatedEvent(order(), sha, NOW);
    expect(capiRequestBody(event!, true)).toMatchObject({
      validate_only: true,
      integration_source: 'sleepfuel_hydrogen',
      events: [{id: 'order_5550001'}],
    });
  });
});

describe('web crypto helpers', () => {
  it('hashes like node', async () => {
    expect(await webSha256('jane.doe@example.com')).toBe(
      await sha('jane.doe@example.com'),
    );
  });

  it('verifies Shopify webhook signatures', async () => {
    const body = JSON.stringify({id: 1});
    const secret = 'whsec_test';
    const good = createHmac('sha256', secret).update(body).digest('base64');
    expect(await verifyShopifyHmac(body, good, secret)).toBe(true);
    expect(await verifyShopifyHmac(body + ' ', good, secret)).toBe(false);
    expect(await verifyShopifyHmac(body, good, 'wrong')).toBe(false);
    expect(await verifyShopifyHmac(body, null, secret)).toBe(false);
    expect(await verifyShopifyHmac(body, good, '')).toBe(false);
  });
});
