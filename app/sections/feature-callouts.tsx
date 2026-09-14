import {forwardRef} from 'react';
import {createSchema, type HydrogenComponentProps} from '@weaverse/hydrogen';
import featureCounterImage from '~/assets/feature-counter.jpg';
import featureBerriesImage from '~/assets/feature-berries.jpg';
import featureWakeImage from '~/assets/feature-wake.jpg';
import {imageAlt, imageUrl, type WeaverseImage} from './shared';

/**
 * Weaverse supplies its own internals (`Component`, `type`, `data-wv-*`); they
 * are optional here so the section can also be rendered directly from a route
 * while the page still lives in code.
 */
type FeatureCalloutsProps = Partial<HydrogenComponentProps>;

/**
 * The three photo cards under the hero. The cards themselves are child
 * components (`feature-callout-item`) so a merchant can reorder, add, or
 * remove one in Studio rather than being fixed at three.
 */
const FeatureCallouts = forwardRef<HTMLElement, FeatureCalloutsProps>(
  function FeatureCallouts({children, ...rest}, ref) {
    return (
      <section
        ref={ref}
        {...rest}
        className="mx-auto max-w-7xl px-5 pt-10 pb-10 sm:px-6 sm:pt-20 lg:px-8 lg:pt-28 lg:pb-14"
      >
        <div className="grid gap-6 md:grid-cols-3">{children}</div>
      </section>
    );
  },
);

export default FeatureCallouts;

export const schema = createSchema({
  type: 'feature-callouts',
  title: 'Feature callouts',
  childTypes: ['feature-callout-item'],
  settings: [],
  presets: {
    children: [
      {
        type: 'feature-callout-item',
        eyebrow: 'Engineered in every way',
        title: 'Deep sleep, by design',
        copy: 'Six evidence-backed actives — magnesium glycinate, L-theanine, GABA, inositol, lemon balm, and a micro-dose of melatonin.',
        alt: 'SleepFuel mixed berry drink mix sticks on a marble counter',
      },
      {
        type: 'feature-callout-item',
        eyebrow: 'Mixed berry like you’ve never tasted',
        title: 'Actually delicious',
        copy: 'No chalky aftertaste, no sugar crash. One stick into cold or warm water and you’re set for the night.',
        alt: 'A SleepFuel drink mix stick resting on a bowl of fresh mixed berries',
      },
      {
        type: 'feature-callout-item',
        eyebrow: 'Made for you and all you do',
        title: 'Wake up clear',
        copy: 'Deeper, more restorative sleep with no morning grogginess and no melatonin hangover.',
        alt: 'A woman waking up rested in lavender pajamas beside a glass of water',
      },
    ],
  },
});
