// Configuration for the application
// This file provides environment-specific configuration

// API base URL - uses environment variable if available, otherwise defaults to localhost for development
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  'http://localhost:3001';

// Other configuration values can be added here as needed