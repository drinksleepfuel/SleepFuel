import {forwardRef} from 'react';
import {createSchema, type HydrogenComponentProps} from '@weaverse/hydrogen';

type MocktailsSectionProps = Partial<HydrogenComponentProps> & {
  eyebrow?: string;
  heading?: string;
  intro?: string;
};

/** "Sleep Mocktails" — recipe cards linking through to the blog. */
const MocktailsSection = forwardRef<HTMLElement, MocktailsSectionProps>(
  function MocktailsSection({eyebrow, heading, intro, children, ...rest}, ref) {
    return (
      <section ref={ref} {...rest} className="bg-[color:var(--color-cream)]">
        <div className="mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wide text-[color:var(--color-muted)]">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-[36px] font-normal leading-[1.05] tracking-tight sm:text-[45px] lg:text-[54px]">
              {heading}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[color:var(--color-muted)]">
              {intro}
            </p>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {children}
          </div>
        </div>
      </section>
    );
  },
);

export default MocktailsSection;

export const schema = createSchema({
  type: 'mocktails',
  title: 'Sleep mocktails',
  childTypes: ['mocktail-card'],
  settings: [
    {
      group: 'Content',
      inputs: [
        {
          type: 'text',
          name: 'eyebrow',
          label: 'Eyebrow',
          defaultValue: 'Sleep Mocktails',
        },
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Turn your SleepFuel into a wind-down ritual.',
        },
        {type: 'textarea', name: 'intro', label: 'Intro copy'},
      ],
    },
  ],
  presets: {
    eyebrow: 'Sleep Mocktails',
    heading: 'Turn your SleepFuel into a wind-down ritual.',
    intro:
      'Three easy sleep-friendly mocktails. Each starts with one stick of SleepFuel and takes under two minutes.',
    children: [{type: 'mocktail-card'}],
  },
});
