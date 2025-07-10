// API Configuration for separate frontend
export const API_CONFIG = {
  // Default to localhost for development
  BASE_URL: process.env.VITE_API_URL || 'http://localhost:5000',
  
  // Helper to get full API URL
  getApiUrl: (path: string) => {
    const baseUrl = process.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${path}`;
  }
};

export const isDevelopment = process.env.NODE_ENV === 'development' || import.meta.env.DEV;
export const isProduction = process.env.NODE_ENV === 'production' || import.meta.env.PROD;