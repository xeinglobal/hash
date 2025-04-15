# Backend API

Bu proje, Express ve TypeScript kullanılarak geliştirilmiş bir RESTful API'dir.

## Kurulum

Projeyi kurmak için şu adımları izleyin:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme modunda çalıştırın
npm run dev

# Üretim için derleyin
npm run build

# Üretim modunda çalıştırın
npm start
```

## API Rotaları

### Kullanıcılar

- `GET /api/users` - Tüm kullanıcıları listeler
- `GET /api/users/:id` - Belirtilen ID'ye sahip kullanıcıyı getirir
- `POST /api/users` - Yeni bir kullanıcı oluşturur
- `PUT /api/users/:id` - Belirtilen ID'ye sahip kullanıcıyı günceller
- `DELETE /api/users/:id` - Belirtilen ID'ye sahip kullanıcıyı siler

## Ortam Değişkenleri

Proje, `.env` dosyasında tanımlanan şu ortam değişkenlerini kullanır:

- `PORT` - Sunucunun çalışacağı port (varsayılan: 3001)
- `NODE_ENV` - Uygulama ortamı ('development', 'production', vb.) 