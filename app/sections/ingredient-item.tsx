import {forwardRef} from 'react';
import {createSchema, type HydrogenComponentProps} from '@weaverse/hydrogen';
import {INGREDIENT_ICONS, type IngredientIconKey} from './ingredient-icons';

type IngredientItemProps = Partial<HydrogenComponentProps> & {
  name?: string;
  dose?: string;
  benefit?: string;
  icon?: IngredientIconKey;
};

/** One ingredient tile inside `formula-science`. */
const IngredientItem = forwardRef<HTMLDivElement, IngredientItemProps>(
  function IngredientItem({name, dose, benefit, icon, children, ...rest}, ref) {
    const Icon = INGREDIENT_ICONS[icon ?? 'crystal'] ?? INGREDIENT_ICONS.crystal;

    return (
      <div ref={ref} {...rest} className="flex gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eae3da] text-[color:var(--color-ink)]">
          <Icon className="h-[22px] w-[22px]" />
        </span>
        <div>
          <dt className="font-medium leading-tight">{name}</dt>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-[color:var(--color-muted)]">
            {dose}
          </p>
          <dd className="mt-1.5 text-sm leading-relaxed text-[color:var(--color-muted)]">
            {benefit}
          </dd>
        </div>
        {children}
      </div>
    );
  },
);

export default IngredientItem;

export const schema = createSchema({
  type: 'ingredient-item',
  title: 'Ingredient',
  settings: [
    {
      group: 'Content',
      inputs: [
        {type: 'text', name: 'name', label: 'Ingredient name'},
        {type: 'text', name: 'dose', label: 'Dose line'},
        {type: 'textarea', name: 'benefit', label: 'Benefit'},
        {
          type: 'select',
          name: 'icon',
          label: 'Icon',
          configs: {
            options: [
              {value: 'crystal', label: 'Crystal'},
              {value: 'teacup', label: 'Tea cup'},
              {value: 'mind', label: 'Mind'},
              {value: 'molecule', label: 'Molecule'},
              {value: 'leaf', label: 'Leaf'},
              {value: 'moon', label: 'Moon'},
            ],
          },
          defaultValue: 'crystal',
        },
      ],
    },
  ],
});
