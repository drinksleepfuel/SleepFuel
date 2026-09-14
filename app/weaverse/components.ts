import type {HydrogenComponent} from '@weaverse/hydrogen';
import * as Hero from '~/sections/hero';
import * as FeatureCallouts from '~/sections/feature-callouts';
import * as FeatureCalloutItem from '~/sections/feature-callout-item';
import * as CompetitorSection from '~/sections/competitor';
import * as CompetitorRow from '~/sections/competitor-row';
import * as FormulaScience from '~/sections/formula-science';
import * as IngredientItem from '~/sections/ingredient-item';
import * as UgcSection from '~/sections/ugc';
import * as UgcCard from '~/sections/ugc-card';
import * as OkendoReviewsSection from '~/sections/okendo-reviews';
import * as FAQSection from '~/sections/faq';
import * as FAQItem from '~/sections/faq-item';
import * as MocktailsSection from '~/sections/mocktails';
import * as MocktailCard from '~/sections/mocktail-card';

/**
 * Every section available in the Weaverse Studio picker.
 *
 * Registration MUST use a namespace import (`import * as X`) so Weaverse can
 * read the default export alongside the named `schema` / `loader` exports.
 *
 * Order here is the order of the live product page, which keeps the Studio
 * picker reading like the page itself.
 */
export const components: HydrogenComponent[] = [
  Hero,
  FeatureCallouts,
  FeatureCalloutItem,
  CompetitorSection,
  CompetitorRow,
  FormulaScience,
  IngredientItem,
  UgcSection,
  UgcCard,
  OkendoReviewsSection,
  FAQSection,
  FAQItem,
  MocktailsSection,
  MocktailCard,
];
