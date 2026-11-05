import { useColorScheme } from '@/hooks/use-color-scheme';
import { semanticTokens, type SemanticTokens, type ThemeScheme } from '@/theme/tokens';

export type UseThemeResult = {
  /** The resolved (light/dark) scheme, honouring the user's preference. */
  colorScheme: ThemeScheme;
  /** Semantic token values for the active scheme, for the few places that
   *  need a raw color (ActivityIndicator, status bar tint, …). */
  tokens: SemanticTokens;
};

/**
 * Reads the active color scheme and its resolved semantic token values.
 * For styling, prefer NativeWind classes (`bg-surface`, `text-on-surface`, …)
 * and use this hook only when a raw color value is required.
 */
export function useTheme(): UseThemeResult {
  const { colorScheme } = useColorScheme();
  const scheme: ThemeScheme = colorScheme === 'dark' ? 'dark' : 'light';
  return {
    colorScheme: scheme,
    tokens: semanticTokens[scheme],
  };
}
