import { createClient } from '@insforge/sdk';

const baseUrl = (import.meta.env?.VITE_INSFORGE_URL as string) || (process.env.VITE_INSFORGE_URL as string);
const anonKey = (import.meta.env?.VITE_INSFORGE_ANON_KEY as string) || (process.env.VITE_INSFORGE_ANON_KEY as string);

if (!baseUrl || !anonKey) {
  console.warn('[INSFORGE] Credentials missing. Requests will likely fail.');
} else {
  console.log('[INSFORGE] Initialized with:', baseUrl);
}

export const insforge = createClient({
  baseUrl: baseUrl || '',
  anonKey: anonKey || '',
});
