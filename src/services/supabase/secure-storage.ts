import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const CHUNK_SIZE = 1800;
const CHUNK_COUNT_SUFFIX = '__chunk_count';

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

function normalizeKey(key: string) {
  return key.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function chunkKey(key: string, index: number) {
  return `${key}__chunk_${index}`;
}

async function removeChunks(key: string) {
  const countValue = await SecureStore.getItemAsync(
    `${key}${CHUNK_COUNT_SUFFIX}`,
    secureStoreOptions
  );

  if (!countValue) {
    return;
  }

  const count = Number.parseInt(countValue, 10);

  if (Number.isFinite(count) && count > 0) {
    await Promise.all(
      Array.from({ length: count }, (_, index) =>
        SecureStore.deleteItemAsync(chunkKey(key, index), secureStoreOptions)
      )
    );
  }

  await SecureStore.deleteItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`, secureStoreOptions);
}

export const secureStorage = {
  async getItem(rawKey: string): Promise<string | null> {
    const key = normalizeKey(rawKey);
    const countValue = await SecureStore.getItemAsync(
      `${key}${CHUNK_COUNT_SUFFIX}`,
      secureStoreOptions
    );

    if (!countValue) {
      return SecureStore.getItemAsync(key, secureStoreOptions);
    }

    const count = Number.parseInt(countValue, 10);

    if (!Number.isFinite(count) || count <= 0) {
      return null;
    }

    const chunks = await Promise.all(
      Array.from({ length: count }, (_, index) =>
        SecureStore.getItemAsync(chunkKey(key, index), secureStoreOptions)
      )
    );

    if (chunks.some((chunk) => chunk === null)) {
      return null;
    }

    return chunks.join('');
  },

  async setItem(rawKey: string, value: string): Promise<void> {
    const key = normalizeKey(rawKey);

    await SecureStore.deleteItemAsync(key, secureStoreOptions);
    await removeChunks(key);

    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value, secureStoreOptions);
      return;
    }

    const chunks = Array.from({ length: Math.ceil(value.length / CHUNK_SIZE) }, (_, index) =>
      value.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE)
    );

    await Promise.all(
      chunks.map((chunk, index) =>
        SecureStore.setItemAsync(chunkKey(key, index), chunk, secureStoreOptions)
      )
    );

    await SecureStore.setItemAsync(
      `${key}${CHUNK_COUNT_SUFFIX}`,
      String(chunks.length),
      secureStoreOptions
    );
  },

  async removeItem(rawKey: string): Promise<void> {
    const key = normalizeKey(rawKey);

    await SecureStore.deleteItemAsync(key, secureStoreOptions);
    await removeChunks(key);
  },
};

const webStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(key);
  },
};

export const authStorage = Platform.OS === 'web' ? webStorage : secureStorage;
