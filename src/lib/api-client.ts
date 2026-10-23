// Centralized API Client & Error Handling
import { ApiResponse } from '@/types';
import { logger } from './logger';

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(message: string, code: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          url.searchParams.append(key, String(val));
        }
      });
    }
    return url.toString();
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...rest } = options;
    const url = this.buildUrl(path, params);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...headers,
        },
        ...rest,
      });

      const json: ApiResponse<T> = await response.json().catch(() => ({
        success: false,
        error: { code: 'INVALID_JSON', message: 'Failed to parse JSON response' },
      }));

      if (!response.ok || !json.success) {
        const errorInfo = json.error || {
          code: `HTTP_${response.status}`,
          message: response.statusText || 'Request failed',
        };
        logger.warn(`API Error on ${url}`, { status: response.status, ...errorInfo });
        throw new ApiError(errorInfo.message, errorInfo.code, response.status, errorInfo.details);
      }

      return json.data as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.error(`Network or runtime failure fetching ${url}`, err);
      throw new ApiError('Network connection failure. Please check your connectivity.', 'NETWORK_ERROR', 0);
    }
  }

  get<T>(path: string, params?: Record<string, string | number | boolean>, headers?: HeadersInit) {
    return this.request<T>(path, { method: 'GET', params, headers });
  }

  post<T>(path: string, body?: unknown, headers?: HeadersInit) {
    return this.request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, headers });
  }

  put<T>(path: string, body?: unknown, headers?: HeadersInit) {
    return this.request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined, headers });
  }

  delete<T>(path: string, body?: unknown, headers?: HeadersInit) {
    return this.request<T>(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined, headers });
  }
}

export const api = new ApiClient();
