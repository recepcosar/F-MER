# API Anahtarlarını Güvenli Bir Şekilde Yönetme Rehberi

## Önlem ve Güvenlik Adımları

### 1. Ortam Değişkenlerini Kullanın
- Asla API anahtarlarını veya hassas bilgileri doğrudan kodunuza yazmayın
- Her zaman `.env` dosyaları içinde saklayın
- Bu dosyaları `.gitignore` ile Git'ten hariç tutun

### 2. Güçlü JWT Sırları Kullanın
- JWT_SECRET için en az 32 karakter uzunluğunda rastgele oluşturulmuş anahtarlar kullanın
- Örnek güçlü anahtar oluşturma komutu:
  ```
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 3. Dosyalar ve İzinler
- `.env` dosyasına erişimi sadece gerekli kişilerle sınırlayın
- Üretim ortamında `.env` dosyalarının izinlerini 0600 (sadece sahibi okuyabilir ve yazabilir) olarak ayarlayın

### 4. Versiyon Kontrolü
- Hassas bilgileri hiçbir zaman Git veya başka versiyon kontrol sistemlerinde bulundurmayın
- Kazara Git'e gönderilen dosyalar için:
  ```
  git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all
  ```

### 5. Ortam Değişkenlerinin Kontrolü
- Uygulama başlatılırken gerekli ortam değişkenlerinin varlığını kontrol edin
- Değişken yoksa uygulamayı başlatmayın veya varsayılan değerlere izin vermeyin

### 6. API Anahtarı Rotasyonu
- API anahtarlarınızı düzenli olarak değiştirin
- 3-6 ayda bir anahtar değişimi yapın
- Eski anahtarları tamamen devre dışı bırakın

### 7. Farklı Ortamlar için Farklı Anahtarlar
- Geliştirme, test, üretim ortamları için ayrı anahtarlar kullanın
- Bu ortamları asla birbirleriyle paylaşmayın

### 8. Dış Servislere API Anahtarlarının Gönderilmesi
- API anahtarlarını istemci tarafına (frontend) hiçbir zaman göndermeyin
- Tüm hassas işlemleri backend'de gerçekleştirin
- Dış servislere yapılan API çağrılarını proxy ile yönlendirin

### 9. Bellek Güvenliği
- Hassas bilgileri bellekte olabildiğince kısa tutun
- Gerekli olmadığında değişkenleri temizleyin

### 10. Log Güvenliği
- API anahtarlarını veya hassas bilgileri hiçbir zaman loglara yazdırmayın
- Hata ayıklarken bile hassas bilgileri ekrana yazdırmayın

## Uygulama için Önerilen Güvenlik Adımları

1. `.env` dosyası oluşturun ve tüm güvenlik anahtarlarını buraya ekleyin
2. Yukarıda gösterdiğimiz gibi JWT_SECRET için güçlü bir anahtar oluşturun
3. `.gitignore` dosyasını güncellediğimizden emin olun
4. Tüm kodunuzu kontrol ederek hardcoded anahtarları veya sırları kaldırın
5. Üretim ve geliştirme ortamları için ayrı `.env` dosyaları oluşturun
6. Uygulamanın başlangıcında tüm gerekli ortam değişkenlerinin varlığını doğrulayın 