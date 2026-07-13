import { Platform } from "react-native";

export const TAB_BAR_BASE_HEIGHT = 66;
export const TOP_SAFE_MIN = Platform.OS === "android" ? 28 : 12;
export const TAB_BAR_MIN_BOTTOM = Platform.OS === "android" ? 30 : 18;

export function getTabBarHeight(bottomInset = 0) {
  return TAB_BAR_BASE_HEIGHT + Math.max(bottomInset, TAB_BAR_MIN_BOTTOM);
}

export function getScreenBottomPadding(bottomInset = 0, extra = 24) {
  return getTabBarHeight(bottomInset) + extra;
}

export function getBottomSafePadding(bottomInset = 0, extra = 12) {
  return Math.max(bottomInset, TAB_BAR_MIN_BOTTOM) + extra;
}

export function getScreenTopPadding(topInset = 0, extra = 0) {
  return Math.max(topInset, TOP_SAFE_MIN) + extra;
}
