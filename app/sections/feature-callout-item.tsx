import {forwardRef} from 'react';
import {createSchema, type HydrogenComponentProps} from '@weaverse/hydrogen';
import featureCounterImage from '~/assets/feature-counter.jpg';
import featureBerriesImage from '~/assets/feature-berries.jpg';
import featureWakeImage from '~/assets/feature-wake.jpg';
import {imageAlt, imageUrl, type WeaverseImage} from './shared';

/**
 * The photos this card ships with. `imageKey` picks one so the bundled asset
 * stays the fallback without every card collapsing onto the same photo; an
 * uploaded `image` still wins when a merchant sets one.
 */
const FEATURE_IMAGES = {
  counter: featureCounterImage,
  berries: featureBerriesImage,
  wake: featureWakeImage,
} as unknown as Record<string, string>;

type FeatureCalloutItemProps = Partial<HydrogenComponentProps> & {
  imageKey?: keyof typeof FEATURE_IMAGES;
  eyebrow?: string;
  title?: string;
  copy?: string;
  image?: WeaverseImage;
  alt?: string;
};

/** One photo card inside `feature-callouts`. */
const FeatureCalloutItem = forwardRef<HTMLElement, FeatureCalloutItemProps>(
  function FeatureCalloutItem(
    {eyebrow, title, copy, image, imageKey, alt, children, ...rest},
    ref,
  ) {
    const src = imageUrl(
      image ?? null,
      FEATURE_IMAGES[imageKey ?? 'counter'] ?? FEATURE_IMAGES.counter,
    );
    const altText = imageAlt(image ?? null, alt ?? '');

    return (
      <article ref={ref} {...rest} className="flex flex-col">
        <div className="aspect-[3/4] w-full overflow-hidden rounded-3xl">
          <img
            src={src}
            alt={altText}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <h3 className="mt-6 text-2xl tracking-tight">{title}</h3>
        <p className="mt-1 text-sm font-medium uppercase tracking-wide text-[color:var(--color-muted)]">
          {eyebrow}
        </p>
        <p className="mt-3 leading-relaxed text-[color:var(--color-ink)]">
          {copy}
        </p>
        {children}
      </article>
    );
  },
);

export default FeatureCalloutItem;

export const schema = createSchema({
  type: 'feature-callout-item',
  title: 'Feature card',
  settings: [
    {
      group: 'Content',
      inputs: [
        {type: 'image', name: 'image', label: 'Photo (overrides the bundled one)'},
        {
          type: 'select',
          name: 'imageKey',
          label: 'Bundled photo',
          configs: {
            options: [
              {value: 'counter', label: 'Counter'},
              {value: 'berries', label: 'Berries'},
              {value: 'wake', label: 'Wake up'},
            ],
          },
          defaultValue: 'counter',
        },
        {type: 'text', name: 'alt', label: 'Photo alt text'},
        {type: 'text', name: 'title', label: 'Title'},
        {type: 'text', name: 'eyebrow', label: 'Eyebrow'},
        {type: 'textarea', name: 'copy', label: 'Body copy'},
      ],
    },
  ],
});
