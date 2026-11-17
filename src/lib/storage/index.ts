import { asyncStorageDriver } from './asyncStorageDriver';
import type { StorageDriver } from './types';

export type { StorageDriver, SyncMeta } from './types';

const NAMESPACE = 'chair';

let driver: StorageDriver = asyncStorageDriver;

/** Swap the backing driver (e.g. for a synced/cloud driver or tests). */
export function setStorageDriver(next: StorageDriver) {
  driver = next;
}

const k = (key: string) => `${NAMESPACE}:${key}`;

export const storage = {
  async read<T>(key: string, fallback: T): Promise<T> {
    try {
      const raw = await driver.getItem(k(key));
      return raw == null ? fallback : (JSON.parse(raw) as T);
    } catch (e) {
      console.warn(`[storage] failed to read ${key}`, e);
      return fallback;
    }
  },
  async write<T>(key: string, value: T): Promise<void> {
    try {
      await driver.setItem(k(key), JSON.stringify(value));
    } catch (e) {
      console.warn(`[storage] failed to write ${key}`, e);
    }
  },
  async remove(key: string): Promise<void> {
    await driver.removeItem(k(key));
  },
};
