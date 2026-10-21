# Data Definition Document (DDD) - Veritabanı Şeması ve Tablo Dokümantasyonu

Bu doküman, **Alumni Tracking System (AlumniSphere)** projesinin ilişkisel veritabanı (PostgreSQL) mimarisini, tablo tanımlarını, veri tiplerini, kısıtlamalarını (constraints) ve ilişkilerini detaylandırmaktadır.

---

## 🏛️ Varlık İlişki Diyagramı (Entity Relationship Diagram - ERD)

Aşağıdaki Mermaid diyagramı sistemdeki ana veri varlıklarını ve alanlarını göstermektedir:

```mermaid
erDiagram
    USERS {
        VARCHAR(255) id PK "Benzersiz kullanıcı ID"
        VARCHAR(255) name "Ad Soyad"
        VARCHAR(255) email UK "E-posta adresi (Benzersiz)"
        VARCHAR(50) role "Rol (ADMIN, ALUMNI, STUDENT)"
        VARCHAR(255) department "Bölüm / Program"
        TIMESTAMPTZ created_at "Kayıt oluşturulma zamanı"
        TIMESTAMPTZ updated_at "Son güncellenme zamanı"
    }

    ANNOUNCEMENTS {
        VARCHAR(255) id PK "Benzersiz duyuru ID"
        VARCHAR(255) title "Duyuru başlığı"
        TEXT content "Duyuru detay içeriği"
        VARCHAR(50) category "Kategori (EVENT, CAREER, ACADEMIC, GENERAL)"
        VARCHAR(50) priority "Öncelik (NORMAL, HIGH, URGENT)"
        VARCHAR(255) author "Duyuruyu oluşturan birim/yazar"
        VARCHAR(255) user_id FK "Duyuruyu oluşturan kullanıcı (users.id)"
        BOOLEAN is_pinned "Başa tutturulma durumu"
        VARCHAR(50) status "Yayın durumu (ACTIVE, ARCHIVED, DRAFT)"
        TIMESTAMPTZ created_at "Oluşturulma zamanı"
        TIMESTAMPTZ updated_at "Son güncellenme zamanı"
    }

    ALUMNI {
        VARCHAR(255) id PK "Benzersiz mezun ID"
        VARCHAR(255) name "Mezun Ad Soyad"
        INTEGER graduation_year "Mezuniyet yılı"
        VARCHAR(255) department "Mezun olunan bölüm"
        VARCHAR(255) company "Çalıştığı şirket / Kurum"
        VARCHAR(255) role "Mevcut pozisyon / Unvan"
        VARCHAR(255) location "Lokasyon (Şehir, Ülke)"
        VARCHAR(255) industry "Faaliyet sektörü"
        TEXT[] skills "Yetenek ve uzmanlık etiketleri"
        TEXT avatar "Profil görseli URL"
        BOOLEAN is_mentor "Mentorluk veriyor mu?"
        TEXT bio "Biyografi ve tanıtım yazısı"
        VARCHAR(255) user_id FK "İlişkili sistem kullanıcısı (users.id)"
        TIMESTAMPTZ created_at "Profil oluşturulma zamanı"
    }

    JOB_POSTINGS {
        VARCHAR(255) id PK "Benzersiz iş ilanı ID"
        VARCHAR(255) title "Pozisyon unvanı / Rol"
        VARCHAR(255) company "İlanı açan şirket / kurum"
        VARCHAR(255) location "Çalışma lokasyonu (Remote / Şehir)"
        VARCHAR(50) type "İstihdam türü (Full-Time, Internship)"
        TEXT description "İş ilanı detay metni"
        TEXT[] requirements "Aranan teknik nitelikler"
        VARCHAR(100) salary_range "Maaş / Ücret skalası"
        VARCHAR(255) contact_email "Başvuru e-posta adresi"
        VARCHAR(255) posted_by "İlanı oluşturan kullanıcı / mezun"
        VARCHAR(255) user_id FK "İlan veren kullanıcı (users.id)"
        VARCHAR(255) alumni_id FK "İlanı öneren mezun (alumni.id)"
        DATE deadline "Son başvuru tarihi"
        VARCHAR(50) status "Yayın durumu (ACTIVE, CLOSED)"
        TIMESTAMPTZ created_at "İlan oluşturulma zamanı"
        TIMESTAMPTZ updated_at "Son güncellenme zamanı"
    }

    APPLICATIONS {
        VARCHAR(255) id PK "Benzersiz başvuru ID"
        VARCHAR(255) job_id FK "Başvurulan iş ilanı (job_postings.id)"
        VARCHAR(255) user_id FK "Başvuran kullanıcı (users.id)"
        VARCHAR(255) applicant_name "Adayın adı ve soyadı"
        VARCHAR(255) applicant_email "Adayın iletişim e-postası"
        TEXT resume_url "Özgeçmiş / CV dosya bağlantısı"
        TEXT cover_letter "Aday ön yazısı / Başvuru notu"
        VARCHAR(50) status "Durum (PENDING, REVIEWING, ACCEPTED, REJECTED)"
        TIMESTAMPTZ created_at "Başvuru tarihi"
        TIMESTAMPTZ updated_at "Son güncelleme tarihi"
    }

    USERS ||--o| ALUMNI : "ilişkilendirilebilir (1:1, user_id FK)"
    USERS ||--o{ ANNOUNCEMENTS : "oluşturabilir (1:N, user_id FK)"
    USERS ||--o{ JOB_POSTINGS : "yayınlar (1:N, user_id FK)"
    ALUMNI ||--o{ JOB_POSTINGS : "tavsiye eder (1:N, alumni_id FK)"
    USERS ||--o{ APPLICATIONS : "başvurur (1:N, user_id FK)"
    JOB_POSTINGS ||--o{ APPLICATIONS : "başvuru alır (1:N, job_id FK)"
```

---

## 📋 Veritabanı Tabloları (Database Tables)

### 1. `users` Tablosu
Sistemdeki kullanıcı hesaplarını, rollerini ve temel profil bilgilerini saklar.

| Alan Adı (Column) | Veri Tipi (Type) | Zorunlu (Nullable) | Varsayılan (Default) | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(255)` | **HAYIR** (PK) | — | Kullanıcının benzersiz kimliği (Primary Key) |
| `name` | `VARCHAR(255)` | **HAYIR** | — | Kullanıcının tam adı ve soyadı |
| `email` | `VARCHAR(255)` | **HAYIR** (UNIQUE) | — | Kullanıcının tekil e-posta adresi |
| `role` | `VARCHAR(50)` | EVET | `'STUDENT'` | Kullanıcı rolü: `ADMIN`, `ALUMNI`, `STUDENT` |
| `department` | `VARCHAR(255)` | EVET | `'Belirtilmedi'` | Kullanıcının okuduğu/mezun olduğu akademik bölüm |
| `created_at` | `TIMESTAMPTZ` | EVET | `NOW()` | Kullanıcı kaydının oluşturulduğu zaman damgası |
| `updated_at` | `TIMESTAMPTZ` | EVET | `NOW()` | Kullanıcı kaydının son güncellendiği zaman damgası |

#### Örnek Kayıt:
```json
{
  "id": "1",
  "name": "Eren Kılıç",
  "email": "eren@alumni.edu",
  "role": "ADMIN",
  "department": "Software Engineering",
  "created_at": "2026-10-13T06:29:53.526Z",
  "updated_at": "2026-10-13T06:29:53.526Z"
}
```

---

### 2. `announcements` Tablosu
Üniversite, kariyer merkezi veya mezunlar ofisi tarafından yayınlanan etkinlik, iş ilanı ve akademik duyuruları saklar.

| Alan Adı (Column) | Veri Tipi (Type) | Zorunlu (Nullable) | Varsayılan (Default) | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(255)` | **HAYIR** (PK) | — | Duyurunun benzersiz kimliği (Primary Key) |
| `title` | `VARCHAR(255)` | **HAYIR** | — | Duyurunun başlığı |
| `content` | `TEXT` | **HAYIR** | — | Duyurunun detaylı metin içeriği |
| `category` | `VARCHAR(50)` | EVET | `'GENERAL'` | Kategori: `EVENT`, `CAREER`, `ACADEMIC`, `GENERAL` |
| `priority` | `VARCHAR(50)` | EVET | `'NORMAL'` | Öncelik derecesi: `NORMAL`, `HIGH`, `URGENT` |
| `author` | `VARCHAR(255)` | EVET | `'Alumni Staff'` | Duyuruyu yayınlayan birim veya kişi |
| `user_id` | `VARCHAR(255)` | EVET (FK) | — | Duyuruyu sisteme giren kullanıcı kimliği (`users.id` foreign key) |
| `is_pinned` | `BOOLEAN` | EVET | `FALSE` | Panoda en üste sabitlenmiş duyuru mu? |
| `status` | `VARCHAR(50)` | EVET | `'ACTIVE'` | Durum: `ACTIVE`, `ARCHIVED`, `DRAFT` |
| `created_at` | `TIMESTAMPTZ` | EVET | `NOW()` | Duyuru yayın zamanı |
| `updated_at` | `TIMESTAMPTZ` | EVET | `NOW()` | Duyuru son güncelleme zamanı |

#### Örnek Kayıt:
```json
{
  "id": "1",
  "title": "Annual Alumni Homecoming Weekend 2026",
  "content": "Join us this October for the annual Homecoming Reunion! Connect with fellow graduates...",
  "category": "EVENT",
  "priority": "HIGH",
  "author": "Alumni Relations Office",
  "is_pinned": true,
  "status": "ACTIVE",
  "created_at": "2026-10-14T06:33:33.331Z",
  "updated_at": "2026-10-14T06:33:33.331Z"
}
```

---

### 3. `alumni` Tablosu
Mezunların mesleki deneyimlerini, çalıştıkları sektörleri, uzmanlık alanlarını ve mentorluk durumlarını saklar.

| Alan Adı (Column) | Veri Tipi (Type) | Zorunlu (Nullable) | Varsayılan (Default) | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(255)` | **HAYIR** (PK) | — | Mezun profilinin benzersiz kimliği (Primary Key) |
| `name` | `VARCHAR(255)` | **HAYIR** | — | Mezunun adı soyadı |
| `graduation_year`| `INTEGER` | **HAYIR** | — | Üniversiteden mezun olduğu yıl (Örn: 2021) |
| `department` | `VARCHAR(255)` | **HAYIR** | — | Mezun olduğu fakülte/bölüm |
| `company` | `VARCHAR(255)` | EVET | `'Freelance / Independent'` | Mevcut çalıştığı kurum / şirket |
| `role` | `VARCHAR(255)` | EVET | `'Specialist'` | İş unvanı (Örn: Senior Software Engineer) |
| `location` | `VARCHAR(255)` | EVET | `'Remote'` | Yaşadığı / çalıştığı şehir veya ülke |
| `industry` | `VARCHAR(255)` | EVET | `'Technology'` | Faaliyet gösterdiği ana sektör |
| `skills` | `TEXT[]` | EVET | `'{}'` | Yetenek etiketleri dizisi (PostgreSQL Array) |
| `avatar` | `TEXT` | EVET | — | Profil fotoğrafı URL adresi |
| `is_mentor` | `BOOLEAN` | EVET | `FALSE` | Öğrencilere mentorluk yapmaya açık mı? |
| `bio` | `TEXT` | EVET | — | Kısa biyografi ve mezun açıklaması |
| `user_id` | `VARCHAR(255)` | EVET (FK) | — | Mezunun bağlı olduğu sistem kullanıcısı (`users.id` foreign key) |
| `created_at` | `TIMESTAMPTZ` | EVET | `NOW()` | Profilin veritabanına eklenme tarihi |

#### Örnek Kayıt:
```json
{
  "id": "1",
  "name": "Hakan Tosun",
  "graduation_year": 2021,
  "department": "Computer Engineering",
  "company": "Google",
  "role": "Senior Software Engineer",
  "location": "Zurich, Switzerland",
  "industry": "Technology",
  "skills": ["Go", "Kubernetes", "Distributed Systems", "Cloud"],
  "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "is_mentor": true,
  "bio": "Graduated with honors in 2021. Open for student mentorship in cloud infrastructure.",
  "created_at": "2026-10-14T06:33:33.333Z"
}
```

---

### 4. `job_postings` Tablosu
Üniversite mezunları, kariyer geliştirme merkezi ve iş ortakları tarafından paylaşılan kariyer fırsatlarını, iş ve staj ilanlarını saklar.

| Alan Adı (Column) | Veri Tipi (Type) | Zorunlu (Nullable) | Varsayılan (Default) | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(255)` | **HAYIR** (PK) | — | İş ilanının benzersiz kimliği (Primary Key) |
| `title` | `VARCHAR(255)` | **HAYIR** | — | Pozisyon veya staj unvanı (Örn: Junior Backend Developer) |
| `company` | `VARCHAR(255)` | **HAYIR** | — | İlanı yayınlayan şirket veya kuruluş |
| `location` | `VARCHAR(255)` | EVET | `'Remote'` | Çalışma yeri / modeli (Örn: Remote / Istanbul, Hybrid) |
| `type` | `VARCHAR(50)` | EVET | `'Full-Time'` | İstihdam türü: `Full-Time`, `Part-Time`, `Internship`, `Contract` |
| `description` | `TEXT` | **HAYIR** | — | İlanın kapsamlı iş tanımı, sorumlulukları ve detayları |
| `requirements` | `TEXT[]` | EVET | `'{}'` | Aranan nitelikler, teknik beceriler ve teknoloji etiketleri |
| `salary_range` | `VARCHAR(100)` | EVET | — | Maaş veya ücret aralığı (Örn: $40,000 - $55,000) |
| `contact_email`| `VARCHAR(255)` | EVET | — | Başvuru ve CV iletimi için iletişim e-posta adresi |
| `posted_by` | `VARCHAR(255)` | EVET | `'Alumni Career Network'` | İlanı sisteme ekleyen mezun/yetkili adı veya unvanı |
| `user_id` | `VARCHAR(255)` | EVET (FK) | — | İlanı oluşturan kullanıcı kimliği (`users.id` foreign key) |
| `alumni_id` | `VARCHAR(255)` | EVET (FK) | — | İlanı öneren/paylaşan mezun profili kimliği (`alumni.id` foreign key) |
| `deadline` | `DATE` | EVET | — | Son başvuru tarihi (Örn: 2026-10-15) |
| `status` | `VARCHAR(50)` | EVET | `'ACTIVE'` | İlan yayın durumu: `ACTIVE`, `CLOSED`, `DRAFT` |
| `created_at` | `TIMESTAMPTZ` | EVET | `NOW()` | İlanın sisteme girildiği tarih ve saat |
| `updated_at` | `TIMESTAMPTZ` | EVET | `NOW()` | İlanın son güncellendiği tarih ve saat |

#### Örnek Kayıt:
```json
{
  "id": "job-1",
  "title": "Junior Backend Developer (Node.js / PostgreSQL)",
  "company": "Peak Tech",
  "location": "Remote / Istanbul",
  "type": "Full-Time",
  "description": "We are seeking a junior backend engineer to join our high-growth platform team working on scalable REST APIs and PostgreSQL databases.",
  "requirements": ["Node.js", "PostgreSQL", "Express", "Docker", "Git"],
  "salary_range": "$40,000 - $55,000",
  "contact_email": "careers@peaktech.example.com",
  "posted_by": "Burak Demir",
  "deadline": "2026-10-15",
  "status": "ACTIVE",
  "created_at": "2026-10-14T06:33:33.335Z",
  "updated_at": "2026-10-14T06:33:33.335Z"
}
```

---

### 5. `applications` Tablosu
Öğrencilerin ve mezunların kariyer merkezinde veya mezunlar ağında yayınlanan iş ilanlarına yaptıkları başvuruları, ön yazılarını ve başvuru değerlendirme süreçlerini saklar.

| Alan Adı (Column) | Veri Tipi (Type) | Zorunlu (Nullable) | Varsayılan (Default) | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(255)` | **HAYIR** (PK) | — | Başvurunun tekil kimliği (Primary Key) |
| `job_id` | `VARCHAR(255)` | **HAYIR** (FK) | — | Başvurulan iş ilanı (`job_postings.id` foreign key) |
| `user_id` | `VARCHAR(255)` | **HAYIR** (FK) | — | Başvuruyu yapan aday / kullanıcı (`users.id` foreign key) |
| `applicant_name` | `VARCHAR(255)` | EVET | — | Adayın tam adı ve soyadı |
| `applicant_email` | `VARCHAR(255)` | EVET | — | Adayın iletişim e-posta adresi |
| `resume_url` | `TEXT` | EVET | — | Adayın PDF / dijital özgeçmiş dosya bağlantısı |
| `cover_letter` | `TEXT` | EVET | — | Adayın işe başvuru ön yazısı / motivasyon notu |
| `status` | `VARCHAR(50)` | EVET | `'PENDING'` | Başvuru durumu: `PENDING`, `REVIEWING`, `SHORTLISTED`, `ACCEPTED`, `REJECTED` |
| `created_at` | `TIMESTAMPTZ` | EVET | `NOW()` | Başvurunun yapıldığı zaman damgası |
| `updated_at` | `TIMESTAMPTZ` | EVET | `NOW()` | Başvuru durumunun son güncellendiği zaman damgası |

#### Örnek Kayıt:
```json
{
  "id": "app-1",
  "job_id": "job-1",
  "user_id": "3",
  "applicant_name": "Burak Demir",
  "applicant_email": "burak.demir@peak.com",
  "resume_url": "https://storage.example.com/resumes/burak-demir-cv.pdf",
  "cover_letter": "I am passionate about backend distributed systems with Node.js and PostgreSQL.",
  "status": "PENDING",
  "created_at": "2026-10-15T11:00:00.000Z",
  "updated_at": "2026-10-15T11:00:00.000Z"
}
```

---

## 🛠️ DDL (Data Definition Language) SQL Tanımları

PostgreSQL veritabanı başlatıldığında [server/src/db.js](file:///Users/erenkilic/repo/Alumni/server/src/db.js) tarafından otomatik olarak yürütülen SQL şeması:

```sql
-- 1. Users Tablosu
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'STUDENT',
  department VARCHAR(255) DEFAULT 'Belirtilmedi',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Announcements Tablosu
CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'GENERAL',
  priority VARCHAR(50) DEFAULT 'NORMAL',
  author VARCHAR(255) DEFAULT 'Alumni Staff',
  user_id VARCHAR(255),
  is_pinned BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_announcements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Alumni Tablosu
CREATE TABLE IF NOT EXISTS alumni (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  graduation_year INTEGER NOT NULL,
  department VARCHAR(255) NOT NULL,
  company VARCHAR(255) DEFAULT 'Freelance / Independent',
  role VARCHAR(255) DEFAULT 'Specialist',
  location VARCHAR(255) DEFAULT 'Remote',
  industry VARCHAR(255) DEFAULT 'Technology',
  skills TEXT[] DEFAULT '{}',
  avatar TEXT,
  is_mentor BOOLEAN DEFAULT FALSE,
  bio TEXT,
  user_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_alumni_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Job Postings Tablosu
CREATE TABLE IF NOT EXISTS job_postings (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) DEFAULT 'Remote',
  type VARCHAR(50) DEFAULT 'Full-Time',
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  salary_range VARCHAR(100),
  contact_email VARCHAR(255),
  posted_by VARCHAR(255) DEFAULT 'Alumni Career Network',
  user_id VARCHAR(255),
  alumni_id VARCHAR(255),
  deadline DATE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_job_postings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_job_postings_alumni FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE SET NULL
);

-- 5. Applications Tablosu
CREATE TABLE IF NOT EXISTS applications (
  id VARCHAR(255) PRIMARY KEY,
  job_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  applicant_name VARCHAR(255),
  applicant_email VARCHAR(255),
  resume_url TEXT,
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE,
  CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Performans ve İlişki İndeksleri
CREATE INDEX IF NOT EXISTS idx_announcements_user_id ON announcements (user_id);
CREATE INDEX IF NOT EXISTS idx_alumni_user_id ON alumni (user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_user_id ON job_postings (user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_alumni_id ON job_postings (alumni_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_posted_by ON job_postings (posted_by);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings (status);
CREATE INDEX IF NOT EXISTS idx_job_postings_deadline ON job_postings (deadline);
CREATE INDEX IF NOT EXISTS idx_job_postings_type ON job_postings (type);
CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings (company);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications (job_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications (user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);
```

---

## 💾 Docker Kalıcı Depolama (Volume Persistence)

Verilerin `docker compose down` ve `docker compose up` işlemlerinde silinmemesi (kaybolmaması) için **isimlendirilmiş bir Docker Volume (`pgdata`)** kullanılmaktadır:

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: alumni_postgres_db
    environment:
      POSTGRES_USER: ${DB_USER:-alumni_admin}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-alumni_secure_password}
      POSTGRES_DB: ${DB_NAME:-alumni_db}
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
    driver: local
```

- **Persistence Garantisi**: `docker compose down` çalıştırıldığında konteynerlar kaldırılsa bile `pgdata` birimi ana makinede korunur.
- **Akıllı Tohumlama**: [server/src/db.js](file:///Users/erenkilic/repo/Alumni/server/src/db.js) açılışta `COUNT(*)` sorgusu yaparak yalnızca tablolar tamamen boşsa varsayılan kayıtları ekler; mevcut kayıtların üzerine yazmaz.

---

## 🔄 Veritabanı Migrasyon Sistemi (Database Migrations)

AlumniSphere, üçüncü parti ağır ORM bağımlılıkları olmadan **Native SQL Migrations** mimarisi kullanır. Tüm veritabanı şema değişiklikleri ve ilk veriler, sürüm kontrollü SQL dosyaları ve PostgreSQL hareketleri (`BEGIN ... COMMIT / ROLLBACK`) ile yönetilir.

### 📁 Migrasyon Dosyaları (`server/migrations/`)

Migrasyon dosyaları sıralı öneklerle adlandırılır ve her biri hem `-- UP` (şemayı uygulama) hem de `-- DOWN` (geri alma / rollback) blokları içerir:

1. **[001_create_users_table.sql](file:///Users/erenkilic/repo/Alumni/server/migrations/001_create_users_table.sql)**: `users` tablosu, indeksler ve rollback komutları.
2. **[002_create_announcements_table.sql](file:///Users/erenkilic/repo/Alumni/server/migrations/002_create_announcements_table.sql)**: `announcements` tablosu, indeksler ve rollback komutları.
3. **[003_create_alumni_table.sql](file:///Users/erenkilic/repo/Alumni/server/migrations/003_create_alumni_table.sql)**: `alumni` tablosu, indeksler ve rollback komutları.
4. **[004_seed_initial_data.sql](file:///Users/erenkilic/repo/Alumni/server/migrations/004_seed_initial_data.sql)**: Başlangıç mock/seed verileri ve rollback temizleme komutları.
5. **[005_create_job_postings_table.sql](file:///Users/erenkilic/repo/Alumni/server/migrations/005_create_job_postings_table.sql)**: `job_postings` tablosu, indeksler, kısıtlamalar ve rollback komutları.
6. **[006_create_applications_table.sql](file:///Users/erenkilic/repo/Alumni/server/migrations/006_create_applications_table.sql)**: `applications` tablosu, indeksler, kısıtlamalar, seed veriler ve rollback komutları.

### 📋 Takip Tablosu: `schema_migrations`

Hangi migrasyonların uygulandığı veritabanında `schema_migrations` tablosunda saklanır:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 💻 Migrasyon CLI Komutları

Proje kök dizininde veya `server/` dizininde aşağıdaki npm script'leri çalıştırılabilir:

| Komut | Açıklama |
| :--- | :--- |
| `npm run migrate` veya `npm run migrate:up` | Henüz uygulanmamış tüm bekleyen migrasyonları sırayla çalıştırır. |
| `npm run migrate:down` | En son uygulanan tek bir migrasyonu geri alır (`-- DOWN` bloğu). |
| `npm run migrate:status` | Tüm migrasyon dosyalarının durumunu (`[✓ APPLIED]` veya `[⏳ PENDING]`) ve uygulanma tarihlerini tablo olarak listeler. |
| `npm run migrate:reset` | Uygulanmış tüm migrasyonları sırayla geri alır ve sıfırdan tekrar uygular. |

### 🔒 İşlem Güvenliği (Transactional Safety)
Her bir migrasyon ayrı bir PostgreSQL transaction'ı (`BEGIN` -> SQL -> `INSERT INTO schema_migrations` -> `COMMIT`) içinde çalışır. Herhangi bir hata oluşursa anında `ROLLBACK` yapılır ve veritabanı tutarsız bir duruma düşmez.

---

## 🏭 Veri Fabrikaları ve Tohumlama (Factory & Seeding Architecture)

Testler, geliştirme ortamı ve zengin demo verileri için esnek ve gerçekçi veriler üreten bir **Factory & Seeder** mimarisi bulunmaktadır.

### 🏭 Fabrikalar (`server/src/factories/`)

Nesne yönelimli fabrika kalıbı (Factory Pattern) ile modellenmiştir:

- **`BaseFactory`** ([server/src/factories/base.factory.js](file:///Users/erenkilic/repo/Alumni/server/src/factories/base.factory.js)): Tüm fabrikaların türediği ana sınıf. `.make()`, `.create()`, `.state()`, veri rastgeleştiricileri ve dizilim (sequence) araçlarını sağlar.
- **`UserFactory`** ([server/src/factories/user.factory.js](file:///Users/erenkilic/repo/Alumni/server/src/factories/user.factory.js)): Gerçekçi isim, e-posta, bölüm ve roller (`.admin()`, `.alumni()`, `.student()`).
- **`AnnouncementFactory`** ([server/src/factories/announcement.factory.js](file:///Users/erenkilic/repo/Alumni/server/src/factories/announcement.factory.js)): Kategori, öncelik ve yayın durumları (`.pinned()`, `.urgent()`, `.event()`, `.career()`).
- **`AlumniFactory`** ([server/src/factories/alumni.factory.js](file:///Users/erenkilic/repo/Alumni/server/src/factories/alumni.factory.js)): Mezuniyet yılı, şirket, unvan, lokasyon, yetenek etiketleri ve mentorluk durumu (`.mentor()`, `.inCompany()`, `.graduatedIn()`).
- **`JobPostingFactory`** ([server/src/factories/job-posting.factory.js](file:///Users/erenkilic/repo/Alumni/server/src/factories/job-posting.factory.js)): Pozisyon unvanı, şirket, lokasyon, istihdam türü, teknik gereksinimler, maaş skalası ve yayın durumu (`.internship()`, `.fullTime()`, `.remote()`, `.inCompany()`, `.active()`).
- **`ApplicationFactory`** ([server/src/factories/application.factory.js](file:///Users/erenkilic/repo/Alumni/server/src/factories/application.factory.js)): Başvuru CV bağlantısı, ön yazı, aday iletişim bilgileri ve durum trait'leri (`.pending()`, `.reviewing()`, `.shortlisted()`, `.accepted()`, `.rejected()`).

#### Örnek Fabrika Kullanımı:
```javascript
const { UserFactory, AlumniFactory, JobPostingFactory, ApplicationFactory } = require('./server/src/factories');

// Bellekte 5 adet öğrenci oluştur (DB'ye yazmaz)
const students = UserFactory.student().make(5);

// Veritabanına doğrudan 3 adet Google mezun mentoru ekle
const mentors = await AlumniFactory.mentor().inCompany('Google').create(3);

// Doğrudan 4 adet uzaktan staj/iş ilanı oluştur ve DB'ye ekle
const remoteJobs = await JobPostingFactory.internship().remote().create(4);

// Bir ilana 3 adet bekleyen başvuru oluştur ve DB'ye ekle
const applications = await ApplicationFactory.pending().forJob('job-1').create(3);
```

### 🌱 Tohumlayıcılar (`server/src/seeders/`)

- **`UserSeeder`**: Çekirdek sistem kullanıcılarını ve dinamik fabrika kullanıcılarını ekler.
- **`AnnouncementSeeder`**: Temel kampüs duyurularını ve dinamik duyuruları ekler.
- **`AlumniSeeder`**: Örnek lider mezun profillerini ve dinamik mezunları ekler.
- **`JobPostingSeeder`**: Temel kariyer fırsatlarını (`job-1`, `job-2`) ve dinamik fabrika iş ilanlarını ekler.
- **`ApplicationSeeder`**: Temel iş başvurularını (`app-1`, `app-2`) ve dinamik fabrika başvurularını ekler.
- **`DatabaseSeeder`**: Tüm tohumlayıcıları koordine eden ana orkestratör (`--clean` seçeneğiyle tabloları sıfırlayıp baştan tohumlama yapabilir).

### 💻 Tohumlama CLI Komutları

| Komut | Açıklama |
| :--- | :--- |
| `npm run seed` veya `npm run db:seed` | Temel kayıtları ve varsayılan fabrika verilerini (10 kullanıcı, 8 duyuru, 10 mezun, 6 iş ilanı, 6 başvuru) veritabanına ekler. |
| `npm run seed:fresh` | Mevcut tabloları temizler (`TRUNCATE CASCADE`) ve sıfırdan temiz tohum verileri oluşturur. |
| `node server/src/db/seed.js --users=25 --alumni=30 --jobs=15 --applications=20` | İstenilen adetlerde özel dinamik tohumlama yapar. |

---

## 🖥️ Veritabanı Bağlantılı CRUD Arayüzleri (MVC CRUD Interfaces)

Sistemdeki beş ana veri tablosu (`users`, `announcements`, `alumni`, `job_postings`, `applications`) için PostgreSQL veritabanına doğrudan bağlı, server-side rendered (SSR) web arayüzleri ve tam REST API uçları sunulmaktadır:

| Varlık / Modül | Web CRUD Arayüzü | REST API Uçları | Veritabanı Tablosu | Model & Controller |
| :--- | :--- | :--- | :--- | :--- |
| **Users** | [`/users`](http://localhost:5001/users), [`/users/new`](http://localhost:5001/users/new) | `/api/users`, `/api/user/:id`, `/api/users/count` | `users` | `UserModel`, `UserController`, `UserView` |
| **Announcements** | [`/announcements`](http://localhost:5001/announcements), [`/announcements/new`](http://localhost:5001/announcements/new) | `/api/announcements`, `/api/announcement/:id`, `/api/announcements/count` | `announcements` | `AnnouncementModel`, `AnnouncementController`, `AnnouncementView` |
| **Alumni** | [`/alumni`](http://localhost:5001/alumni), [`/alumni/new`](http://localhost:5001/alumni/new) | `/api/alumni`, `/api/alumni/:id`, `/api/alumni/count` | `alumni` | `AlumniModel`, `AlumniController`, `AlumniView` |
| **Job Postings** | [`/jobs`](http://localhost:5001/jobs) | `/api/jobs`, `/api/job/:id`, `/api/jobs/count` | `job_postings` | `JobPostingModel`, `JobPostingController` |
| **Applications** | [`/applications`](http://localhost:5001/applications) | `/api/applications`, `/api/application/:id`, `/api/applications/count` | `applications` | `ApplicationModel`, `ApiApplicationController` |

---

## 🌐 Doğrudan ve İç İçe REST Rotaları (Direct & Nested Routes)

Alumni Sphere platformu, kaynak odaklı REST standartlarına (RESTful Resource-Oriented Architecture) tam uyumlu iki tip rota mimarisi sunar:
1. **Doğrudan Rotalar (Direct Routes)**: Her bir varlık koleksiyonuna veya tekil kaynağa doğrudan kimlik (`:id`) üzerinden erişim sağlayan uç noktalar.
2. **İç İçe Rotalar (Nested Routes)**: Veritabanı tabloları arasındaki 1:1 ve 1:N yabancı anahtar (`foreign key`) ilişkilerini HTTP yolu hiyerarşisinde ifade eden ilişkisel uç noktalar (`/api/:parent/:parentId/:child`).

```mermaid
graph TD
    subgraph DirectRoutes ["Doğrudan Rotalar (Direct Routes)"]
        UsersApi["/api/users (GET, POST)<br/>/api/users/:id (GET, PUT, PATCH, DELETE)"]
        AlumniApi["/api/alumni (GET, POST)<br/>/api/alumni/:id (GET, PUT, PATCH, DELETE)"]
        AnnounceApi["/api/announcements (GET, POST)<br/>/api/announcements/:id (GET, PUT, PATCH, DELETE)"]
        JobsApi["/api/jobs (GET, POST)<br/>/api/jobs/:id (GET, PUT, PATCH, DELETE)"]
        AppsApi["/api/applications (GET, POST)<br/>/api/applications/:id (GET, PUT, PATCH, DELETE)"]
    end

    subgraph NestedRoutes ["İç İçe Rotalar (Nested Relational Routes)"]
        U_Ann["/api/users/:userId/announcements<br/>(GET: Liste, POST: Duyuru Aç)"]
        U_Alm["/api/users/:userId/alumni<br/>(GET: Profil Getir, POST: Profil Bağla)"]
        U_Job["/api/users/:userId/jobs<br/>(GET: Liste, POST: İlan Aç)"]
        U_App["/api/users/:userId/applications<br/>(GET: Liste, POST: Başvuru Yap)"]
        A_Usr["/api/alumni/:alumniId/user<br/>(GET: Mezunun Kullanıcı Hesabı)"]
        A_Job["/api/alumni/:alumniId/jobs<br/>(GET: Liste, POST: İlan Öner)"]
        J_Usr["/api/jobs/:jobId/user<br/>(GET: İlanı Veren Kullanıcı)"]
        J_Alm["/api/jobs/:jobId/alumni<br/>(GET: İlanı Öneren Mezun)"]
        J_App["/api/jobs/:jobId/applications<br/>(GET: Başvuru Listesi, POST: İlana Başvur)"]
        App_Usr["/api/applications/:applicationId/user<br/>(GET: Başvuran Kullanıcı)"]
        App_Job["/api/applications/:applicationId/job<br/>(GET: Başvurulan İş İlanı)"]
    end

    UsersApi -->|1:N| U_Ann
    UsersApi -->|1:1| U_Alm
    UsersApi -->|1:N| U_Job
    UsersApi -->|1:N| U_App
    AlumniApi -->|1:1| A_Usr
    AlumniApi -->|1:N| A_Job
    JobsApi -->|N:1| J_Usr
    JobsApi -->|N:1| J_Alm
    JobsApi -->|1:N| J_App
    AppsApi -->|N:1| App_Usr
    AppsApi -->|N:1| App_Job
```

---

### 1. 📌 Doğrudan Rotalar (Direct Resource Routes)

Tüm ana varlıklar bağımsız koleksiyon ve tekil kaynak uç noktaları ile doğrudan yönetilebilir:

| Modül / Varlık | HTTP Metodu | Uç Nokta (Endpoint) | Açıklama | Başarılı Kod |
| :--- | :--- | :--- | :--- | :--- |
| **Users** | `GET` | `/api/users` | Tüm kullanıcıları listeler (rol, bölüm, arama filtreleri) | `200 OK` |
| **Users** | `GET` | `/api/users/count` | Toplam kullanıcı sayısını döndürür | `200 OK` |
| **Users** | `GET` | `/api/users/:id` | ID'si verilen kullanıcının detaylarını getirir | `200 OK` |
| **Users** | `POST` | `/api/users` | Sisteme yeni kullanıcı kaydeder | `201 Created` |
| **Users** | `PUT` | `/api/users/:id` | Kullanıcı kaydını bütünüyle günceller | `200 OK` |
| **Users** | `PATCH` | `/api/users/:id` | Kullanıcı kaydını kısmi olarak günceller | `200 OK` |
| **Users** | `DELETE` | `/api/users/:id` | Kullanıcı kaydını siler | `200 OK` |
| **Announcements** | `GET` | `/api/announcements` | Tüm duyuruları listeler (kategori, öncelik, durum) | `200 OK` |
| **Announcements** | `GET` | `/api/announcements/count` | Toplam duyuru sayısını döndürür | `200 OK` |
| **Announcements** | `GET` | `/api/announcements/:id` | Tekil duyuru detayını getirir | `200 OK` |
| **Announcements** | `POST` | `/api/announcements` | Yeni duyuru oluşturur | `201 Created` |
| **Announcements** | `PUT` | `/api/announcements/:id` | Duyuruyu bütünüyle günceller | `200 OK` |
| **Announcements** | `PATCH` | `/api/announcements/:id` | Duyuruyu kısmi günceller | `200 OK` |
| **Announcements** | `DELETE` | `/api/announcements/:id` | Duyuruyu siler | `200 OK` |
| **Alumni** | `GET` | `/api/alumni` | Mezunları listeler (bölüm, mezuniyet yılı, mentor filtresi) | `200 OK` |
| **Alumni** | `GET` | `/api/alumni/count` | Toplam kayıtlı mezun sayısını döndürür | `200 OK` |
| **Alumni** | `GET` | `/api/alumni/:id` | Mezun profil detayını getirir | `200 OK` |
| **Alumni** | `POST` | `/api/alumni` | Yeni mezun profili oluşturur | `201 Created` |
| **Alumni** | `PUT` | `/api/alumni/:id` | Mezun profilini bütünüyle günceller | `200 OK` |
| **Alumni** | `PATCH` | `/api/alumni/:id` | Mezun profilini kısmi günceller | `200 OK` |
| **Alumni** | `DELETE` | `/api/alumni/:id` | Mezun profilini siler | `200 OK` |
| **Job Postings** | `GET` | `/api/jobs` | Tüm iş ilanlarını listeler (tür, şirket, arama) | `200 OK` |
| **Job Postings** | `GET` | `/api/jobs/count` | Toplam iş ilanı sayısını döndürür | `200 OK` |
| **Job Postings** | `GET` | `/api/jobs/:id` | Tekil iş ilanı detayını getirir | `200 OK` |
| **Job Postings** | `POST` | `/api/jobs` | Yeni iş ilanı oluşturur | `201 Created` |
| **Job Postings** | `PUT` | `/api/jobs/:id` | İş ilanını bütünüyle günceller | `200 OK` |
| **Job Postings** | `PATCH` | `/api/jobs/:id` | İş ilanını kısmi günceller | `200 OK` |
| **Job Postings** | `DELETE` | `/api/jobs/:id` | İş ilanını siler | `200 OK` |
| **Applications** | `GET` | `/api/applications` | Tüm başvuruları listeler (durum, jobId, userId filtreleri) | `200 OK` |
| **Applications** | `GET` | `/api/applications/count` | Toplam başvuru sayısını döndürür | `200 OK` |
| **Applications** | `GET` | `/api/applications/:id` | Tekil başvuru detayını getirir | `200 OK` |
| **Applications** | `POST` | `/api/applications` | Yeni iş başvurusu oluşturur | `201 Created` |
| **Applications** | `PUT` | `/api/applications/:id` | Başvuruyu bütünüyle günceller | `200 OK` |
| **Applications** | `PATCH` | `/api/applications/:id` | Başvuru durumunu kısmi günceller | `200 OK` |
| **Applications** | `DELETE` | `/api/applications/:id` | Başvuruyu siler | `200 OK` |

---

### 2. 🪢 İç İçe Rotalar (Nested Relational Routes)

İç içe rotalar, veritabanındaki yabancı anahtar (`foreign key`) ilişkilerini REST standartlarına göre modeller:

#### A. Kullanıcı ve Duyuru İlişkisi (`USERS (1) <---> (N) ANNOUNCEMENTS`)
- **`GET /api/users/:userId/announcements`**:
  - **Açıklama**: Belirtilen kullanıcının (`user_id`) yayınladığı tüm duyuruları listeler.
  - **Örnek URL**: `http://localhost:5001/api/users/1/announcements`
- **`POST /api/users/:userId/announcements`**:
  - **Açıklama**: Belirtilen kullanıcı kimliği altında yeni bir duyuru oluşturur (`user_id` otomatik bağlanır).
  - **Dönen Yanıt**: `201 Created`

#### B. Kullanıcı ve Mezun Profili İlişkisi (`USERS (1) <---> (1) ALUMNI`)
- **`GET /api/users/:userId/alumni`**:
  - **Açıklama**: Belirtilen sistem kullanıcısına bağlı mezun profilini getirir.
  - **Örnek URL**: `http://localhost:5001/api/users/1/alumni`
- **`POST /api/users/:userId/alumni`**:
  - **Açıklama**: Kullanıcı için yeni bir mezun profili oluşturur ve `user_id` ile bağlar.
  - **Dönen Yanıt**: `201 Created`

#### C. Kullanıcı ve İş İlanı İlişkisi (`USERS (1) <---> (N) JOB_POSTINGS`)
- **`GET /api/users/:userId/jobs`**:
  - **Açıklama**: Belirtilen kullanıcının oluşturduğu tüm iş ilanlarını listeler.
  - **Örnek URL**: `http://localhost:5001/api/users/1/jobs`
- **`POST /api/users/:userId/jobs`**:
  - **Açıklama**: Belirtilen kullanıcı adına yeni bir iş ilanı yayınlar.
  - **Dönen Yanıt**: `201 Created`

#### D. Mezun ve Kullanıcı Hesabı İlişkisi (`ALUMNI (1) <---> (1) USERS`)
- **`GET /api/alumni/:alumniId/user`**:
  - **Açıklama**: Mezun profiliyle (`alumni.user_id`) eşleşen sistem kullanıcısının hesap bilgilerini getirir.
  - **Örnek URL**: `http://localhost:5001/api/alumni/1/user`

#### E. Mezun ve İş İlanı İlişkisi (`ALUMNI (1) <---> (N) JOB_POSTINGS`)
- **`GET /api/alumni/:alumniId/jobs`**:
  - **Açıklama**: Belirli bir mezunun referans olduğu (`alumni_id`) tüm kariyer fırsatlarını listeler.
  - **Örnek URL**: `http://localhost:5001/api/alumni/1/jobs`
- **`POST /api/alumni/:alumniId/jobs`**:
  - **Açıklama**: Mezun profili üzerinden yeni bir iş ilanı / yönlendirme tavsiyesi yayınlar.
  - **Dönen Yanıt**: `201 Created`

#### F. İş İlanından Kullanıcı ve Mezun İlişkisi
- **`GET /api/jobs/:jobId/user`**: İlanı oluşturan sistem kullanıcısının bilgilerini döndürür.
- **`GET /api/jobs/:jobId/alumni`**: İlanı öneren mezun profilinin detaylarını döndürür.

#### G. Kullanıcı ve Başvuru İlişkisi (`USERS (1) <---> (N) APPLICATIONS`)
- **`GET /api/users/:userId/applications`**:
  - **Açıklama**: Belirtilen kullanıcının yaptığı tüm iş başvurularını listeler.
  - **Örnek URL**: `http://localhost:5001/api/users/3/applications`
  - **Dönen Yanıt (200 OK)**:
    ```json
    {
      "success": true,
      "user": { "id": "3", "name": "Burak Demir" },
      "count": 1,
      "applications": [
        {
          "id": "app-1",
          "jobId": "job-1",
          "userId": "3",
          "status": "PENDING"
        }
      ]
    }
    ```
- **`POST /api/users/:userId/applications`**:
  - **Açıklama**: Belirtilen kullanıcı adına yeni bir iş başvurusu oluşturur.
  - **Dönen Yanıt**: `201 Created`

#### H. İş İlanı ve Başvuru İlişkisi (`JOB_POSTINGS (1) <---> (N) APPLICATIONS`)
- **`GET /api/jobs/:jobId/applications`**:
  - **Açıklama**: Belirli bir iş ilanına gelen tüm başvuruları listeler.
  - **Örnek URL**: `http://localhost:5001/api/jobs/job-1/applications`
  - **Dönen Yanıt (200 OK)**:
    ```json
    {
      "success": true,
      "job": { "id": "job-1", "title": "Junior Backend Developer (Node.js / PostgreSQL)" },
      "count": 1,
      "applications": [
        {
          "id": "app-1",
          "jobId": "job-1",
          "userId": "3",
          "applicantName": "Burak Demir",
          "status": "PENDING"
        }
      ]
    }
    ```
- **`POST /api/jobs/:jobId/applications`**:
  - **Açıklama**: İlgili ilana doğrudan başvuru kaydı oluşturur.
  - **Dönen Yanıt**: `201 Created`

#### I. Başvuru Üzerinden Kullanıcı ve İş İlanı İlişkisi
- **`GET /api/applications/:applicationId/user`**: Başvuruyu yapan adayın sistem kullanıcı profilini getirir.
- **`GET /api/applications/:applicationId/job`**: Başvurulan iş ilanının detaylarını getirir.





