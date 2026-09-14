import {forwardRef, useState} from 'react';
import {createSchema, type HydrogenComponentProps} from '@weaverse/hydrogen';

type FAQItemProps = Partial<HydrogenComponentProps> & {
  question?: string;
  answer?: string;
};

/** One expandable question inside the `faq` section. */
const FAQItem = forwardRef<HTMLDivElement, FAQItemProps>(
  function FAQItem({question, answer, children, ...rest}, ref) {
    const [open, setOpen] = useState(false);

    return (
      <div
        ref={ref}
        {...rest}
        className="border-b border-[color:var(--color-border)]"
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-6 py-5 text-left outline-none focus:outline-none focus-visible:text-[color:var(--color-blue)]"
        >
          <span className="text-lg">{question}</span>
          <span
            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border)] transition-transform ${
              open ? 'rotate-45' : ''
            }`}
            aria-hidden="true"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M7 1v12M1 7h12" strokeLinecap="round" />
            </svg>
          </span>
        </button>
        {open && (
          <p className="max-w-prose pb-5 pr-10 leading-relaxed text-[color:var(--color-muted)]">
            {answer}
          </p>
        )}
        {children}
      </div>
    );
  },
);

export default FAQItem;

export const schema = createSchema({
  type: 'faq-item',
  title: 'FAQ question',
  settings: [
    {
      group: 'Content',
      inputs: [
        {type: 'text', name: 'question', label: 'Question'},
        {type: 'textarea', name: 'answer', label: 'Answer'},
      ],
    },
  ],
});
