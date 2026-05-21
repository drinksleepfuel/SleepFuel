import {useEffect, useState, type FormEvent} from 'react';

const COOKIE_NAME = 'sf_popup_seen';
const COOKIE_DAYS = 30;
const DELAY_MS = 4000;

function hasCookie(name: string) {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c.startsWith(`${name}=`));
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function EmailCapturePopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState<string | null>(null);

  useEffect(() => {
    if (hasCookie(COOKIE_NAME)) return;
    const t = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  function dismiss() {
    setOpen(false);
    setCookie(COOKIE_NAME, '1', COOKIE_DAYS);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg(null);

    const fd = new FormData();
    fd.set('email', email);

    try {
      const res = await fetch('/api/klaviyo-subscribe', {
        method: 'POST',
        body: fd,
      });
      const data = (await res.json()) as
        | {success: true; discountCode: string; configured: boolean}
        | {error: string};

      if ('error' in data) {
        setStatus('error');
        setErrorMsg(data.error);
        return;
      }

      setDiscountCode(data.discountCode);
      setStatus('success');
      setCookie(COOKIE_NAME, '1', COOKIE_DAYS);
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sf-popup-title"
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close popup"
      />
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
        style={{fontFamily: 'var(--font-body)'}}
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-recovery)] hover:bg-[color:var(--color-neutral)]"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l10 10M14 4L4 14" strokeLinecap="round" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className="text-center">
            <div
              className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full"
              style={{background: 'var(--color-awaking)'}}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 14l5 5 11-11" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2
              id="sf-popup-title"
              className="text-2xl font-semibold"
              style={{fontFamily: 'var(--font-display)'}}
            >
              You&rsquo;re in.
            </h2>
            <p className="mt-2 text-sm text-[color:var(--color-recovery)]">
              Use this code at checkout for 15% off your first order:
            </p>
            <div
              className="mt-4 select-all rounded-xl px-4 py-3 text-center text-lg font-semibold tracking-widest"
              style={{
                background: 'var(--color-neutral)',
                color: 'var(--color-midnight)',
              }}
            >
              {discountCode}
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="btn-primary mt-6 w-full"
            >
              Start shopping
            </button>
          </div>
        ) : (
          <>
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
              style={{
                background: 'var(--color-awaking)',
                color: 'var(--color-midnight)',
              }}
            >
              First-time offer
            </div>
            <h2
              id="sf-popup-title"
              className="text-3xl font-semibold leading-tight"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-midnight)',
              }}
            >
              15% off your first night of better sleep.
            </h2>
            <p className="mt-3 text-sm text-[color:var(--color-recovery)]">
              Drop your email — we&rsquo;ll send a code that works on any pack.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <label className="block">
                <span className="sr-only">Email address</span>
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-full border border-[color:var(--color-jet)] bg-white px-5 py-3 text-base outline-none focus:border-[color:var(--color-midnight)]"
                  autoComplete="email"
                />
              </label>

              {errorMsg && (
                <p className="text-sm text-red-600" role="alert">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'submitting' ? 'Sending…' : 'Send my 15% code'}
              </button>

              <button
                type="button"
                onClick={dismiss}
                className="block w-full text-center text-xs text-[color:var(--color-recovery)] hover:underline"
              >
                No thanks, I&rsquo;ll pay full price
              </button>
            </form>

            <p className="mt-4 text-[10px] leading-snug text-[color:var(--color-recovery)]">
              By submitting, you agree to receive marketing emails from SleepFuel. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
