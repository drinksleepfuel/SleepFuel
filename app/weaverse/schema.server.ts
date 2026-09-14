import type {HydrogenThemeSchema} from '@weaverse/hydrogen';
import {version} from '../../package.json';

/**
 * Theme-level settings surfaced in Weaverse Studio > Theme > Customize.
 *
 * Defaults mirror the tokens declared in `app/styles/app.css` so the Studio
 * opens matching the live storefront. Changing a value here only changes the
 * default for a *new* project — once a merchant saves in Studio, their value
 * wins.
 */
export const themeSchema: HydrogenThemeSchema = {
  info: {
    version,
    author: 'SleepFuel',
    name: 'SleepFuel Storefront',
    authorProfilePhoto: '',
    documentationUrl: 'https://docs.weaverse.io',
    supportUrl: 'https://help.weaverse.io/',
  },
  settings: [
    {
      group: 'Colors',
      inputs: [
        {
          type: 'color',
          name: 'colorCream',
          label: 'Page background',
          defaultValue: '#f6f3ef',
        },
        {
          type: 'color',
          name: 'colorInk',
          label: 'Headings & primary text',
          defaultValue: '#1c1b1a',
        },
        {
          type: 'color',
          name: 'colorMuted',
          label: 'Secondary text',
          defaultValue: '#5f6368',
        },
        {
          type: 'color',
          name: 'colorBorder',
          label: 'Hairline borders',
          defaultValue: '#e2dbd3',
        },
        {
          type: 'color',
          name: 'colorBlue',
          label: 'Primary CTA',
          defaultValue: '#1b4de0',
        },
        {
          type: 'color',
          name: 'colorFooter',
          label: 'Footer background',
          defaultValue: '#262220',
        },
      ],
    },
    {
      group: 'Layout',
      inputs: [
        {
          type: 'range',
          name: 'pageWidth',
          label: 'Max page width',
          configs: {min: 1100, max: 1600, step: 20, unit: 'px'},
          defaultValue: 1280,
        },
      ],
    },
  ],
};
