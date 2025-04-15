#!/bin/bash

echo "🚀 X-Ein VPS Kurulumu Başlıyor..."

# Sistem güncelleme
echo "📦 Sistem güncelleniyor..."
apt update && apt upgrade -y

# Gerekli paketleri yükleme
echo "📦 Gerekli paketler yükleniyor..."
apt install -y nginx certbot python3-certbot-nginx mongodb nodejs npm

# Node.js'i güncelleme (v18 LTS)
echo "📦 Node.js güncelleniyor..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# PM2 kurulumu
echo "📦 PM2 yükleniyor..."
npm install pm2 -g

# Firewall ayarları
echo "🔒 Firewall ayarlanıyor..."
ufw allow 'Nginx Full'
ufw allow ssh
ufw enable

# MongoDB servisini başlatma
echo "📊 MongoDB servisini başlatılıyor..."
systemctl start mongodb
systemctl enable mongodb

# Nginx ayarlarını kopyalama
echo "🔄 Nginx ayarları yapılandırılıyor..."
cp nginx-config/*.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/x-ein.com.conf /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/api.x-ein.com.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# SSL sertifikası oluşturma
echo "🔒 SSL sertifikaları oluşturuluyor..."
certbot --nginx -d x-ein.com -d www.x-ein.com
certbot --nginx -d api.x-ein.com

echo "✅ VPS kurulumu tamamlandı!"
echo "📝 Şimdi projenizi deploy edebilirsiniz: ./deploy.sh" 