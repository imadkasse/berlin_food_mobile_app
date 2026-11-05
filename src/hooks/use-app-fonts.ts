import { useFonts } from 'expo-font';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';

/**
 * Loads the Plus Jakarta Sans family (weights 400–800). Each weight registers
 * under its own family name, matching the `font-sans*` utilities in
 * `tailwind.config.js` — React Native cannot synthesize weights from a single
 * font file, so `font-bold` alone never changes the typeface.
 *
 * Weights are imported from their subpaths so only the five used font files
 * are bundled (the package root re-exports every weight, including italics).
 */
export function useAppFonts() {
  return useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
}
