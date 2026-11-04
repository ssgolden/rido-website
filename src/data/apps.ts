/**
 * The Rido rider app in the stores. One source of truth for every badge,
 * the /app smart link, JSON-LD, the Smart App Banner and the manifest.
 */
export const APP_STORE_ID = "6800788222";
export const PLAY_PACKAGE = "ride.rido.app";

export const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`;
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}`;

export type Store = "ios" | "android";

export const storeUrl: Record<Store, string> = {
  ios: APP_STORE_URL,
  android: PLAY_STORE_URL,
};

/** Store names as each listing shows them (used in JSON-LD). */
export const storeListingName: Record<Store, string> = {
  ios: "RIDO shared mobility service",
  android: "Rido",
};
