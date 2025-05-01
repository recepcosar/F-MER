# Şikayet ve Öneri Yönetim Sistemi API

Bu proje, kurum içi şikayet ve önerilerin yönetilmesi için geliştirilmiş bir backend API'dir.

## Özellikler

- **Kullanıcı Yönetimi**: Kayıt, giriş, profil yönetimi
- **Şikayet/Öneri Yönetimi**: Şikayet oluşturma, listeleme, güncelleme
- **Rol Tabanlı Yetkilendirme**: Kullanıcı, Yönetici ve Sistem Yöneticisi rolleri
- **Şikayet Durumu İzleme**: Şikayetlerin durumlarını takip etme
- **Bildirim Sistemi**: Durum değişikliği ve yeni yorumlar için bildirimler
- **İstatistikler**: Şikayet ve kullanıcılarla ilgili istatistikler

## Teknolojiler

- Node.js
- Express.js
- MySQL / Sequelize ORM
- JWT Authentication
- RESTful API

## Kurulum

1. Repository'yi klonlayın:
```
git clone <repo-url>
```

2. Gerekli bağımlılıkları yükleyin:
```
npm install
```

3. `.env` dosyasını örnek `.env.example` dosyasından oluşturun:
```
cp .env.example .env
```

4. `.env` dosyasını kendi veritabanı bilgilerinizle düzenleyin.

5. Veritabanını oluşturun:
```
CREATE DATABASE sikayet_db;
```

6. Uygulamayı başlatın:
```
npm run dev
```

## API Endpoint'leri

### Kullanıcı İşlemleri
- `POST /api/users/register` - Kullanıcı kaydı
- `POST /api/users/login` - Kullanıcı girişi
- `GET /api/users/profile` - Profil bilgilerini görüntüleme
- `PUT /api/users/profile` - Profil güncelleme
- `PUT /api/users/change-password` - Şifre değiştirme

### Şikayet İşlemleri
- `GET /api/complaints/categories` - Şikayet kategorilerini listeleme
- `POST /api/complaints` - Yeni şikayet oluşturma
- `GET /api/complaints` - Kullanıcının şikayetlerini listeleme
- `GET /api/complaints/:id` - Şikayet detayını görüntüleme
- `PUT /api/complaints/:id` - Şikayet güncelleme
- `POST /api/complaints/:id/cancel` - Şikayet iptal etme
- `POST /api/complaints/:id/comments` - Şikayete yorum ekleme

### Admin İşlemleri
- `GET /api/admin/complaints` - Tüm şikayetleri listeleme
- `PUT /api/admin/complaints/:id/status` - Şikayet durumunu güncelleme
- `GET /api/admin/statistics` - İstatistikleri görüntüleme
- `POST /api/admin/categories` - Yeni kategori ekleme
- `PUT /api/admin/categories/:id` - Kategori güncelleme
- `GET /api/admin/users` - Kullanıcıları listeleme (sadece system admin)
- `PUT /api/admin/users/:id/status` - Kullanıcı durumunu değiştirme (sadece system admin)
- `PUT /api/admin/users/:id/role` - Kullanıcı rolünü değiştirme (sadece system admin)

### Bildirim İşlemleri
- `GET /api/notifications` - Bildirimleri listeleme
- `PUT /api/notifications/:id/read` - Bildirimi okundu olarak işaretleme
- `PUT /api/notifications/mark-all-read` - Tüm bildirimleri okundu olarak işaretleme
- `DELETE /api/notifications/:id` - Bildirimi silme

## Veritabanı Yedekleme

Otomatik MySQL veritabanı yedeklemesi için cron job ekleyin:

```
0 0 * * * mysqldump -u [username] -p[password] sikayet_db > /yedekler/sikayet_db_$(date +\%Y\%m\%d).sql
```

## Lisans

MIT 