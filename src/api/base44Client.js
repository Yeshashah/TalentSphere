import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, functionsVersion, appBaseUrl } = appParams;

// Re-read token fresh from URL params or localStorage each time the module loads
// so that after a login redirect (with ?access_token=...) we pick it up correctly.
const getFreshToken = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('access_token');
  if (urlToken) return urlToken;
  try {
    const stored = localStorage.getItem('base44_access_token');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.value) return parsed.value;
    }
  } catch (_) { /* ignore */ }
  return appParams.token;
};

export const base44 = createClient({
  appId,
  token: getFreshToken(),
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});