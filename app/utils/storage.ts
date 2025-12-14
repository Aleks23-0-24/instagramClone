import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// A cross-platform storage utility

export async function saveItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('localStorage is unavailable', e);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('localStorage is unavailable', e);
      return null;
    }
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

export async function deleteItem(key: string) {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('localStorage is unavailable', e);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

// default export to satisfy expo-router route checks
const defaultExport = { saveItem, getItem, deleteItem };
export default defaultExport;