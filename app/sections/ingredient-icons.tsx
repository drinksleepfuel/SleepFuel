import type {ReactElement} from 'react';

/* ============================================================
   Ingredient glyphs, extracted from the product route so the
   `ingredient-item` Weaverse section can offer them as a choice.
   ============================================================ */

export type IngredientIcon = (props: {className?: string}) => ReactElement;

export function Glyph({
  className,
  children,
}: {
  className?: string;
  children: ReactElement | ReactElement[];
}) {
  return (
    <svg
      className={className}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const CrystalIcon: IngredientIcon = ({className}) => (
  <Glyph className={className}>
    <path d="M3.5 8 L7 4 H17 L20.5 8 L12 20.5 Z" />
    <path d="M3.5 8 H20.5" />
    <path d="M9.5 8 L12 20.5 L14.5 8" />
    <path d="M7 4 L9.5 8 M17 4 L14.5 8" />
  </Glyph>
);

export const TeaCupIcon: IngredientIcon = ({className}) => (
  <Glyph className={className}>
    <path d="M5 9.5 H16 V12 A5.5 5.5 0 0 1 5 12 Z" />
    <path d="M16 10 H18.5 A2 2 0 0 1 18.5 14 H17.5" />
    <path d="M4.5 20.5 H16.5" />
    <path d="M8 3 C 9 4.5, 7 5.5, 8 7" />
    <path d="M12 3 C 13 4.5, 11 5.5, 12 7" />
  </Glyph>
);

export const MindIcon: IngredientIcon = ({className}) => (
  <Glyph className={className}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="6" />
    <path d="M6.5 13 L8 8.5 L9.5 15 L11 11 H17.5" />
  </Glyph>
);

export const MoleculeIcon: IngredientIcon = ({className}) => (
  <Glyph className={className}>
    <path d="M16 5.1 L20 12 L16 18.9 L8 18.9 L4 12 L8 5.1 Z" />
    <circle cx="16" cy="5.1" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="20" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="16" cy="18.9" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="8" cy="18.9" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="8" cy="5.1" r="1.3" fill="currentColor" stroke="none" />
  </Glyph>
);

export const LeafIcon: IngredientIcon = ({className}) => (
  <Glyph className={className}>
    <path d="M4 20 C 4 12, 12 4, 20 4 C 20 12, 12 20, 4 20 Z" />
    <path d="M4 20 C 9 15, 14 10, 20 4" />
    <path d="M8.5 11.5 L11 13.5 M11.5 8 L14 10" />
  </Glyph>
);

export const MoonIcon: IngredientIcon = ({className}) => (
  <Glyph className={className}>
    <path d="M20.5 14 A8.5 8.5 0 1 1 10 3.5 A6.6 6.6 0 0 0 20.5 14 Z" />
    <path d="M18 4 l.7 1.6 1.6 .7 -1.6 .7 -.7 1.6 -.7 -1.6 -1.6 -.7 1.6 -.7 Z" />
  </Glyph>
);

/** Icon lookup used by the `ingredient-item` schema's select input. */
export const INGREDIENT_ICONS = {
  crystal: CrystalIcon,
  teacup: TeaCupIcon,
  mind: MindIcon,
  molecule: MoleculeIcon,
  leaf: LeafIcon,
  moon: MoonIcon,
} as const;

export type IngredientIconKey = keyof typeof INGREDIENT_ICONS;
