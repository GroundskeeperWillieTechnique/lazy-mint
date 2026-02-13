const isProd = import.meta.env.PROD;

export const API_BASE = isProd ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:4001');
export const ASSET_BASE = isProd ? '' : (import.meta.env.VITE_ASSET_URL || '');

export default { API_BASE, ASSET_BASE };
