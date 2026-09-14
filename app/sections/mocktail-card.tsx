import {forwardRef} from 'react';
import {Link} from 'react-router';
import {createSchema, type HydrogenComponentProps} from '@weaverse/hydrogen';
import mocktailCherryImage from '~/assets/mocktail-cherry.jpg';
import mocktailChamomileImage from '~/assets/mocktail-chamomile.jpg';
import mocktailLatteImage from '~/assets/mocktail-latte.jpg';
import {imageAlt, imageUrl, type WeaverseImage} from './shared';

/** Bundled recipe photos; see the note in `feature-callout-item`. */
const MOCKTAIL_IMAGES = {
  cherry: mocktailCherryImage,
  chamomile: mocktailChamomileImage,
  latte: mocktailLatteImage,
} as unknown as Record<string, string>;

type MocktailCardProps = Partial<HydrogenComponentProps> & {
  imageKey?: keyof typeof MOCKTAIL_IMAGES;
  name?: string;
  description?: string;
  href?: string;
  image?: WeaverseImage;
  imageAlt?: string;
  ctaLabel?: string;
};

/** One recipe card inside `mocktails`. */
const MocktailCard = forwardRef<HTMLAnchorElement, MocktailCardProps>(
  function MocktailCard(
    {
      name,
      description,
      href,
      image,
      imageKey,
      imageAlt: alt,
      ctaLabel,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <Link
        ref={ref}
        {...rest}
        to={href || '#'}
        prefetch="intent"
        className="group flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-cream)]"
      >
        <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl">
          <img
            src={imageUrl(
              image ?? null,
              MOCKTAIL_IMAGES[imageKey ?? 'cherry'] ?? MOCKTAIL_IMAGES.cherry,
            )}
            alt={imageAlt(image ?? null, alt || name || '')}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <h3 className="mt-5 text-2xl tracking-tight transition-colors group-hover:text-[color:var(--color-blue)]">
          {name}
        </h3>
        <p className="mt-2 leading-relaxed text-[color:var(--color-muted)]">
          {description}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-ink)] transition-transform group-hover:translate-x-0.5">
          {ctaLabel || 'Read the recipe'}
          <span aria-hidden="true">→</span>
        </span>
        {children}
      </Link>
    );
  },
);

export default MocktailCard;

export const schema = createSchema({
  type: 'mocktail-card',
  title: 'Mocktail recipe',
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
              {value: 'cherry', label: 'Tart cherry'},
              {value: 'chamomile', label: 'Chamomile'},
              {value: 'latte', label: 'Golden latte'},
            ],
          },
          defaultValue: 'cherry',
        },
        {type: 'text', name: 'imageAlt', label: 'Photo alt text'},
        {type: 'text', name: 'name', label: 'Recipe name'},
        {type: 'textarea', name: 'description', label: 'Description'},
        {type: 'url', name: 'href', label: 'Recipe link'},
        {
          type: 'text',
          name: 'ctaLabel',
          label: 'Link label',
          defaultValue: 'Read the recipe',
        },
      ],
    },
  ],
});
