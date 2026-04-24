/**
 * base44Client.js  ← compatibility shim
 *
 * All code that previously imported `base44` from this file
 * continues to work without any import changes. The underlying
 * implementation now uses localStorage via localClient.js
 * instead of the @base44/sdk cloud service.
 *
 * When you are ready to plug in a real backend (Firebase, Supabase,
 * a custom REST API, etc.) replace the localClient import below
 * and re-map the same interface.
 */
export { supabaseWrapper as base44 } from './supabaseWrapper';