# Masyu Yapı

## Firebase yayını

Hedef proje `adanahizlisatis`, Hosting sitesi `masyuinsaat`, sunucu fonksiyonu `masyuApi` (europe-west1), ayrı Firestore veritabanı `masyu` olarak yapılandırılmıştır. Canlı mesajlar Firestore'da tutulur; yerel geliştirme SQLite kullanır.

Firebase sunucu ortamındaki yönetici hesabı `functions/.env.adanahizlisatis` dosyasında tanımlanır. Dosya sürüm kontrolüne dahil edilmez. Dağıtım: `firebase deploy --only "functions:masyu,hosting" --project adanahizlisatis`. Firestore istemci erişimi kapalıdır; mesajlar yalnızca sunucu üzerinden okunur ve yazılır.

Eski inşaat sitesi temel alınarak hazırlanan kurumsal site ve sunucuda doğrulanan yönetim paneli.

## Çalıştırma

Node.js 22.13 veya üzeri gerekir. `npm start` ile başlatın; site `http://localhost:3000`, panel `/dashboard` adresindedir. Harici paket gerekmez.

## Yönetici ve kayıtlar

Yerel `.env` dosyasında `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (salt: scrypt özeti), `PORT` bulunur. Bu dosya Git'e dahil edilmez. Şifre istemciye gönderilmez. Oturumlar sekiz saat sürer; sunucu yeniden başlatıldığında yeniden giriş gerekir.

Mesajlar `data/masyu.sqlite` içinde tutulur. Yayında kalıcı diskli bir Node.js sunucusu, HTTPS ve bu dizin için yedekleme gerekir. `NODE_ENV=production` güvenli oturum çerezini etkinleştirir. Sadece statik dosya yayını API'yi çalıştırmaz. Panel 10 saniyede bir mesajları yeniler. Gerçek müşteri mesajları başlangıçta boştur.

## İçerik durumu

Kurumsal sayfalar eski tasarımdan taşınmıştır. Projeler, sayısal iddialar, adres, telefon, e-posta, sosyal bağlantılar ve SEO alanları eski sitenin örnek içeriğini içerir; canlıya çıkmadan Masyu Yapı'nın doğrulanmış bilgileriyle değiştirilmelidir. Bu çalışma henüz yayına alınmamıştır.
