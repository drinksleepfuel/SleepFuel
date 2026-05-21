import type {Route} from './+types/api.klaviyo-subscribe';

/**
 * Server-side endpoint that subscribes an email to a Klaviyo list and
 * returns the discount code to the client.
 *
 * Required env vars (set in `.env.local` for dev, Oxygen for prod):
 *   KLAVIYO_PRIVATE_API_KEY   — pk_… server-side key
 *   KLAVIYO_LIST_ID           — list to add subscribers to
 *   KLAVIYO_DISCOUNT_CODE     — e.g. "WELCOME15" (created in Shopify)
 *
 * If env vars aren't set, returns a 200 with `configured: false` so the
 * popup still "works" in dev — caller treats it as a success.
 */
export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({error: 'Method not allowed'}, {status: 405});
  }

  const formData = await request.formData();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({error: 'Please enter a valid email.'}, {status: 400});
  }

  const env = context.env as unknown as {
    KLAVIYO_PRIVATE_API_KEY?: string;
    KLAVIYO_LIST_ID?: string;
    KLAVIYO_DISCOUNT_CODE?: string;
  };
  const apiKey = env.KLAVIYO_PRIVATE_API_KEY;
  const listId = env.KLAVIYO_LIST_ID;
  const discountCode = env.KLAVIYO_DISCOUNT_CODE ?? 'WELCOME15';

  if (!apiKey || !listId) {
    // Not yet configured — still return success so the UX works in dev.
    return Response.json({
      success: true,
      configured: false,
      discountCode,
    });
  }

  try {
    // Create or update a profile, then subscribe it to the list.
    // Klaviyo API: https://developers.klaviyo.com/en/reference/subscribe_profiles
    const res = await fetch(
      'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/',
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          revision: '2025-07-15',
          Authorization: `Klaviyo-API-Key ${apiKey}`,
        },
        body: JSON.stringify({
          data: {
            type: 'profile-subscription-bulk-create-job',
            attributes: {
              profiles: {
                data: [
                  {
                    type: 'profile',
                    attributes: {
                      email,
                      subscriptions: {
                        email: {marketing: {consent: 'SUBSCRIBED'}},
                      },
                    },
                  },
                ],
              },
              custom_source: 'SleepFuel storefront popup',
            },
            relationships: {
              list: {data: {type: 'list', id: listId}},
            },
          },
        }),
      },
    );

    if (!res.ok && res.status !== 202) {
      const body = await res.text();
      console.error('Klaviyo subscribe failed:', res.status, body);
      return Response.json(
        {error: 'Subscription failed. Please try again.'},
        {status: 500},
      );
    }

    return Response.json({
      success: true,
      configured: true,
      discountCode,
    });
  } catch (err) {
    console.error('Klaviyo error:', err);
    return Response.json(
      {error: 'Subscription failed. Please try again.'},
      {status: 500},
    );
  }
}
