# AlumniSphere Brand Kit

AlumniSphere, mezunların üniversiteleriyle ve birbirleriyle bağını kariyer, mentorluk ve fırsatlar üzerinden sürdüren bir mezun ağı platformudur.

> **Marka vaadi:** Mezuniyet biter; bağlantılar devam eder.  
> **İngilizce tagline:** Connections that outlast graduation.  
> **Ürün tanımı:** Alumni Tracking & Network System

Bu kit, [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) koleksiyonundaki Linear tasarımının yalınlık, hassas hiyerarşi ve ölçülü mor vurgu ilkelerinden esinlenir. AlumniSphere'in adı, logosu, metinleri ve renk sistemi özgündür; başka bir markanın görsel kimliğini kopyalamaz. Arayüz tokenlarının uygulamadaki kaynağı [`client/public/styles.css`](./client/public/styles.css), bileşen ve yerleşim kuralları ise [`DESIGN.md`](./DESIGN.md) dosyasıdır.

## Marka karakteri

| İlke | Deneyimde karşılığı |
| --- | --- |
| **Bağlılık** | Mezun, öğrenci ve üniversite aynı ağın eşit parçalarıdır. |
| **İlerleme** | Mentorluk, kariyer ve iş fırsatları somut sonraki adımlarla sunulur. |
| **Güven** | Profil, istatistik ve sistem durumları açık; arayüz sakin ve tutarlıdır. |
| **Erişilebilirlik** | Dil sade, eylemler belirgin, koyu ve açık tema dengelidir. |

### Kime konuşuyoruz?

- **Mezunlara:** Yeniden bağ kurma ve katkıda bulunma fırsatları.
- **Öğrencilere:** Mentorlara, kariyer örneklerine ve iş fırsatlarına erişim.
- **Üniversite ekiplerine:** Mezun ağı ve kariyer gelişimi için anlaşılır görünürlük.

## Logo ve ad kullanımı

- Ürün adı her zaman **AlumniSphere** yazılır; `Alumni` ve `Sphere` arasına boşluk konmaz.
- Birincil wordmark, `Alumni` metni ve vurgu gradyanlı `Sphere` bölümünden oluşur.
- İkon, mevcut mezuniyet kepi çizgisidir. Arayüzde 44 × 44 px gradyanlı, 12 px köşeli zemin üzerinde kullanılır; SVG çizgisi yuvarlak uçlu ve birleşimlidir.
- Wordmark ile ikon birlikte kullanıldığında aralarında en az ikon genişliğinin dörtte biri kadar boşluk bırakılır.
- Gradyanlı logo koyu veya açık, sade bir zeminde kullanılmalıdır. Metin okunurluğunu düşüren fotoğraf veya desen üzerine yerleştirilmemelidir.
- İkon tek başına kullanılabilir; küçük boyutlarda kep çizgisi ve silüeti korunmalıdır. Sıkıştırma, döndürme veya renkleri ayrı ayrı değiştirme yapılmamalıdır.

Mevcut ikon:

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
     aria-hidden="true">
  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
</svg>
```

## Renk sistemi

Renkler arayüzde doğrudan sabit değerlerle değil, CSS değişkenleriyle kullanılmalıdır. Koyu tema varsayılandır; açık tema `data-theme="light"` ile etkinleşir.

### Koyu tema — varsayılan

| Rol | Token | Değer | Kullanım |
| --- | --- | --- | --- |
| Ana zemin | `--bg-primary` | `#08090a` | Sayfa tuvali |
| İkincil zemin | `--bg-secondary` | `#0f1011` | Navigasyon, modal ve paneller |
| Kart yüzeyi | `--bg-card` | `rgba(20, 21, 22, 0.85)` | Kartlar ve yükseltilmiş alanlar |
| Kart hover | `--bg-card-hover` | `#18191b` | Etkileşimli yüzey hover durumu |
| Girdi yüzeyi | `--bg-input` | `#141516` | Formlar ve ikincil kontroller |
| Ana metin | `--text-primary` | `#f7f8f8` | Başlıklar ve önemli değerler |
| İkincil metin | `--text-secondary` | `#d0d6e0` | Açıklamalar ve gezinme öğeleri |
| Soluk metin | `--text-muted` | `#8a8f98` | Yardımcı bilgi ve metadata |
| Marka indigosu | `--accent-primary` | `#5e6ad2` | Ana eylemler, bağlantılar ve vurgu |
| Indigo hover | `--accent-primary-hover` | `#6e7be2` | Koyu temadaki hover vurgusu |
| İmza gradyanı | `--accent-gradient` | `#5e6ad2 → #8b5cf6` | Birincil CTA ve sınırlı başlık vurgusu |
| İnce kenarlık | `--border-color` | `rgba(255, 255, 255, 0.08)` | Kart ve ayırıcı kenarları |
| Etkin kenarlık | `--border-highlight` | `rgba(94, 106, 210, 0.45)` | Odak ve seçili durum |

### Açık tema

| Rol | Token | Değer |
| --- | --- | --- |
| Ana zemin | `--bg-primary` | `#fafafa` |
| İkincil zemin | `--bg-secondary` | `#ffffff` |
| Kart yüzeyi | `--bg-card` | `rgba(255, 255, 255, 0.92)` |
| Hover / girdi yüzeyi | `--bg-card-hover`, `--bg-input` | `#f4f4f5` |
| Ana metin | `--text-primary` | `#09090b` |
| İkincil metin | `--text-secondary` | `#3f3f46` |
| Soluk metin | `--text-muted` | `#71717a` |
| Marka indigosu | `--accent-primary` | `#5e6ad2` |
| İmza gradyanı | `--accent-gradient` | `#5e6ad2 → #7c3aed` |
| İnce kenarlık | `--border-color` | `rgba(0, 0, 0, 0.08)` |

### Durum renkleri

| Durum | Token | Renk | Soluk zemin |
| --- | --- | --- | --- |
| Başarılı / çevrimiçi | `--success` | `#10b981` | `rgba(16, 185, 129, 0.14)` |
| Uyarı / beklemede | `--warning` | `#f59e0b` | `rgba(245, 158, 11, 0.14)` |
| Bilgi | `--info` | `#3b82f6` | `rgba(59, 130, 246, 0.14)` |

Durumlar yalnızca renkle anlatılmamalı; etiket veya ikonla da belirtilmelidir. Gradyan dekoratif ve markasal bir vurgu içindir; durum renklerinin yerine kullanılmaz.

## Tipografi

| Rol | Yazı tipi | Kullanım |
| --- | --- | --- |
| Başlık ve arayüz | **Inter** | Başlıklar, gövde metni, buton ve formlar |
| Teknik etiket | **JetBrains Mono** | Sistem durumu ve teknik metadata gibi kısa etiketler |

- Başlıklarda `600–700` ağırlık, gövde metninde `400–500`, eylemlerde `600` tercih edilir.
- Hero başlığı: `clamp(2.25rem, 4.5vw, 3.25rem)`, satır yüksekliği `1.1`, harf aralığı `-0.04em`.
- Gövde metni: yaklaşık `1rem`, satır yüksekliği `1.6`.
- Rakamlar net ve kolay taranır olmalı; uzun metinlerde monospaced yazı tipi kullanılmamalıdır.

## Şekil, boşluk ve hareket

- İçerik en fazla `1280px` genişliğinde; yatay kenar boşluğu `24px` olmalıdır.
- Kartlar için `16px`, kontroller için `10px`, etiketler için tam oval (`9999px`) köşe kullanılır.
- Kartlarda ince kenarlık ve hafif iç parlama, birincil eylemlerde ölçülü gölge kullanılır. Ağır blur ve büyük neon parıltılardan kaçınılır.
- Hızlı etkileşimler `0.18s`, tema ve katman geçişleri `0.28s` sürer. Hareket, eylemi desteklemeli; dikkati içerikten çalmamalıdır.
- Koyu ve açık tema aynı hiyerarşiyi, bileşen ölçülerini ve etkileşim durumlarını korumalıdır.

## Ses ve mesajlaşma

**Ton:** Profesyonel, sıcak, kapsayıcı ve doğrudan. Kurumsal güven verir; soğuk veya aşırı teknik konuşmaz.

- Kısa, eylem odaklı cümleler kullan: “Mezunları keşfet”, “Mentor olarak katıl”.
- Belirsiz düğme metinleri (“Gönder”, “Devam”) yerine sonucu açıkça belirt.
- Başarı ve hata mesajlarında ne olduğunu ve kullanıcının sonraki adımını söyle.
- Kariyer başarısını abartılı vaatlerle sunma; istatistik ve sonuçlarda bağlamı koru.

## Görsel dil

- Öncelik ürün ekranlarına, gerçekçi mezun profillerine ve anlamlı kariyer/mentorluk bağlamlarına verilir.
- Portreler doğal, çeşitli ve profesyonel olmalı; aşırı rötuşlu stok fotoğraf görünümünden kaçınılmalıdır.
- Soyut görsel gerektiğinde ağ, bağlantı ve ilerleme fikrini sade çizgilerle destekle; arayüzün indigo-mor vurgusunu aşırı kullanma.
- İkonlar tutarlı çizgi kalınlığına sahip olmalı; emoji, temel navigasyon veya durum ikonlarının yerine kullanılmamalıdır.

## Kullanım özeti

**Yap:** koyu obsidyen yüzeyleri koru, indigo vurguyu seçici kullan, bilgiyi net hiyerarşiyle sun, her etkileşimde görünür odak durumu sağla.  
**Yapma:** başka markaların logosunu veya ayırt edici bileşenlerini kopyalama, her karta gradyan uygulama, anlamı yalnızca renkle iletme, düşük kontrastlı küçük metin kullanma.

### Tasarım üretim prompt'u

> AlumniSphere için AlumniSphere Brand Kit'e ve [`DESIGN.md`](./DESIGN.md) tasarım sistemine bağlı kal. Linear'dan yalnızca yalınlık ve hassas bilgi hiyerarşisi ilkelerini referans al; logo, bileşen veya ayırt edici marka varlıklarını kopyalama. Inter/JetBrains Mono tipografisini, obsidyen yüzeyleri, ölçülü indigo-mor vurguyu ve erişilebilir koyu/açık tema tokenlarını kullan. Mezun ağı, kariyer gelişimi ve güven hissini önceliklendir.
