import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { connectDB } from './config/database';
import { initCronJobs } from './utils/cron-scheduler';
import { seedData } from './config/seed-data';

// Ortam değişkenlerini yükle
dotenv.config();

// Veritabanı bağlantısını başlat
connectDB().then(() => {
  // Başlangıç verilerini kontrol et
  seedData();
});

// CRON job'ları başlat
initCronJobs();

const app = express();
const PORT = process.env.PORT || 8000;

// ALLOWED_ORIGINS değerini al veya varsayılan olarak frontend URL'i kullan
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [process.env.FRONTEND_URL || 'https://x-ein.com'];

console.log('CORS için izin verilen origins:', allowedOrigins);

// CORS ayarları
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Tüm istekleri logla
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Authorization header'ı maskele (güvenlik amaçlı)
  const headers = { ...req.headers };
  if (headers.authorization) {
    headers.authorization = headers.authorization.substring(0, 15) + '...';
  }
  
  console.log('Headers:', headers);
  
  if (req.body && Object.keys(req.body).length) {
    // Hassas bilgileri maskele
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = '********';
    console.log('Body:', JSON.stringify(safeBody));
  }
  
  next();
});

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT Secret kontrolü
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret === 'gizli-anahtar') {
  console.warn('UYARI: JWT_SECRET değeri varsayılan değeri kullanıyor veya tanımlanmamış. Güvenlik riski!');
}

// Routes
app.use('/api', apiRoutes);

// Ana route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API çalışıyor' });
});

// Hata yakalama
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Bir şeyler yanlış gitti!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
  console.log(`Ortam: ${process.env.NODE_ENV}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});

export default app; 