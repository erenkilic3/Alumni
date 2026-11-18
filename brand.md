# AlumniSphere Brand Kit

AlumniSphere, mezunların üniversiteleriyle ve birbirleriyle bağını kariyer, mentorluk ve fırsatlar üzerinden sürdüren bir mezun ağı platformudur.

> **Marka vaadi:** Mezuniyet biter; bağlantılar devam eder.  
> **Tagline:** Connections that outlast graduation.

Marka dili, kampüs yayınlarının editoryal karakterini ürün arayüzünün açıklığıyla birleştirir. Amaç yeni bir SaaS şablonu üretmek değil; gerçek insanları ve aralarındaki bağı öne çıkarmaktır.

## Marka karakteri

| İlke | Deneyimde karşılığı |
| --- | --- |
| **Bağlılık** | Mezunlar, öğrenciler ve üniversite aynı ağın eşit parçalarıdır. |
| **İlerleme** | Mentorluk ve kariyer fırsatları somut sonraki adımlarla sunulur. |
| **Güven** | Profil, istatistik ve sistem durumu abartısız ve anlaşılırdır. |
| **Sıcak profesyonellik** | Dergi benzeri tipografi, doğal portreler ve ölçülü arayüz detayları kullanılır. |

### Kime konuşuyoruz?

- **Mezunlara:** Yeniden bağ kurma ve katkıda bulunma fırsatları.
- **Öğrencilere:** Mentorlara, kariyer örneklerine ve iş fırsatlarına erişim.
- **Üniversite ekiplerine:** Mezun ağı ve kariyer gelişimi için anlaşılır görünürlük.

## Logo ve ad kullanımı

- Ürün adı her zaman **AlumniSphere** yazılır; `Alumni` ve `Sphere` arasına boşluk konmaz.
- Wordmark, Inter yazı tipinde ve koyu mürekkep renginde kullanılır; `Sphere` forest green ile vurgulanır.
- Kep çizgisi mevcut ürün ikonudur. Kare, forest green zemin üzerinde açık renkte ve gölgesiz kullanılır.
- Logoyu fotoğraf üzerine, gradyan içinde veya düşük kontrastlı zeminde kullanma.

## Renk sistemi

Renklerin uygulamadaki kaynağı [`client/public/styles.css`](./client/public/styles.css) içindeki CSS değişkenleridir.

### Açık tema — varsayılan

| Rol | Token | Değer | Kullanım |
| --- | --- | --- | --- |
| Kâğıt zemin | `--paper` | `#f5f3ed` | Sayfanın ana tuvali |
| Yükseltilmiş yüzey | `--surface-raised` | `#fffefa` | Formlar ve modal yüzeyleri |
| Mürekkep | `--ink` | `#1d2b24` | Başlıklar ve önemli metin |
| İkincil metin | `--ink-soft` | `#415149` | Açıklamalar ve içerik |
| Yardımcı metin | `--muted` | `#6b756e` | Metadata ve ipuçları |
| Orman yeşili | `--green` | `#245442` | Ana eylem, bağlantı ve seçili durum |
| Kil | `--clay` | `#b75e45` | Küçük vurgu ve işaretler |
| Ayırıcı | `--line` | `#d8d8cf` | Bölüm ve satır sınırları |

### Koyu tema

Koyu tema aynı hiyerarşiyi korur; zemin `#19221d`, yüzey `#202b25`, metin `#f0eee6`, orman yeşili vurgu `#a1c6a9` ve kil vurgu `#e3a18a` olarak uyarlanır. Tema `data-theme="dark"` ile etkinleşir.

Başarı, uyarı ve hata durumlarında sırasıyla `--success`, `--warning` ve `--danger` kullanılır. Durumlar yalnızca renkle anlatılmaz; metin etiketi de görünür kalır.

## Tipografi

| Rol | Yazı tipi | Kullanım |
| --- | --- | --- |
| Editoryal başlık | **Newsreader** | Hero, bölüm başlıkları, metrikler ve alıntılar |
| Arayüz ve gövde | **Inter** | Navigasyon, açıklama, form ve eylemler |
| Teknik metadata | **JetBrains Mono** | Kısa sayaçlar ve sistem etiketleri |

Newsreader karakter ve sıcaklık katar; Inter küçük ölçekte okunabilirliği sağlar. Mono yalnızca kısa teknik etiketlerde kullanılır.

## Yerleşim, şekil ve hareket

- Ana içerik en fazla `1200px` genişliğinde; mobil yatay boşluk en az `18px` olmalıdır.
- Hiyerarşi boşluk, çizgisel ayırıcılar ve tipografiyle kurulur; her içerik parçasını karta dönüştürme.
- Düğme ve alanlarda `0–2px` köşe yarıçapı tercih edilir. Portreler dairesel olabilir.
- Gölge, blur ve gradyan varsayılan araçlar değildir.
- Hover ve sekme geçişleri kısa ve ölçülüdür; `prefers-reduced-motion` tercihi korunur.
- Koyu ve açık tema aynı yerleşimi ve kontrast hedefini sürdürür.

## Ses ve mesajlaşma

Ton profesyonel, sıcak, kapsayıcı ve doğrudandır. Kısa eylem cümleleri kullan; başarıyı veya kariyer sonucunu abartma. Bir eylem metni, tıklanınca ne olacağını açıkça anlatmalıdır.

## Görsel dil

Gerçek kişiler, doğal portreler ve kariyer bağlamı dekoratif illüstrasyonlardan önce gelir. Terracotta küçük vurgular içindir; ana eylem rengi değildir. Rastgele şekiller, parlak gradyanlar ve tekrar eden kart ızgaralarından kaçınılır.

### Tasarım üretim özeti

> AlumniSphere'i editoryal, insani ve güvenilir bir mezun ağı olarak tasarla. Newsreader ve Inter kullan; kâğıt zemin, koyu mürekkep, orman yeşili ve ölçülü kil vurgusuyla net bir hiyerarşi kur. Profil ve fırsatları tekrar eden kart yığınları yerine içeriklerine uygun düzenlerde sun. [`DESIGN.md`](./DESIGN.md) ve [`client/public/styles.css`](./client/public/styles.css) kurallarını izle.
