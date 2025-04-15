# X-Ein Projesi Canlı Ortam Kurulumu

Bu belge, X-Ein projesinin bir VPS üzerinde nasıl kurulacağını ve yapılandırılacağını açıklar.

## Gereksinimler

- Ubuntu 20.04 veya daha yeni bir VPS
- x-ein.com domain adı (DNS A kayıtları ayarlanmış olmalı)
- Root erişimi

## Kurulum Adımları

### 1. Projeyi VPS'e Kopyalama

```bash
# Yerel makinenizden
git clone https://github.com/kullanici/x-ein.git
cd x-ein
scp -r ./* root@vps-ip-adresi:/root/x-ein
```

### 2. VPS Kurulumu

```bash
# VPS üzerinde
cd /root/x-ein
chmod +x setup-vps.sh
./setup-vps.sh
```

Bu script şunları yapacaktır:
- Sistem güncellemesi
- Nginx, MongoDB, Node.js kurulumu
- Firewall ayarları
- Nginx konfigürasyonu
- SSL sertifikalarının alınması

### 3. Projeyi Deploy Etme

```bash
chmod +x deploy.sh
./deploy.sh
```

Bu script şunları yapacaktır:
- Frontend ve backend build işlemleri
- PM2 ile uygulamaların başlatılması

### 4. MongoDB'yi Yapılandırma

Güvenlik nedeniyle MongoDB yapılandırması yapmalısınız:

```bash
mongo
```

MongoDB kabuğunda:

```javascript
use admin
db.createUser({
  user: "admin",
  pwd: "guvenli-sifre",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
exit
```

MongoDB yapılandırma dosyasını düzenleyin:

```bash
nano /etc/mongodb.conf
```

`bindIp: 127.0.0.1` satırını bulun ve `authorization: enabled` ekleyin.

MongoDB'yi yeniden başlatın:

```bash
systemctl restart mongodb
```

### 5. Otomatik Backup Ayarlama

```bash
echo "0 2 * * * mongodump --out /backup/mongodb/\$(date +\%Y-\%m-\%d)" | crontab -
```

## Doğrulama

- https://x-ein.com adresine girerek frontend'in çalıştığını kontrol edin
- https://api.x-ein.com adresine girerek backend'in çalıştığını kontrol edin

## Bakım

- Log dosyalarını kontrol edin: `pm2 logs`
- Servis durumunu kontrol edin: `pm2 status`
- Tüm servisleri yeniden başlatın: `pm2 reload all` 