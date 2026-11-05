import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { Badge, Button, Card, Input, LoadingState, Text } from '@/components/ui';
import { ListRow, Screen, ScreenScroll, SectionHeader } from '@/components/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import type { ProfileDetailsDraft } from '@/features/admin/hooks/use-admin-profile';
import { useAdminProfile } from '@/features/admin/hooks/use-admin-profile';
import { initials } from '@/features/admin/utils';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/navigation/routes';
import { normalizeRole, ROLE_LABEL } from '@/types/models';

type DetailsFormProps = {
  initialName: string;
  initialPhone: string;
  saving: boolean;
  error: string | null;
  saved: boolean;
  onSave: (draft: ProfileDetailsDraft) => void;
};

/**
 * Keyed by the profile's current values, so saving the form remounts it with
 * the fresh profile instead of syncing via an effect.
 */
function PersonalDetailsForm({
  initialName,
  initialPhone,
  saving,
  error,
  saved,
  onSave,
}: DetailsFormProps) {
  const [fullName, setFullName] = useState(initialName);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);

  return (
    <Card className="gap-4">
      <View className="gap-1">
        <Text variant="title" weight="bold">
          Personal details
        </Text>
        <Text variant="body-sm" tone="secondary">
          Visible to the team on orders and delivery hand-offs.
        </Text>
      </View>

      <Input
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Full name"
        maxLength={100}
      />
      <Input
        label="Phone number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="+49 …"
        keyboardType="phone-pad"
        maxLength={30}
      />

      {error ? (
        <Text variant="body-sm" tone="error">
          {error}
        </Text>
      ) : saved ? (
        <Text variant="body-sm" tone="success">
          Personal details saved.
        </Text>
      ) : null}

      <Button
        variant="primary"
        loading={saving}
        disabled={!fullName.trim()}
        onPress={() => onSave({ full_name: fullName, phone_number: phoneNumber })}
      >
        Save details
      </Button>
    </Card>
  );
}

export function AdminProfileScreen() {
  const { tokens } = useTheme();
  const {
    profile,
    email,
    savingDetails,
    savingPassword,
    detailsError,
    passwordError,
    detailsSaved,
    passwordSaved,
    updateDetails,
    updatePassword,
    signOut,
  } = useAdminProfile();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<string | null>(null);

  const handleUpdatePassword = () => {
    if (!password || !confirmPassword) {
      setPasswordValidation('Enter and confirm the new password.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordValidation('The passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setPasswordValidation('Use at least 6 characters.');
      return;
    }

    setPasswordValidation(null);
    void updatePassword(password).then((saved) => {
      if (saved) {
        setPassword('');
        setConfirmPassword('');
      }
    });
  };

  const handleSignOut = () => {
    void signOut().then(() => {
      router.replace(ROUTES.menu);
    });
  };

  if (!profile) {
    return (
      <Screen>
        <LoadingState label="Loading your profile…" className="flex-1" />
      </Screen>
    );
  }

  const roleLabel = profile.role ? ROLE_LABEL[normalizeRole(profile.role)] : 'Admin';

  return (
    <Screen>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenScroll>
          <SectionHeader
            eyebrow="Account"
            title="Admin profile"
            description="Personal details, security and appearance."
          />

          <Card className="items-center gap-3">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-accent-soft">
              <Text variant="headline" weight="extrabold" tone="primary">
                {initials(profile?.full_name ?? 'Berlin Food')}
              </Text>
            </View>
            <View className="items-center gap-1">
              <Text variant="title" weight="bold">
                {profile?.full_name?.trim() || 'Berlin Food admin'}
              </Text>
              <Text variant="body-sm" tone="secondary">
                {email ?? 'No email on file'}
              </Text>
            </View>
            <Badge tone="primary">{roleLabel}</Badge>
          </Card>

          <PersonalDetailsForm
            key={`${profile?.full_name ?? ''}|${profile?.phone_number ?? ''}`}
            initialName={profile?.full_name ?? ''}
            initialPhone={profile?.phone_number ?? ''}
            saving={savingDetails}
            error={detailsError}
            saved={detailsSaved}
            onSave={(draft) => void updateDetails(draft)}
          />

          <Card className="gap-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="lock-closed-outline" size={18} color={tokens.primary} />
              <View className="flex-1 gap-0.5">
                <Text variant="title" weight="bold">
                  Security
                </Text>
                <Text variant="body-sm" tone="secondary">
                  Change the password for this admin account.
                </Text>
              </View>
            </View>

            <Input
              label="New password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat the new password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            {passwordValidation || passwordError ? (
              <Text variant="body-sm" tone="error">
                {passwordValidation ?? passwordError}
              </Text>
            ) : passwordSaved ? (
              <Text variant="body-sm" tone="success">
                Password updated.
              </Text>
            ) : null}

            <Button variant="tonal" loading={savingPassword} onPress={handleUpdatePassword}>
              Update password
            </Button>
          </Card>

          <Card className="gap-4">
            <View className="gap-1">
              <Text variant="title" weight="bold">
                Appearance
              </Text>
              <Text variant="body-sm" tone="secondary">
                Follow the system theme or pick a warm light or espresso dark palette.
              </Text>
            </View>
            <ThemeToggle />
          </Card>

          <ListRow
            title="Sign out"
            subtitle="End this session on the device."
            destructive
            leading={
              <View className="h-10 w-10 items-center justify-center rounded-full bg-error-container">
                <Ionicons name="log-out-outline" size={18} color={tokens.error} />
              </View>
            }
            onPress={handleSignOut}
          />
        </ScreenScroll>
      </KeyboardAvoidingView>
    </Screen>
  );
}

export default AdminProfileScreen;
