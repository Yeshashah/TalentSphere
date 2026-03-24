import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const isIframe =
  window.self !== window.top;

/* =====================================================
   TTL CACHE UTILITIES
   ===================================================== */

/**
 * TTL configuration (milliseconds)
 */
export const TTL = {
  CANDIDATES: 5 * 60 * 1000, // 5 minutes
  JOBS: 10 * 60 * 1000, // 10 minutes
  TOKEN: 60 * 60 * 1000, // 1 hour
  PROFILE: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Store value with TTL
 */
export const setWithTTL = (
  key,
  value,
  ttl
) => {
  try {
    const payload = {
      value,
      timestamp: Date.now(),
      ttl
    };

    localStorage.setItem(
      key,
      JSON.stringify(payload)
    );
  } catch (error) {
    console.error(
      "setWithTTL error:",
      error
    );
  }
};

/**
 * Read value with TTL validation
 */
export const getWithTTL = (key) => {
  try {
    const itemStr =
      localStorage.getItem(key);

    if (!itemStr) return null;

    const item =
      JSON.parse(itemStr);

    const now = Date.now();

    const isExpired =
      now - item.timestamp >
      item.ttl;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (error) {
    localStorage.removeItem(key);
    return null;
  }
};

/**
 * Manually clear cache
 */
export const clearCache = (key) => {
  localStorage.removeItem(key);
};