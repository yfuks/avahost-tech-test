import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';

const GUEST_DEVICE_ID_KEY = 'ava_guest_device_id';

/**
 * Returns a stable ID for this guest/device so conversations are scoped per device.
 *
 * Persistence across app uninstall:
 * - Android: ANDROID_ID (Settings.Secure.ANDROID_ID) is unique per (device, user, app
 *   signing key). It persists across uninstall/reinstall when the same signed app is
 *   reinstalled. It only changes on factory reset or if the app signing key changes.
 * - iOS: Apple does not expose any identifier that survives app uninstall. We use
 *   identifierForVendor (IDFV), which persists until the user uninstalls all apps
 *   from the same vendor; after that it is reset. There is no API for MAC or hardware
 *   ID on iOS.
 *
 * MAC address: Not used. On Android 6+ the system returns a constant (02:00:00:00:00:00)
 * for privacy; on iOS the MAC is never exposed to apps.
 */
export async function getGuestDeviceId(): Promise<string> {
  if (Platform.OS === 'android') {
    try {
      const id = Application.getAndroidId();
      if (id && id !== 'unknown') return id;
    } catch {
      // fall through to stored UUID
    }
  }
  if (Platform.OS === 'ios') {
    try {
      const id = await Application.getIosIdForVendorAsync();
      if (id) return id;
    } catch {
      // fall through to stored UUID
    }
  }
  try {
    const stored = await SecureStore.getItemAsync(GUEST_DEVICE_ID_KEY);
    if (stored) return stored;
  } catch {
    // SecureStore not available (e.g. web in some configs)
  }
  const generated = generateUuid();
  try {
    await SecureStore.setItemAsync(GUEST_DEVICE_ID_KEY, generated);
  } catch {
    // ignore
  }
  return generated;
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
