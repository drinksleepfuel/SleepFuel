import {forwardRef} from 'react';
import {createSchema, type HydrogenComponentProps} from '@weaverse/hydrogen';
import comparisonBgVideo from '~/assets/comparison-bg.mp4';
import {imageUrl, type WeaverseImage} from './shared';

type CompetitorSectionProps = Partial<HydrogenComponentProps> & {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  ourLabel?: string;
  theirLabel?: string;
  backgroundVideo?: WeaverseImage;
};

/**
 * Two-column comparison table. A looping video sits behind the SleepFuel
 * column; the `<colgroup>` widths (34/33/33) and the video's `left`/`width`
 * are deliberately kept in sync.
 */
const CompetitorSection = forwardRef<HTMLElement, CompetitorSectionProps>(
  function CompetitorSection(
    {
      eyebrow,
      heading,
      intro,
      ourLabel,
      theirLabel,
      backgroundVideo,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <section
        ref={ref}
        {...rest}
        className="mx-auto max-w-7xl px-5 pt-16 pb-12 sm:px-6 lg:px-8 lg:pt-20 lg:pb-16"
      >
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

        <div className="mt-10 overflow-x-auto">
          {/* min-w matches the table below. Without it this wrapper sizes to
              the viewport inside `overflow-x-auto`, so the video's 34%/33%
              resolves against a narrower box than the columns and drifts out
              of alignment on mobile. */}
          <div className="relative min-w-[560px]">
            <video
              src={imageUrl(
                backgroundVideo ?? null,
                comparisonBgVideo as unknown as string,
              )}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-[34%] z-0 h-full w-[33%] overflow-hidden rounded-2xl object-cover"
              style={{filter: 'brightness(0.8)'}}
            />
            <table className="relative z-10 w-full min-w-[560px] border-separate border-spacing-0 text-sm">
              <colgroup>
                <col style={{width: '34%'}} />
                <col style={{width: '33%'}} />
                <col style={{width: '33%'}} />
              </colgroup>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-[color:var(--color-muted)]"
                  >
                    <span className="sr-only">Category</span>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-4 text-center text-base font-semibold text-white"
                  >
                    {ourLabel}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-4 text-center text-sm font-medium text-[color:var(--color-ink)]"
                  >
                    {theirLabel}
                  </th>
                </tr>
              </thead>
              <tbody>{children}</tbody>
            </table>
          </div>
        </div>
      </section>
    );
  },
);

export default CompetitorSection;

export const schema = createSchema({
  type: 'competitor',
  title: 'Competitor comparison',
  childTypes: ['competitor-row'],
  settings: [
    {
      group: 'Content',
      inputs: [
        {
          type: 'text',
          name: 'eyebrow',
          label: 'Eyebrow',
          defaultValue: 'The competition',
        },
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'How SleepFuel stacks up.',
        },
        {type: 'textarea', name: 'intro', label: 'Intro copy'},
        {
          type: 'text',
          name: 'ourLabel',
          label: 'Our column label',
          defaultValue: 'SleepFuel',
        },
        {
          type: 'text',
          name: 'theirLabel',
          label: 'Their column label',
          defaultValue: 'Others',
        },
        {type: 'video', name: 'backgroundVideo', label: 'Column background video'},
      ],
    },
  ],
  presets: {
    eyebrow: 'The competition',
    heading: 'How SleepFuel stacks up.',
    intro:
      'A quick, honest look at how our formula compares to the field of popular sleep drinks.',
    ourLabel: 'SleepFuel',
    theirLabel: 'Others',
    children: [{type: 'competitor-row'}],
  },
});
