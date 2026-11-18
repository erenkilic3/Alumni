# AlumniSphere Brand Kit

AlumniSphere, mezunların üniversiteleriyle ve birbirleriyle bağını kariyer, mentorluk ve fırsatlar üzerinden sürdüren bir mezun ağı platformudur.

> **Marka vaadi:** Mezuniyet biter; bağlantılar devam eder.  
> **Tagline:** Connections that outlast graduation.

Bu kit, VoltAgent/awesome-design-md içindeki Mintlify tasarım analizinden yararlanır; AlumniSphere adı, logosu, metinleri ve ürün deneyimi bağımsızdır. İlgili tasarım belgesi [`DESIGN.md`](./DESIGN.md), uygulama tokenları [`client/public/styles.css`](./client/public/styles.css) içindedir. Kaynak ve lisans bildirimi [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) dosyasında yer alır.

## Marka karakteri

| İlke | Deneyimde karşılığı |
| --- | --- |
| **Bağlılık** | Mezunlar, öğrenciler ve üniversite aynı ağın parçalarıdır. |
| **İlerleme** | Mentorluk ve kariyer fırsatları somut sonraki adımlarla sunulur. |
| **Güven** | Profil, istatistik ve sistem durumu abartısız ve anlaşılırdır. |
| **Netlik** | Bilgi kolay taranır; eylemler sonucu açıkça anlatır. |

### Kime konuşuyoruz?

- **Mezunlara:** Yeniden bağ kurma ve katkıda bulunma fırsatları.
- **Öğrencilere:** Mentorlara, kariyer örneklerine ve iş fırsatlarına erişim.
- **Üniversite ekiplerine:** Mezun ağı ve kariyer gelişimi için anlaşılır görünürlük.

## Logo ve ad kullanımı

- Ürün adı her zaman **AlumniSphere** yazılır; `Alumni` ve `Sphere` arasına boşluk konmaz.
- Wordmark Inter ile yazılır; `Sphere` mint tonuyla ayrıştırılır.
- Kep çizgisi mevcut ürün ikonudur. İkon kare mint zeminde koyu çizgiyle kullanılır; gölge ve gradyan eklenmez.
- AlumniSphere markasını Mintlify logosu, adı veya ayırt edici marka varlıklarıyla karıştıracak biçimde kullanma.

## Renk sistemi

Renklerin uygulamadaki kaynağı [`client/public/styles.css`](./client/public/styles.css) içindeki CSS değişkenleridir.

### Açık tema — varsayılan

| Rol | Token | Değer | Kullanım |
| --- | --- | --- | --- |
| Tuval | `--paper` | `#ffffff` | Sayfanın ana zemini |
| Yükseltilmiş yüzey | `--surface-raised` | `#ffffff` | Formlar ve modal yüzeyleri |
| Birincil metin | `--ink` | `#0a0a0a` | Başlıklar ve önemli değerler |
| İkincil metin | `--ink-soft` | `#3a3a3c` | Açıklamalar ve içerik |
| Yardımcı metin | `--muted` | `#5a5a5c` | Metadata ve etiketler |
| Mint vurgu | `--green-bright` | `#00d4a4` | Logo ve kısa marka vurguları |
| Okunabilir mint | `--green` | `#007b62` | Metin bağlantıları ve aktif durumlar |
| Ayırıcı | `--line` | `#e5e5e5` | Bölüm ve satır sınırları |

Birincil CTA siyah zemin ve beyaz metin kullanır. Mint zeminli öğelerde koyu metin kullan; açık minti beyaz üzerinde küçük metin rengi olarak kullanma.

### Koyu tema

Koyu tema `data-theme="dark"` ile etkinleşir. Zemin `#0a0a0a`, yüzeyler `#141414` / `#1c1c1e`, metin beyaz ve ikincil metinler gri tonlarıdır. Mint vurgular metin ve aktif durumlarda açık `#7cebcb` olur; siyah birincil CTA beyaz zeminli ters eyleme dönüşür.

Başarı, uyarı ve hata durumlarında sırasıyla `--success`, `--warning` ve `--danger` kullanılır. Durumlar yalnızca renkle anlatılmaz; metin etiketi de görünür kalır.

## Tipografi

| Rol | Yazı tipi | Kullanım |
| --- | --- | --- |
| Arayüz ve başlık | **Inter** | Hero, gövde metni, navigasyon, form ve eylemler |
| Teknik metadata | **Geist Mono** | Sayaçlar, API durumu ve teknik örnekler |

Başlıklar `600` ağırlıkla net hiyerarşi kurar. Gövde metni `14–16px` ve yaklaşık `1.5` satır yüksekliğinde olmalıdır. Mono yazı tipini yalnızca kısa teknik içeriklerde kullan.

## Yerleşim, şekil ve hareket

- İçerik en fazla `1200–1280px` genişliğinde; mobil yatay boşluk en az `18px` olmalıdır.
- Hiyerarşiyi tipografi, boşluk ve ayırıcılarla kur; mezun profil ve fırsatlarını tekrar eden kart yığınlarına dönüştürme.
- Birincil ve ikincil düğmeler pill biçiminde; kartlar `8–12px`, giriş alanları `8px` köşe yarıçapında olabilir.
- Gölge yalnızca mockup veya belirgin yükseltilmiş yüzey gerektiğinde kullanılmalıdır.
- Koyu ve açık tema aynı içerik hiyerarşisini ve kontrast hedefini korur.
- Hareket kısa ve ölçülüdür; `prefers-reduced-motion` tercihi korunur.

## Ses ve mesajlaşma

Ton profesyonel, sıcak ve doğrudandır. Kısa eylem cümleleri kullan; başarıyı veya kariyer sonucunu abartma. Bir eylem metni tıklanınca ne olacağını açıkça anlatmalıdır.

### Tasarım üretim özeti

> AlumniSphere'i net, güvenilir ve teknoloji odaklı bir mezun ağı olarak tasarla. Inter ve Geist Mono, beyaz/siyah yüzeyler, mint vurgular, pill CTA'lar ve ölçülü `8–12px` köşeler kullan. Mintlify'nin ayırt edici marka varlıklarını veya illüstrasyonlarını kopyalama; kişilere, mentorluğa ve kariyer fırsatlarına özgü içerik hiyerarşisini koru. [`DESIGN.md`](./DESIGN.md) ve [`client/public/styles.css`](./client/public/styles.css) kurallarını izle.
