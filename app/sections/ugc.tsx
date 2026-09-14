import {Children, forwardRef, useRef, useState} from 'react';
import {createSchema, type HydrogenComponentProps} from '@weaverse/hydrogen';

type UgcSectionProps = Partial<HydrogenComponentProps> & {
  eyebrow?: string;
  heading?: string;
};

/** Horizontally scrolling community carousel with dot pagination. */
const UgcSection = forwardRef<HTMLElement, UgcSectionProps>(
  function UgcSection({eyebrow, heading, children, ...rest}, ref) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);
    const count = Children.count(children);

    // Card width plus the flex `gap-6` (24px) is one scroll step.
    const stepSize = () => {
      const t = trackRef.current;
      if (!t) return 0;
      const card = t.querySelector('[data-ugc-card]') as HTMLElement | null;
      return card ? card.offsetWidth + 24 : t.clientWidth;
    };

    const onScroll = () => {
      const t = trackRef.current;
      const step = stepSize();
      if (!t || !step) return;
      setActive(Math.round(t.scrollLeft / step));
    };

    const goTo = (i: number) => {
      const t = trackRef.current;
      const step = stepSize();
      if (!t || !step) return;
      const clamped = Math.max(0, Math.min(count - 1, i));
      t.scrollTo({left: step * clamped, behavior: 'smooth'});
    };

    return (
      <section
        ref={ref}
        {...rest}
        className="mx-auto max-w-7xl px-5 pt-8 pb-16 sm:px-6 sm:pt-16 lg:px-8 lg:py-20"
      >
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wide text-[color:var(--color-muted)]">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-[32px] font-normal leading-[1.1] tracking-tight sm:text-[40px] lg:text-[48px]">
              {heading}
            </h2>
          </div>
        </div>

        <div
          ref={trackRef}
          onScroll={onScroll}
          className="mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {Array.from({length: count}, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show video ${i + 1} of ${count}`}
              aria-current={active === i}
              className={`h-2 rounded-full shadow-sm ring-1 ring-black/10 transition-all ${
                active === i
                  ? 'w-6 bg-[color:var(--color-ink)]'
                  : 'w-2 bg-[color:var(--color-border)] hover:bg-[color:var(--color-muted)]'
              }`}
            />
          ))}
        </div>
      </section>
    );
  },
);

export default UgcSection;

export const schema = createSchema({
  type: 'ugc',
  title: 'Community carousel',
  childTypes: ['ugc-card'],
  settings: [
    {
      group: 'Content',
      inputs: [
        {
          type: 'text',
          name: 'eyebrow',
          label: 'Eyebrow',
          defaultValue: 'From the community',
        },
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Better sleepers, real routines.',
        },
      ],
    },
  ],
  presets: {
    eyebrow: 'From the community',
    heading: 'Better sleepers, real routines.',
    children: [{type: 'ugc-card'}],
  },
});
