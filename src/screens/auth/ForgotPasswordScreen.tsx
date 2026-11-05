import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';
import {
  AuthHeading,
  AuthScreen,
  BrandMark,
  FormMessage,
} from '@/features/auth/components/auth-ui';
import { useForgotPassword } from '@/features/auth/use-password-reset';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/navigation/routes';

export function ForgotPasswordScreen() {
  const { tokens } = useTheme();
  const forgot = useForgotPassword();

  const backToLogin = () => router.replace(ROUTES.login);

  return (
    <AuthScreen title="Password">
      <View className="items-center pt-4">
        <BrandMark size="lg" />
      </View>

      {forgot.isSubmitted ? (
        <View className="gap-7">
          <View className="items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-success-container">
              <Ionicons name="mail-open-outline" size={26} color={tokens.onSuccessContainer} />
            </View>
            <AuthHeading
              eyebrow="Check your inbox"
              title="The reset link is on its way."
              description={`We sent a password reset link to ${forgot.email.trim()}. It may take a minute to arrive.`}
            />
          </View>

          <View className="gap-3">
            <Button block size="lg" onPress={backToLogin}>
              Back to sign in
            </Button>
            <Button variant="ghost" size="md" block onPress={forgot.reset}>
              Send another email
            </Button>
          </View>
        </View>
      ) : (
        <View className="gap-7">
          <AuthHeading
            eyebrow="Forgot password"
            title="Let's get you back in."
            description="Enter the email tied to your account and we will send you a secure reset link."
          />

          {forgot.error ? <FormMessage message={forgot.error} /> : null}

          <View className="gap-5">
            <Input
              label="Email address"
              value={forgot.email}
              onChangeText={forgot.setEmail}
              placeholder="name@example.com"
              error={forgot.fieldError ?? undefined}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
            />

            <Button
              block
              size="lg"
              loading={forgot.isSubmitting}
              onPress={() => {
                void forgot.submit();
              }}
            >
              Send reset link
            </Button>
          </View>

          <Pressable
            onPress={backToLogin}
            accessibilityRole="button"
            className="items-center"
            hitSlop={8}
          >
            <Text variant="body-sm" weight="semibold" tone="primary">
              Back to sign in
            </Text>
          </Pressable>
        </View>
      )}
    </AuthScreen>
  );
}
