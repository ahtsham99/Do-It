import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StorageDriver } from './types';

/** Device-local persistence (localStorage on web, native storage on iOS/Android). */
export const asyncStorageDriver: StorageDriver = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};
