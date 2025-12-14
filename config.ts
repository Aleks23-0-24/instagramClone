import Constants from 'expo-constants';

// Determine API host so physical devices scanning the Expo QR can reach the backend.
// Prefer explicit env var if provided, otherwise derive LAN IP from Expo debuggerHost.
const fallback = 'http://192.168.1.92:3000/api';
let apiUrl = fallback;

try {
  const manifest: any = Constants.manifest || {};
  const manifest2: any = (Constants as any).manifest2 || {};
  const debuggerHost = manifest.debuggerHost || manifest2.debuggerHost || '';
  const hostIp = debuggerHost ? debuggerHost.split(':')[0] : '';
  if (process.env.API_URL) apiUrl = process.env.API_URL;
  else if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') apiUrl = `http://${hostIp}:3000/api`;
  else if (manifest2 && manifest2.debuggerHost) {
    const ip = manifest2.debuggerHost.split(':')[0];
    apiUrl = `http://${ip}:3000/api`;
  } else if (debuggerHost && debuggerHost.includes('localhost')) {
    // As a last-resort fallback, replace localhost with machine LAN IP discovered by Metro when possible.
    const possibleIp = process.env.EXPO_LOCAL_IP || manifest.experienceUrl?.split('//')?.[1]?.split(':')?.[0];
    if (possibleIp) apiUrl = `http://${possibleIp}:3000/api`;
    else apiUrl = fallback;
  } else apiUrl = fallback;
} catch (e) {
  apiUrl = fallback;
}


export const API_URL = apiUrl;
console.log('Resolved API_URL:', API_URL);
export default API_URL;
