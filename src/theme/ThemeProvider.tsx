import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { useColorScheme, vars } from 'nativewind';
import { useThemeStore } from '@/stores';
import { semanticTokens, themeCssVars, type ThemeScheme } from '@/theme/tokens';

/**
 * Applies the Berlin Food design tokens to the component tree.
 *
 * - Syncs the persisted user preference (`useThemeStore`) into NativeWind's
 *   color scheme override, so both semantic CSS variables and `dark:` classes
 *   resolve correctly.
 * - Sets the semantic color variables for the active scheme via `vars()`,
 *   which every `bg-surface` / `text-on-surface` / … utility resolves
 *   against. Dark mode switches the token values themselves — components
 *   never need `dark:` variants for basic theming.
 * - Keeps the system UI (root view) background in sync so there is no light
 *   flash behind scrollable content in dark mode.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const mode = useThemeStore((state) => state.mode);
  const scheme: ThemeScheme = colorScheme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    setColorScheme(mode);
  }, [mode, setColorScheme]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(semanticTokens[scheme].background).catch(() => {
      // Best-effort: not critical if the root view color can't be set.
    });
  }, [scheme]);

  return (
    <View className="flex-1 bg-background" style={vars(themeCssVars[scheme])}>
      {children}
    </View>
  );
}
