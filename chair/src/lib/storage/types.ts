/**
 * Storage layer contracts.
 *
 * The app only ever talks to a `StorageDriver`. Today that is AsyncStorage on
 * the device; later a `SyncedDriver` can wrap it (local-first + remote push)
 * without any screen or store code changing.
 */
export interface StorageDriver {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** Every persisted record carries these so it can be merged/synced later. */
export interface SyncMeta {
  id: string;
  createdAt: number;
  updatedAt: number;
  /** Soft-delete marker so deletions can propagate to a server later. */
  deletedAt?: number | null;
}
