#!/bin/bash

echo "🚀 X-Ein Projesi Deployment Başlıyor..."

# Frontend build
echo "📦 Frontend build ediliyor..."
cd frontend
npm install --production
npm run build
cd ..

# Backend build
echo "📦 Backend build ediliyor..."
cd backend
npm install --production
npm run build
cd ..

# PM2 ile uygulamaları başlatma/yeniden başlatma
echo "🔄 Uygulamalar PM2 ile başlatılıyor..."
pm2 reload ecosystem.config.js --update-env

echo "✅ Deployment tamamlandı!" 