import axios from 'axios';

// Checking for API_URL in a more secure way
let API_URL = process.env.NEXT_PUBLIC_API_URL;

// If environment variable is not defined, use default value
if (!API_URL) {
  API_URL = 'http://localhost:8000/api';
  console.warn('NEXT_PUBLIC_API_URL is not defined, using default value:', API_URL);
} else {
  // Remove trailing slash if present and add /api
  API_URL = `${API_URL.replace(/\/$/, '')}/api`;
}

console.log('API URL:', API_URL); // API URL'sini loglama

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // No need to send cookies since JWT token is used
});

// Global değişken - token yenileme işleminin devam edip etmediğini takip eder
let isRefreshing = false;
// Bekleyen istekleri saklar
let failedQueue = [];
// Logout fonksiyonu sadece bir kez çalışmasını garanti etmek için
let isLoggingOut = false;

// Kullanıcı çıkışı için güvenli fonksiyon
const safeLogout = () => {
  if (isLoggingOut) return;
  
  isLoggingOut = true;
  console.warn("Token hatası, kullanıcı çıkış yapılıyor...");
  
  // 1 saniyelik gecikme ile işlem yap (kullanıcıya bilgi vermek için veya isteklerin tamamlanmasını beklemek için)
  setTimeout(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login?error=session_expired';
    }
    isLoggingOut = false;
  }, 1000);
};

// Request interceptor - adds token
api.interceptors.request.use(
  (config) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Show only 10 characters for security
        const maskedToken = token.length > 10 ? 
          `${token.substring(0, 5)}...${token.substring(token.length - 5)}` : token;
        console.log(`API request: ${config.method?.toUpperCase()} ${config.url} with token: ${maskedToken}`);
      } else {
        console.warn(`API request: ${config.method?.toUpperCase()} ${config.url} (no token!)`);
      }
    } catch (error) {
      console.error("Request interceptor error:", error);
    }
    return config;
  },
  (error) => {
    console.error("Request could not be sent:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - catches token errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error(`API response error: ${error.config?.url} - ${error.response.status} ${error.response.statusText}`);
      console.error('Error details:', error.response.data);
    } else if (error.request) {
      console.error('No API response received:', error.request);
    } else {
      console.error('API request error:', error.message);
    }
    
    const originalRequest = error.config;
    
    // 401 hatası durumunda token yönetimi
    if (error.response?.status === 401) {
      // Backend'den gelen detaylı hata bilgisini kontrol et
      const errorData = error.response.data || {};
      
      // Backend'den logout direktifi geldiyse
      if (errorData.logout === true) {
        console.warn(`401 hatası - ${errorData.error || 'auth/unknown'}: ${errorData.message}`);
        safeLogout();
        return Promise.reject(error);
      }
      
      // İlk 401 hatası üzerinden hemen çıkış yapmak yerine, tekrar dene
      if (!originalRequest._retry && !isRefreshing) {
        originalRequest._retry = true;
        isRefreshing = true;
        
        // Token var ama 401 hatası alıyoruz - bir kereliğine yeniden deneme yapalım
        console.log("401 hatası alındı. İstek yeniden deneniyor...");
        
        // İstek yeniden deneme yapmadan önce 500ms bekle
        await new Promise(resolve => setTimeout(resolve, 500));
        
        isRefreshing = false;
        return axios(originalRequest);
      }
      
      // Yeniden denemeye rağmen 401 hatası alındı, kullanıcıyı çıkış yap
      if (originalRequest._retry) {
        console.warn("Yeniden denemeye rağmen 401 hatası devam ediyor.");
        safeLogout();
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 