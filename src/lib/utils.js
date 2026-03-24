import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const isIframe = window.self !== window.top;

export const TTL = {
  CANDIDATES: 5 * 60 * 1000,
  JOBS: 10 * 60 * 1000,
  TOKEN: 60 * 60 * 1000,
  PROFILE: 24 * 60 * 60 * 1000
};

export const setWithTTL = (key, value, ttl) => {
  try {
    const payload = { value, timestamp: Date.now(), ttl };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (error) {
    console.error("setWithTTL error:", error);
  }
};

export const getWithTTL = (key) => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    const item = JSON.parse(itemStr);
    if (Date.now() - item.timestamp > item.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    localStorage.removeItem(key);
    return null;
  }
};

export const clearCache = (key) => {
  localStorage.removeItem(key);
};