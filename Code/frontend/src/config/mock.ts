/**
 * Mock mode serves admin data from localStorage instead of the backend API.
 * ON by default while the backend is unavailable; set NEXT_PUBLIC_USE_MOCK=false in .env.local to use the real API.
 */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
