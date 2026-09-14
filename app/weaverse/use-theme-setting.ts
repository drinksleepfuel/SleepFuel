import {useThemeSettings} from '@weaverse/hydrogen';

/**
 * Reads one Weaverse theme setting, falling back to the value the component
 * originally shipped with.
 *
 * Studio returns a settings object whose keys are undefined until a merchant
 * saves, so a bare `settings.x` would render empty chrome on a fresh project.
 * Every call site must pass the current hardcoded value as `fallback`.
 */
export function useThemeSetting<T>(name: string, fallback: T): T {
  const settings = useThemeSettings() as Record<string, unknown> | undefined;
  const value = settings?.[name];

  if (value === undefined || value === null || value === '') return fallback;
  return value as T;
}

/**
 * Same, for settings stored as newline-separated text in Studio (Weaverse has
 * no repeater input at the theme level, so lists are edited as a textarea).
 */
export function useThemeSettingList(
  name: string,
  fallback: string[],
): string[] {
  const raw = useThemeSetting<string | undefined>(name, undefined);
  if (!raw) return fallback;

  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.length ? lines : fallback;
}

export type ParsedLink = {label: string; to: string; external?: boolean};

/**
 * Parses a newline-separated `Label | /target` list from a theme setting into
 * link objects. A target starting with `http` is treated as external.
 */
export function useThemeSettingLinks(
  name: string,
  fallback: ParsedLink[],
): ParsedLink[] {
  const raw = useThemeSetting<string | undefined>(name, undefined);
  if (!raw) return fallback;

  const links: ParsedLink[] = [];
  for (const line of raw.split('\n')) {
    const [label, to] = line.split('|').map((part) => part.trim());
    if (!label || !to) continue;
    links.push({label, to, external: to.startsWith('http')});
  }

  return links.length ? links : fallback;
}
