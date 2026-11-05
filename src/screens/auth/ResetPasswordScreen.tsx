import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, LoadingState } from '@/components/ui';
import {
  AuthHeading,
  AuthScreen,
  BrandMark,
  FormMessage,
  PasswordField,
} from '@/features/auth/components/auth-ui';
import { useResetPassword, useRecoverySession } from '@/features/auth/use-password-reset';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/navigation/routes';

export function ResetPasswordScreen() {
  const { tokens } = useTheme();
  const reset = useResetPassword();
  const recovery = useRecoverySession();

  const backToLogin = () => router.replace(ROUTES.login);

  if (recovery.isRecovering) {
    return (
      <AuthScreen title="Password">
        <LoadingState label="Preparing your password reset…" />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title="Password">
      <View className="items-center pt-4">
        <BrandMark size="lg" />
      </View>

      {reset.isSuccess ? (
        <View className="gap-7">
          <View className="items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-success-container">
              <Ionicons name="checkmark" size={28} color={tokens.onSuccessContainer} />
            </View>
            <AuthHeading
              eyebrow="All set"
              title="Your password has been updated."
              description="Sign in with your new password to pick up where you left off."
            />
          </View>

          <Button block size="lg" onPress={backToLogin}>
            Back to sign in
          </Button>
        </View>
      ) : (
        <View className="gap-7">
          <AuthHeading
            eyebrow="New password"
            title="Choose something new."
            description="Use at least six characters. A short phrase is easier to remember and safer than a single word."
          />

          {recovery.error ? <FormMessage message={recovery.error} /> : null}
          {reset.error ? <FormMessage message={reset.error} /> : null}

          <View className="gap-5">
            <PasswordField
              label="New password"
              value={reset.password}
              onChangeText={reset.setPassword}
              error={reset.errors.password}
              placeholder="Choose a password"
              autoComplete="new-password"
              textContentType="newPassword"
            />

            <PasswordField
              label="Confirm new password"
              value={reset.confirmation}
              onChangeText={reset.setConfirmation}
              error={reset.errors.confirmation}
              placeholder="Repeat your password"
              autoComplete="new-password"
              textContentType="newPassword"
            />

            <Button
              block
              size="lg"
              loading={reset.isSubmitting}
              onPress={() => {
                void reset.submit();
              }}
            >
              Update password
            </Button>
          </View>

          <Button variant="ghost" size="md" block onPress={backToLogin}>
            Back to sign in
          </Button>
        </View>
      )}
    </AuthScreen>
  );
}
