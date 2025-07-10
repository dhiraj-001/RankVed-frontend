// API Configuration for separate frontend
export const API_CONFIG = {
  // Default to localhost for development
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  // Helper to get full API URL
  getApiUrl: (path: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${path}`;
  }
};

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;