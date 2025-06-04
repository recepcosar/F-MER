# Şikayet ve Öneri Yönetim Sistemi Frontend

Bu proje, Şikayet ve Öneri Yönetim Sistemi'nin frontend uygulamasıdır. React kullanılarak geliştirilmiştir.

## Kurulum

Projeyi kurmak için aşağıdaki adımları izleyin:

```bash
# Bağımlılıkları yükleyin
npm install

# Uygulamayı geliştirme modunda başlatın
npm start
```

Uygulama, tarayıcınızda [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## Özellikler

- Kullanıcı girişi ve kimlik doğrulama
- Şikayetleri görüntüleme ve yönetme
- Bildirimleri görüntüleme

## Not

Bu frontend uygulaması, backend API'sine bağlanmak için varsayılan olarak `/api` endpoint'ini kullanır. Backend farklı bir URL'de çalışıyorsa, `frontend/src/services/api.js` dosyasındaki `baseURL` değerini değiştirmeniz gerekir. 