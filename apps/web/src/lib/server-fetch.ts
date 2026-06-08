/**
 * Utility for making server-side API requests using native fetch.
 * This is meant to be used exclusively inside Next.js Server Components.
 * It automatically handles Next.js caching, revalidation, and standard headers.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface FetchOptions extends RequestInit {
  // Add any custom options here if needed in the future
}

export async function serverFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Default headers for server requests
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // To forward cookies from the user session in the future, we would import cookies from 'next/headers'
  // const cookieStore = cookies();
  // const token = cookieStore.get('accessToken')?.value; // assuming HTTP-only cookies handle it automatically via SSR pass-through?
  // Note: if auth is required, we need to carefully forward cookies to the Nest backend.

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ServerFetch] Error ${response.status} on ${url}:`, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // Attempt to parse JSON
    const text = await response.text();
    if (!text) {
      return {} as T;
    }
    return JSON.parse(text) as T;
  } catch (error) {
    console.error(`[ServerFetch] Failed to fetch ${url}:`, error);
    throw error;
  }
}
