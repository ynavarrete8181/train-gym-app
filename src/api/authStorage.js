import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../utils/storageKeys";

export const saveSession = async ({ token, user }) => {
  await AsyncStorage.setItem(STORAGE_KEYS.accessToken, token);
  await AsyncStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(user));
};

export const clearSession = async () => {
  await AsyncStorage.multiRemove([STORAGE_KEYS.accessToken, STORAGE_KEYS.authUser]);
};

export const getStoredSession = async () => {
  const [token, userRaw] = await AsyncStorage.multiGet([
    STORAGE_KEYS.accessToken,
    STORAGE_KEYS.authUser,
  ]);

  const accessToken = token?.[1] || null;
  const user = userRaw?.[1] ? JSON.parse(userRaw[1]) : null;

  return { accessToken, user };
};
