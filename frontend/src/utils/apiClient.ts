import { AuthContextType } from '../contexts/AuthContext';

// Global flag to prevent multiple redirects
let isRedirecting = false;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface ApiClientConfig {
  baseURL: string;
  getToken: () => string | null;
  onTokenExpired: () => void;
  onUnauthorized: () => void;
}

export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  private async handleResponse(response: Response): Promise<ApiResponse> {
    // Check for authentication errors
    if (response.status === 401 || response.status === 403) {
      if (!isRedirecting) {
        isRedirecting = true;
        this.config.onTokenExpired();
        
        // Reset flag after a short delay to allow for proper state cleanup
        setTimeout(() => {
          isRedirecting = false;
        }, 1000);
      }
      
      return {
        success: false,
        error: 'Your session has expired. Please log in again.',
        status: response.status
      };
    }

    try {
      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data,
          status: response.status
        };
      } else {
        return {
          success: false,
          error: data.message || data.error || 'Request failed',
          status: response.status
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse response',
        status: response.status
      };
    }
  }

  private getHeaders(contentType: string = 'application/json'): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    const token = this.config.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return this.handleResponse(response);
    } catch (error: any) {
      console.error('API GET error:', error);
      
      // Check if it's a network error that might indicate token issues
      if (error.name === 'TypeError' || error.message?.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Network connection failed. Please check your connection and try again.'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse(response);
    } catch (error: any) {
      console.error('API POST error:', error);
      
      if (error.name === 'TypeError' || error.message?.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Network connection failed. Please check your connection and try again.'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse(response);
    } catch (error: any) {
      console.error('API PUT error:', error);
      
      if (error.name === 'TypeError' || error.message?.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Network connection failed. Please check your connection and try again.'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return this.handleResponse(response);
    } catch (error: any) {
      console.error('API DELETE error:', error);
      
      if (error.name === 'TypeError' || error.message?.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Network connection failed. Please check your connection and try again.'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  async postFormData<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(''), // Don't set content-type for FormData
        body: formData,
      });

      return this.handleResponse(response);
    } catch (error: any) {
      console.error('API POST FormData error:', error);
      
      if (error.name === 'TypeError' || error.message?.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Network connection failed. Please check your connection and try again.'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }
}

// Factory function to create API client with auth context
export function createApiClient(authContext: AuthContextType): ApiClient {
  return new ApiClient({
    baseURL: 'http://50.6.225.185:8000',
    getToken: () => authContext.state.token,
    onTokenExpired: () => {
      console.log('Token expired, logging out...');
      authContext.logoutDueToExpiration();
    },
    onUnauthorized: () => {
      console.log('Unauthorized access, logging out...');
      authContext.logoutDueToExpiration();
    }
  });
}

// Hook to use API client within components
export function useApiClient() {
  // This would need to be implemented in a context or hook
  // For now, we'll export it as a utility function
  return { createApiClient };
}
