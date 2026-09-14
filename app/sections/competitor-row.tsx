import {forwardRef} from 'react';
import {createSchema, type HydrogenComponentProps} from '@weaverse/hydrogen';

type CompetitorRowProps = Partial<HydrogenComponentProps> & {
  label?: string;
  sleepfuel?: string;
  others?: string;
};

/** One comparison row inside `competitor`. */
const CompetitorRow = forwardRef<HTMLTableRowElement, CompetitorRowProps>(
  function CompetitorRow({label, sleepfuel, others, ...rest}, ref) {
    return (
      <tr ref={ref} {...rest}>
        <th
          scope="row"
          className="border-t border-[color:var(--color-border)] px-3 py-4 text-left font-medium text-[color:var(--color-ink)]"
        >
          {label}
        </th>
        <td className="border-t border-white/15 px-3 py-4 text-center font-semibold text-white">
          {sleepfuel}
        </td>
        <td className="border-t border-[color:var(--color-border)] px-3 py-4 text-center text-[color:var(--color-muted)]">
          {others}
        </td>
      </tr>
    );
  },
);

export default CompetitorRow;

export const schema = createSchema({
  type: 'competitor-row',
  title: 'Comparison row',
  settings: [
    {
      group: 'Content',
      inputs: [
        {type: 'text', name: 'label', label: 'Row label'},
        {type: 'text', name: 'sleepfuel', label: 'SleepFuel value'},
        {type: 'text', name: 'others', label: 'Others value'},
      ],
    },
  ],
});
