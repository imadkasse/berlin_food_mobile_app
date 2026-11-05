import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';
import {
  AuthHeading,
  AuthScreen,
  BrandMark,
  FormMessage,
  PasswordField,
  SocialButton,
} from '@/features/auth/components/auth-ui';
import { toHref } from '@/features/auth/navigation';
import { useLogin } from '@/features/auth/use-login';
import { ROLE_HOME, ROUTES } from '@/navigation/routes';
import { useSession } from '@/providers/SessionProvider';

export function LoginScreen() {
  const { isSignedIn, role } = useSession();
  const login = useLogin();

  // The root navigator never pushes a signed-in user by itself; each auth
  // screen hands over to the role home as soon as the session resolves. This
  // also covers opening the sign-in route while already authenticated.
  useEffect(() => {
    if (isSignedIn) {
      router.replace(ROLE_HOME[role]);
    }
  }, [isSignedIn, role]);

  return (
    <AuthScreen title="Account">
      <View className="items-center pt-4">
        <BrandMark size="lg" />
      </View>

      <AuthHeading
        eyebrow="Welcome back"
        title="Sign in to Berlin Food"
        description="Your table, your orders and your saved addresses — all in one place."
      />

      {login.error ? <FormMessage message={login.error} /> : null}
      {login.notice ? <FormMessage message={login.notice} tone="neutral" /> : null}

      <View className="gap-5">
        <Input
          label="Email address"
          value={login.email}
          onChangeText={login.setEmail}
          placeholder="name@example.com"
          error={login.errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
        />

        <PasswordField
          label="Password"
          value={login.password}
          onChangeText={login.setPassword}
          error={login.errors.password}
          placeholder="Your password"
          autoComplete="current-password"
          textContentType="password"
        />

        <Pressable
          onPress={() => router.push(ROUTES.forgotPassword)}
          accessibilityRole="button"
          className="-mt-2 self-end"
          hitSlop={8}
        >
          <Text variant="body-sm" weight="semibold" tone="primary">
            Forgot your password?
          </Text>
        </Pressable>

        <Button
          block
          size="lg"
          loading={login.isSubmitting}
          onPress={() => {
            void login.submit();
          }}
        >
          Sign in
        </Button>
      </View>

      <View className="items-center gap-1">
        <Text
          variant="label"
          weight="semibold"
          tone="secondary"
          className="uppercase tracking-widest"
        >
          or continue with
        </Text>
      </View>

      <View className="flex-row items-start gap-3">
        <SocialButton
          label="Google"
          icon="logo-google"
          loading={login.isGoogleLoading}
          onPress={() => {
            void login.signInWithGoogle();
          }}
        />
        <SocialButton label="Apple" icon="logo-apple" disabled note="Coming soon" />
      </View>

      <View className="items-center gap-4 pt-2">
        <View className="flex-row items-center gap-1">
          <Text variant="body-sm" tone="secondary">
            New to Berlin Food?
          </Text>
          <Pressable
            onPress={() => router.push(toHref(ROUTES.register))}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text variant="body-sm" weight="semibold" tone="primary">
              Create an account
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push(ROUTES.registerAsDelivery)}
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text variant="body-sm" weight="semibold" tone="secondary">
            Delivering with us? Apply as a courier
          </Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}
