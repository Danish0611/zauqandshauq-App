export const environment = {
  production: false,
  apiUrl: typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')
    ? 'https://zauqandshauq-backend.onrender.com/api'
    : 'http://localhost:8080/api'
};

