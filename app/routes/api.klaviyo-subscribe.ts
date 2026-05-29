import type {Route} from './+types/api.klaviyo-subscribe';

/**
 * Subscribes popup signups to Klaviyo via the public client-subscriptions
 * endpoint — no secret key required (the company id is the public site key).
 *
 *   step=email → adds the email to the "Newsletter" list, returns WELCOME10
 *   step=sms   → adds the phone (+ email) to the "SMS Subscriber" list,
 *                returns WELCOME15. Klaviyo sends the SMS opt-in confirmation.
 *
 * The public ids below can be overridden by env vars if they ever change.
 */
const KLAVIYO_REVISION = '2025-07-15';
const COMPANY_ID_FALLBACK = 'RHRckF'; // public site id
const EMAIL_LIST_FALLBACK = 'YmvR3r'; // "Newsletter" (single opt-in)
const SMS_LIST_FALLBACK = 'VgaCiJ'; // "SMS Subscriber" (single opt-in)
const EMAIL_DISCOUNT = 'WELCOME10';
const SMS_DISCOUNT = 'WELCOME15';

function normalizePhone(input: string): string | null {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (trimmed.startsWith('+') && digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }
  return null;
}

async function clientSubscribe(companyId: string, payload: unknown) {
  return fetch(
    `https://a.klaviyo.com/client/subscriptions/?company_id=${companyId}`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        revision: KLAVIYO_REVISION,
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({error: 'Method not allowed'}, {status: 405});
  }

  const env = context.env as unknown as {
    PUBLIC_KLAVIYO_COMPANY_ID?: string;
    KLAVIYO_EMAIL_LIST_ID?: string;
    KLAVIYO_SMS_LIST_ID?: string;
  };
  const companyId = env.PUBLIC_KLAVIYO_COMPANY_ID || COMPANY_ID_FALLBACK;
  const emailListId = env.KLAVIYO_EMAIL_LIST_ID || EMAIL_LIST_FALLBACK;
  const smsListId = env.KLAVIYO_SMS_LIST_ID || SMS_LIST_FALLBACK;

  const formData = await request.formData();
  const step = String(formData.get('step') ?? 'email');
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const phoneRaw = String(formData.get('phone') ?? '').trim();

  if (step === 'email') {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        {error: 'Please enter a valid email.'},
        {status: 400},
      );
    }
    try {
      const res = await clientSubscribe(companyId, {
        data: {
          type: 'subscription',
          attributes: {
            custom_source: 'SleepFuel storefront popup',
            profile: {
              data: {
                type: 'profile',
                attributes: {
                  email,
                  subscriptions: {email: {marketing: {consent: 'SUBSCRIBED'}}},
                },
              },
            },
          },
          relationships: {list: {data: {type: 'list', id: emailListId}}},
        },
      });
      if (!res.ok && res.status !== 202) {
        console.error('Klaviyo email subscribe:', res.status, await res.text());
      }
    } catch (err) {
      // Non-blocking: the discount still works even if Klaviyo hiccups.
      console.error('Klaviyo email error:', err);
    }
    return Response.json({success: true, discountCode: EMAIL_DISCOUNT});
  }

  if (step === 'sms') {
    const phone = normalizePhone(phoneRaw);
    if (!phone) {
      return Response.json(
        {error: 'Please enter a valid US phone number.'},
        {status: 400},
      );
    }
    const profileAttributes: Record<string, unknown> = {
      phone_number: phone,
      subscriptions: {sms: {marketing: {consent: 'SUBSCRIBED'}}},
    };
    if (email) profileAttributes.email = email;
    try {
      const res = await clientSubscribe(companyId, {
        data: {
          type: 'subscription',
          attributes: {
            custom_source: 'SleepFuel storefront popup (SMS)',
            profile: {data: {type: 'profile', attributes: profileAttributes}},
          },
          relationships: {list: {data: {type: 'list', id: smsListId}}},
        },
      });
      if (!res.ok && res.status !== 202) {
        console.error('Klaviyo sms subscribe:', res.status, await res.text());
        return Response.json(
          {error: 'Could not subscribe that number. Please try again.'},
          {status: 502},
        );
      }
    } catch (err) {
      console.error('Klaviyo sms error:', err);
      return Response.json(
        {error: 'Something went wrong. Please try again.'},
        {status: 500},
      );
    }
    return Response.json({success: true, discountCode: SMS_DISCOUNT});
  }

  return Response.json({error: 'Unknown step.'}, {status: 400});
}
