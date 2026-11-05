import type { IoniconsName } from '@/navigation/routes';
import { VEHICLE_LABEL, type VehicleType } from '@/types/models';

export type VehicleOption = {
  value: VehicleType;
  label: string;
  icon: IoniconsName;
};

/**
 * The four vehicle choices offered by the web courier profile. `motorcycle`
 * stays a valid stored value but is not selectable here, matching the web.
 */
export const VEHICLE_OPTIONS: VehicleOption[] = [
  { value: 'bicycle', label: VEHICLE_LABEL.bicycle, icon: 'bicycle-outline' },
  { value: 'scooter', label: VEHICLE_LABEL.scooter, icon: 'flash-outline' },
  { value: 'car', label: VEHICLE_LABEL.car, icon: 'car-outline' },
  { value: 'van', label: VEHICLE_LABEL.van, icon: 'bus-outline' },
];
