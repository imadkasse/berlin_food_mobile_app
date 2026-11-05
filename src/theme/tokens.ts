/**
 * Berlin Food design tokens — the single source of truth for the visual design
 * system on mobile.
 *
 * Brand: warm minimalism. Primary #9F4200, accent #F27121, warm neutrals —
 * never pure black (#000000) or pure white (#FFFFFF).
 *
 * The light palette mirrors the web application's token set (see
 * `../client/src/app/globals.css`) so both products share one visual identity.
 * The dark palette is a first-class warm "espresso" theme — not an inversion
 * of light mode: elevation gets *lighter* on dark surfaces, and the brand
 * primary lightens to a warm apricot tone for contrast.
 *
 * These values are consumed in three places (keep in sync):
 *  - `tailwind.config.js` maps the token names to CSS variables.
 *  - `src/global.css` declares the same variables as `:root` defaults.
 *  - `src/theme/ThemeProvider.tsx` applies the active scheme's variables to
 *    the component tree via NativeWind's `vars()`.
 */

export type ThemeScheme = 'light' | 'dark';

const light = {
  /* Surfaces — warm paper layers. Depth through tone, never through lines. */
  background: '#FCF9F8',
  surface: '#F6F3F2',
  surfaceVariant: '#EAE7E7',
  surfaceRaised: '#FDFBFA',

  /* Content */
  onBackground: '#1C1B1B',
  onSurface: '#1C1B1B',
  onSurfaceVariant: '#584237',

  /* Brand */
  primary: '#9F4200',
  onPrimary: '#FCF9F8',
  accent: '#F27121',
  onAccent: '#541F00',
  accentSoft: '#FFDBCB',
  onAccentSoft: '#541F00',

  /* Lines — reserved for control affordances (input focus/error), never for
     section separation. */
  outline: '#8C7265',
  outlineVariant: '#DFC0B2',

  /* Feedback */
  error: '#BA1A1A',
  onError: '#FCF9F8',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  success: '#3A6B3E',
  onSuccess: '#F2FAF0',
  successContainer: '#C7EED0',
  onSuccessContainer: '#0C3B18',

  /* Inverse surfaces (toasts) and the modal scrim */
  inverseSurface: '#332E2B',
  inverseOnSurface: '#F5F0ED',
  scrim: '#1C1B1B',
} as const;

const dark: SemanticTokens = {
  /* Warm espresso layers — higher elevation is lighter (tonal depth). */
  background: '#15100D',
  surface: '#1E1815',
  surfaceVariant: '#292220',
  surfaceRaised: '#332C28',

  onBackground: '#EFE8E3',
  onSurface: '#EFE8E3',
  onSurfaceVariant: '#CFC3BB',

  /* Brand — primary lightens to a warm apricot; accent stays vibrant. */
  primary: '#FFB692',
  onPrimary: '#541F00',
  accent: '#F27121',
  onAccent: '#3B1600',
  accentSoft: '#4A2A18',
  onAccentSoft: '#FFD9C2',

  outline: '#A78F83',
  outlineVariant: '#52443D',

  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  success: '#97D7A6',
  onSuccess: '#0C3B18',
  successContainer: '#1F4D2B',
  onSuccessContainer: '#B7EFC3',

  inverseSurface: '#F5F0ED',
  inverseOnSurface: '#332E2B',
  scrim: '#0B0908',
};

/** Token names stay exact; values are plain hex strings. */
export type SemanticTokens = { [K in keyof typeof light]: string };
export type SemanticTokenName = keyof SemanticTokens;

/** Semantic token values per scheme, for imperative use (status bar tint,
 *  activity indicators, `SystemUI` background, …). */
export const semanticTokens: Record<ThemeScheme, SemanticTokens> = { light, dark };

/** Tailwind color token names — mirrors the `colors` mapping in
 *  `tailwind.config.js`. */
export const colorTokenNames = Object.keys(light) as SemanticTokenName[];

function toChannels(hex: string): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

function toCssVarName(token: SemanticTokenName): string {
  return `--color-${token.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}`;
}

export type ThemeCssVars = Record<string, string>;

function buildVars(tokens: SemanticTokens): ThemeCssVars {
  const vars: ThemeCssVars = {};
  for (const name of colorTokenNames) {
    vars[toCssVarName(name)] = toChannels(tokens[name]);
  }
  return vars;
}

/** CSS variable sets (`--color-*` as `r g b` channels) applied by the
 *  ThemeProvider so utilities like `bg-surface` resolve per scheme. */
export const themeCssVars: Record<ThemeScheme, ThemeCssVars> = {
  light: buildVars(light),
  dark: buildVars(dark),
};
