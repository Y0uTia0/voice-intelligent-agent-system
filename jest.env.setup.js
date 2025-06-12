// 在全局对象上模拟import.meta
globalThis.import_meta = {
  env: {
    DEV: process.env.NODE_ENV === 'development',
    PROD: process.env.NODE_ENV === 'production',
    TEST: process.env.NODE_ENV === 'test',
    VITE_API_URL: 'http://localhost:5000/api',
    VITE_AUTH_DOMAIN: 'auth.example.com',
    VITE_AUTH_CLIENT_ID: 'client-id',
    VITE_AUTH_AUDIENCE: 'api-audience'
  }
}; 