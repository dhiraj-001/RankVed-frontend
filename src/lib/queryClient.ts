import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_CONFIG } from "./config";
import { v4 as uuidv4 } from 'uuid';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = API_CONFIG.getApiUrl(url);

  // Attach x-session-id header for chat API calls
  let headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  if (url.startsWith('/api/chat/')) {
    let sessionId = localStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('chat_session_id', sessionId);
    }
    headers['x-session-id'] = sessionId;
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const fullUrl = API_CONFIG.getApiUrl(queryKey[0] as string);
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});