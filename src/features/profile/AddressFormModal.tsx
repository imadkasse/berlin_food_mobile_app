import * as Location from 'expo-location';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button, Input, Modal, Text } from '@/components/ui';
import { getErrorMessage } from '@/features/menu/utils';
import { createAddressId, type SavedAddress } from '@/features/profile/addresses';

export type AddressFormModalProps = {
  visible: boolean;
  /** `null` when adding a new address. */
  initial: SavedAddress | null;
  onClose: () => void;
  onSubmit: (address: SavedAddress) => Promise<boolean>;
  isSaving: boolean;
  error: string | null;
};

function parseCoordinate(value: string): number {
  const parsed = Number(value.trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

/** Add/edit form for one delivery address, with device-location assistance. */
export function AddressFormModal({
  visible,
  initial,
  onClose,
  onSubmit,
  isSaving,
  error,
}: AddressFormModalProps) {
  // The screen mounts this form per add/edit session (keyed by address id), so
  // the draft is initialised from props without a prop-syncing effect.
  const [label, setLabel] = useState(initial?.label ?? '');
  const [formatted, setFormatted] = useState(initial?.formatted ?? '');
  const [lat, setLat] = useState(initial ? String(initial.lat) : '');
  const [lng, setLng] = useState(initial ? String(initial.lng) : '');
  const [formError, setFormError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission was denied. You can enter the coordinates manually.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setLat(latitude.toFixed(6));
      setLng(longitude.toFixed(6));

      // Reverse geocoding is best-effort: coordinates alone are still valid.
      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (place) {
          const streetLine = [place.streetNumber, place.street].filter(Boolean).join(' ');
          const composed =
            place.formattedAddress ??
            [streetLine, place.postalCode, place.city].filter(Boolean).join(', ');

          if (composed) setFormatted(composed);
          if (!label.trim() && place.city) setLabel(place.city);
        }
      } catch {
        // Ignore geocoding failures — the user can type the address.
      }
    } catch (locationFailure) {
      setLocationError(
        getErrorMessage(locationFailure, 'We could not read your current location.')
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleSave = async () => {
    const trimmedLabel = label.trim();
    const latitude = parseCoordinate(lat);
    const longitude = parseCoordinate(lng);

    if (!trimmedLabel) {
      setFormError('Give this address a label, such as Home or Office.');
      return;
    }

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      setFormError('Enter a valid latitude between -90 and 90.');
      return;
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setFormError('Enter a valid longitude between -180 and 180.');
      return;
    }

    setFormError(null);

    const address: SavedAddress = {
      id: initial?.id ?? createAddressId(),
      label: trimmedLabel,
      lat: latitude,
      lng: longitude,
    };

    const trimmedFormatted = formatted.trim();
    if (trimmedFormatted) address.formatted = trimmedFormatted;

    const saved = await onSubmit(address);
    if (saved) onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={isSaving ? () => {} : onClose}
      title={initial ? 'Edit address' : 'Add address'}
    >
      <ScrollView
        style={{ maxHeight: 430 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-4"
      >
        <Input
          label="Label"
          placeholder="Home, Office…"
          value={label}
          onChangeText={setLabel}
          autoCapitalize="words"
        />

        <Input
          label="Street address"
          placeholder="Torstraße 124, 10119 Berlin"
          value={formatted}
          onChangeText={setFormatted}
          autoCapitalize="words"
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Latitude"
              placeholder="52.5209"
              value={lat}
              onChangeText={setLat}
              keyboardType="decimal-pad"
            />
          </View>
          <View className="flex-1">
            <Input
              label="Longitude"
              placeholder="13.4094"
              value={lng}
              onChangeText={setLng}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Button
          variant="tonal"
          block
          loading={isLocating}
          onPress={() => void handleUseCurrentLocation()}
        >
          Use my current location
        </Button>

        {locationError ? (
          <Text variant="body-sm" tone="error">
            {locationError}
          </Text>
        ) : null}

        {(formError ?? error) ? (
          <Text variant="body-sm" tone="error">
            {formError ?? error}
          </Text>
        ) : null}
      </ScrollView>

      <View className="flex-row gap-3 pt-1">
        <Button variant="ghost" className="flex-1" disabled={isSaving} onPress={onClose}>
          Cancel
        </Button>
        <Button className="flex-1" loading={isSaving} onPress={() => void handleSave()}>
          Save address
        </Button>
      </View>
    </Modal>
  );
}
