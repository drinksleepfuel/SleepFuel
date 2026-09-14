import {forwardRef} from 'react';
import {createSchema, type HydrogenComponentProps} from '@weaverse/hydrogen';
import {imageUrl, type WeaverseImage} from './shared';

export type UgcTone = 'midnight' | 'plum' | 'olive' | 'sand' | 'rose';

export const UGC_GRADIENTS: Record<UgcTone, string> = {
  midnight: 'linear-gradient(160deg, #4a5578 0%, #1a1f30 100%)',
  plum: 'linear-gradient(160deg, #7a4a63 0%, #2a1522 100%)',
  olive: 'linear-gradient(160deg, #4d6160 0%, #1a2726 100%)',
  sand: 'linear-gradient(160deg, #b89870 0%, #4a3820 100%)',
  rose: 'linear-gradient(160deg, #c47b8a 0%, #4a1e2a 100%)',
};

type UgcCardProps = Partial<HydrogenComponentProps> & {
  handle?: string;
  tone?: UgcTone;
  video?: WeaverseImage;
  badge?: string;
};

/**
 * One vertical card in the community carousel. Falls back to a tinted
 * gradient placeholder until a real creator video is supplied.
 */
const UgcCard = forwardRef<HTMLElement, UgcCardProps>(
  function UgcCard({handle, tone, video, badge, children, ...rest}, ref) {
    const src = imageUrl(video ?? null, '');

    return (
      <figure
        ref={ref}
        {...rest}
        data-ugc-card
        className="flex w-[240px] shrink-0 snap-center flex-col sm:w-[260px] lg:w-[280px]"
      >
        <div
          className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl"
          style={{background: UGC_GRADIENTS[tone ?? 'midnight']}}
        >
          {src ? (
            <video
              src={src}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="rgba(255,255,255,0.9)"
                    aria-hidden="true"
                  >
                    <path d="M7 5v10l8-5-8-5z" />
                  </svg>
                </div>
              </div>
              <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white/85">
                {badge || 'Video coming'}
              </span>
            </>
          )}
        </div>
        <figcaption className="mt-4 text-center text-sm font-medium tracking-tight text-[color:var(--color-ink)]">
          {handle}
        </figcaption>
        {children}
      </figure>
    );
  },
);

export default UgcCard;

export const schema = createSchema({
  type: 'ugc-card',
  title: 'Community video',
  settings: [
    {
      group: 'Content',
      inputs: [
        {type: 'text', name: 'handle', label: 'Creator handle'},
        {type: 'video', name: 'video', label: 'Vertical video'},
        {
          type: 'text',
          name: 'badge',
          label: 'Placeholder badge',
          defaultValue: 'Video coming',
        },
        {
          type: 'select',
          name: 'tone',
          label: 'Placeholder tint',
          configs: {
            options: [
              {value: 'midnight', label: 'Midnight'},
              {value: 'plum', label: 'Plum'},
              {value: 'olive', label: 'Olive'},
              {value: 'sand', label: 'Sand'},
              {value: 'rose', label: 'Rose'},
            ],
          },
          defaultValue: 'midnight',
        },
      ],
    },
  ],
});
