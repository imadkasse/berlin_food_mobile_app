/**
 * Berlin Food design system — Tailwind / NativeWind theme.
 *
 * Colors are semantic tokens backed by CSS variables (`--color-*`) whose
 * values are switched per color scheme by ThemeProvider. Never hardcode raw
 * hex values here or in components — add or adjust tokens in
 * `src/theme/tokens.ts` instead (values are mirrored in `src/global.css`).
 *
 * Typography uses Plus Jakarta Sans. React Native cannot synthesize weights
 * from a single font file, so every weight is its own family: use
 * `font-sans-medium`, `font-sans-semibold`, `font-sans-bold` or the base
 * `Text` component's `weight` prop instead of `font-bold`.
 *
 * Radius follows the web app's "Round Eight" philosophy (8 / 16 / 24 / 32 /
 * 48), mirrored from `../client/src/app/globals.css`.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        /* Surfaces */
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-variant': 'rgb(var(--color-surface-variant) / <alpha-value>)',
        'surface-raised': 'rgb(var(--color-surface-raised) / <alpha-value>)',

        /* Content */
        'on-background': 'rgb(var(--color-on-background) / <alpha-value>)',
        'on-surface': 'rgb(var(--color-on-surface) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--color-on-surface-variant) / <alpha-value>)',

        /* Brand */
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'on-primary': 'rgb(var(--color-on-primary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'on-accent': 'rgb(var(--color-on-accent) / <alpha-value>)',
        'accent-soft': 'rgb(var(--color-accent-soft) / <alpha-value>)',
        'on-accent-soft': 'rgb(var(--color-on-accent-soft) / <alpha-value>)',

        /* Lines — control affordances only, never section separation */
        outline: 'rgb(var(--color-outline) / <alpha-value>)',
        'outline-variant': 'rgb(var(--color-outline-variant) / <alpha-value>)',

        /* Feedback */
        error: 'rgb(var(--color-error) / <alpha-value>)',
        'on-error': 'rgb(var(--color-on-error) / <alpha-value>)',
        'error-container': 'rgb(var(--color-error-container) / <alpha-value>)',
        'on-error-container': 'rgb(var(--color-on-error-container) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        'on-success': 'rgb(var(--color-on-success) / <alpha-value>)',
        'success-container': 'rgb(var(--color-success-container) / <alpha-value>)',
        'on-success-container': 'rgb(var(--color-on-success-container) / <alpha-value>)',

        /* Inverse surfaces and the modal scrim */
        'inverse-surface': 'rgb(var(--color-inverse-surface) / <alpha-value>)',
        'inverse-on-surface': 'rgb(var(--color-inverse-on-surface) / <alpha-value>)',
        scrim: 'rgb(var(--color-scrim) / <alpha-value>)',
      },
      fontFamily: {
        /* Plus Jakarta Sans — one family per weight (React Native limitation) */
        sans: ['PlusJakartaSans_400Regular'],
        'sans-medium': ['PlusJakartaSans_500Medium'],
        'sans-semibold': ['PlusJakartaSans_600SemiBold'],
        'sans-bold': ['PlusJakartaSans_700Bold'],
        'sans-extrabold': ['PlusJakartaSans_800ExtraBold'],
      },
      /* Typography scale — sizes pair with an explicit weight class
         (font-sans-bold, …), never with the bare font-weight utilities. */
      fontSize: {
        display: ['40px', { lineHeight: '48px', letterSpacing: '-0.4px' }],
        headline: ['32px', { lineHeight: '40px', letterSpacing: '-0.32px' }],
        'title-lg': ['24px', { lineHeight: '32px', letterSpacing: '-0.24px' }],
        title: ['20px', { lineHeight: '28px' }],
        'body-lg': ['17px', { lineHeight: '26px' }],
        body: ['15px', { lineHeight: '24px' }],
        'body-sm': ['13px', { lineHeight: '20px' }],
        label: ['12px', { lineHeight: '16px', letterSpacing: '0.16px' }],
        caption: ['11px', { lineHeight: '14px', letterSpacing: '0.08px' }],
      },
      /* Berlin Food "Round Eight" philosophy — mirrors the web app */
      borderRadius: {
        sm: '8px',
        DEFAULT: '16px',
        md: '24px',
        lg: '32px',
        xl: '48px',
        '2xl': '64px',
      },
    },
  },
  plugins: [],
};
