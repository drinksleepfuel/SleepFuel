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
/**
 * One recipe card inside `mocktails`.
 *
 * Renders as a plain card when `href` is empty so an unpublished recipe can't
 * send a shopper to a 404. Set the link in Studio once the post exists and the
 * card becomes clickable again.
 */
const MocktailCard = forwardRef<HTMLElement, MocktailCardProps>(
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
    const linked = Boolean(href);

    const inner = (
      <>
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
        <h3
          className={`mt-5 text-2xl tracking-tight${
            linked
              ? ' transition-colors group-hover:text-[color:var(--color-blue)]'
              : ''
          }`}
        >
          {name}
        </h3>
        <p className="mt-2 leading-relaxed text-[color:var(--color-muted)]">
          {description}
        </p>
        {linked && (
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-ink)] transition-transform group-hover:translate-x-0.5">
            {ctaLabel || 'Read the recipe'}
            <span aria-hidden="true">\u2192</span>
          </span>
        )}
        {children}
      </>
    );

    if (!linked) {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          {...rest}
          className="flex flex-col"
        >
          {inner}
        </div>
      );
    }

    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        {...rest}
        to={href as string}
        prefetch="intent"
        className="group flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-cream)]"
      >
        {inner}
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
        {
          type: 'image',
          name: 'image',
          label: 'Photo (overrides the bundled one)',
        },
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
        {
          type: 'url',
          name: 'href',
          label: 'Recipe link (leave empty to disable the link)',
        },
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
