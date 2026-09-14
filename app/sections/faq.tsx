import {forwardRef} from 'react';
import {createSchema, type HydrogenComponentProps} from '@weaverse/hydrogen';

type FAQSectionProps = Partial<HydrogenComponentProps> & {
  heading?: string;
};

/** Accordion FAQ. Individual questions are `faq-item` children. */
const FAQSection = forwardRef<HTMLElement, FAQSectionProps>(
  function FAQSection({heading, children, ...rest}, ref) {
    return (
      <section
        ref={ref}
        {...rest}
        className="mx-auto w-full max-w-3xl px-5 pb-28 sm:px-6 lg:px-8"
      >
        <h2 className="text-3xl tracking-tight sm:text-4xl">{heading}</h2>
        <div className="mt-8 border-t border-[color:var(--color-border)]">
          {children}
        </div>
      </section>
    );
  },
);

export default FAQSection;

export const schema = createSchema({
  type: 'faq',
  title: 'FAQ',
  childTypes: ['faq-item'],
  settings: [
    {
      group: 'Content',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Frequently asked questions',
        },
      ],
    },
  ],
  presets: {
    heading: 'Frequently asked questions',
    children: [{type: 'faq-item'}],
  },
});
