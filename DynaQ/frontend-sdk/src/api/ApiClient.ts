export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
}

export interface ApiClient {
  get: <T>(endpoint: string) => Promise<ApiResponse<T>>;
  post: <T>(endpoint: string, data?: any) => Promise<ApiResponse<T>>;
}

// Default configuration
const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: 'http://localhost:5008',
  timeout: 10000,
};

// Internal function to make HTTP requests
async function makeRequest<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${baseUrl}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

// Factory function to create an API client
export function createApiClient(config: Partial<ApiClientConfig> = {}): ApiClient {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return {
    get: <T>(endpoint: string): Promise<ApiResponse<T>> => {
      return makeRequest<T>(finalConfig.baseUrl, endpoint, { method: 'GET' });
    },
    
    post: <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
      return makeRequest<T>(finalConfig.baseUrl, endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    },
  };
}

// Convenience function to create a client with default config
export function createDefaultApiClient(): ApiClient {
  return createApiClient();
} 