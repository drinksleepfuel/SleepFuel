import {useThemeSettings} from '@weaverse/hydrogen';

/**
 * Projects the Weaverse theme settings onto the CSS custom properties that
 * `app/styles/app.css` already consumes, so Studio edits flow straight into
 * the existing design system instead of a parallel one.
 *
 * Rendered in <head> (see `app/root.tsx`) after the stylesheets so these
 * values win over the `@theme` defaults.
 */
export function GlobalStyle() {
  const settings = useThemeSettings();

  if (!settings) return null;

  // Until a merchant saves theme settings in Studio, `settings` is present but
  // its keys are undefined. Emitting `--color-ink: undefined` would override
  // the real `@theme` tokens in app.css with an invalid value, so only write
  // properties that actually resolved.
  const vars: Array<[string, string | number | undefined]> = [
    ['--color-cream', settings.colorCream],
    ['--color-ink', settings.colorInk],
    ['--color-muted', settings.colorMuted],
    ['--color-border', settings.colorBorder],
    ['--color-blue', settings.colorBlue],
    ['--color-footer', settings.colorFooter],
    ['--page-width', settings.pageWidth ? `${settings.pageWidth}px` : undefined],
  ];

  const declarations = vars
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([property, value]) => `${property}: ${value};`)
    .join('\n            ');

  if (!declarations) return null;

  return (
    <style
      id="weaverse-global-style"
      key="weaverse-global-style"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `
          :root {
            ${declarations}
          }
        `,
      }}
    />
  );
}
