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

// CORS ayarları
app.use(cors({
  origin: ['https://x-ein.com', 'https://www.x-ein.com', 'https://api.x-ein.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Tüm istekleri logla
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length) {
    console.log('Body:', JSON.stringify(req.body));
  }
  next();
});

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
});

export default app; 