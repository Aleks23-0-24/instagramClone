import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import CONFIG, { API_URL as COMPILED_API_URL } from '@/config';

let API_BASE = COMPILED_API_URL; // includes /api

// Safe wrappers for storage that work on native and web
export async function safeGetItem(key: string): Promise<string | null> {
  try {
    const SS: any = (SecureStore as any).default || SecureStore;
    if (SS && typeof SS.getItemAsync === 'function') {
      const v = await SS.getItemAsync(key);
      return v ?? null;
    }
  } catch (e) {
    // fallthrough to localStorage
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage.getItem(key);
  } catch (e) {}
  return null;
}

export async function safeSetItem(key: string, value: string): Promise<void> {
  try {
    const SS: any = (SecureStore as any).default || SecureStore;
    if (SS && typeof SS.setItemAsync === 'function') {
      await SS.setItemAsync(key, value);
      return;
    }
  } catch (e) {}
  try {
    if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(key, value);
  } catch (e) {}
}

export async function safeDeleteItem(key: string): Promise<void> {
  try {
    const SS: any = (SecureStore as any).default || SecureStore;
    if (SS && typeof SS.deleteItemAsync === 'function') {
      await SS.deleteItemAsync(key);
      return;
    }
  } catch (e) {}
  try {
    if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem(key);
  } catch (e) {}
}

export async function initRuntimeConfig() {
  try {
    const override = await safeGetItem('API_HOST');
    if (override) {
      API_BASE = override.endsWith('/api') ? override : override.replace(/\/$/, '') + '/api';
      console.log('runtimeConfig: using override API_HOST ->', API_BASE);
      return;
    }

    // Try to derive from Expo manifest debuggerHost
    const manifest: any = (Constants as any).manifest || {};
    const manifest2: any = (Constants as any).manifest2 || {};
    const debuggerHost = manifest.debuggerHost || manifest2.debuggerHost || '';
    const hostIp = debuggerHost ? debuggerHost.split(':')[0] : '';

    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      API_BASE = `http://${hostIp}:3000/api`;
      console.log('runtimeConfig: using debuggerHost IP ->', API_BASE);
      return;
    }

    // If compiled config uses localhost, try to replace with experienceUrl host
    if (COMPILED_API_URL.includes('localhost') || COMPILED_API_URL.includes('127.0.0.1')) {
      const expHost = manifest.experienceUrl?.split('//')?.[1]?.split(':')?.[0];
      if (expHost) {
        API_BASE = `http://${expHost}:3000/api`;
        console.log('runtimeConfig: replaced localhost with experienceUrl host ->', API_BASE);
        return;
      }
    }

    API_BASE = COMPILED_API_URL;
    console.log('runtimeConfig: using compiled API ->', API_BASE);
  } catch (e) {
    console.warn('runtimeConfig init failed, using compiled API');
    API_BASE = COMPILED_API_URL;
  }
}

export function getApiUrl(path = '') {
  if (!path) return API_BASE;
  if (!path.startsWith('/')) path = '/' + path;
  return API_BASE.replace(/\/$/, '') + path;
}

export function getApiBase() {
  return API_BASE;
}

// Default export to satisfy expo-router route checks when placed under app/
export default function RuntimeConfigRoute() {
  return null;
}
