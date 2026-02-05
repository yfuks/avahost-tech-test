/**
 * API base URL from Expo env. No trailing slash.
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4001';

export function getApiUrl(): string {
  return API_URL;
}
