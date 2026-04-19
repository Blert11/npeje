-- ============================================================
-- Peja Tourism Platform – MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS peja_tourism
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE peja_tourism;

-- ─── USERS ──────────────────────────────────────────────────
CREATE TABLE users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120)  NOT NULL,
  email       VARCHAR(180)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('user','admin','business') NOT NULL DEFAULT 'user',
  avatar      VARCHAR(500)  NULL,
  is_active   TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
) ENGINE=InnoDB;

-- ─── LISTINGS ───────────────────────────────────────────────
CREATE TABLE listings (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(200)  NOT NULL,
  slug          VARCHAR(220)  NOT NULL UNIQUE,
  category      ENUM('hotels','restaurants','cafes','villas','activities','nightlife','transport','shops') NOT NULL,
  description   TEXT          NOT NULL,
  short_desc    VARCHAR(300)  NULL,
  location      VARCHAR(300)  NOT NULL,
  lat           DECIMAL(10,7) NULL,
  lng           DECIMAL(10,7) NULL,
  features      JSON          NULL COMMENT 'Array of feature strings',
  contact_info  JSON          NULL COMMENT '{phone, email, website, instagram, facebook}',
  menu_url      VARCHAR(500)  NULL,
  price_range   TINYINT       NULL COMMENT '1=budget 2=mid 3=upscale 4=luxury',
  is_featured   TINYINT(1)    NOT NULL DEFAULT 0,
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  owner_id      INT UNSIGNED  NULL COMMENT 'linked business user',
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_category  (category),
  INDEX idx_featured  (is_featured),
  INDEX idx_active    (is_active),
  FULLTEXT idx_search (title, description)
) ENGINE=InnoDB;

-- ─── IMAGES ─────────────────────────────────────────────────
CREATE TABLE images (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  listing_id  INT UNSIGNED NOT NULL,
  url         VARCHAR(500) NOT NULL,
  alt_text    VARCHAR(200) NULL,
  sort_order  SMALLINT     NOT NULL DEFAULT 0,
  is_cover    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  INDEX idx_listing (listing_id)
) ENGINE=InnoDB;

-- ─── REVIEWS ────────────────────────────────────────────────
CREATE TABLE reviews (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  listing_id  INT UNSIGNED NOT NULL,
  rating      TINYINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT         NULL,
  is_visible  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_listing (user_id, listing_id),
  INDEX idx_listing (listing_id),
  INDEX idx_user    (user_id)
) ENGINE=InnoDB;

-- ─── OFFERS ─────────────────────────────────────────────────
CREATE TABLE offers (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  listing_id  INT UNSIGNED NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT         NULL,
  image       VARCHAR(500) NULL,
  discount    VARCHAR(50)  NULL COMMENT 'e.g. "20% off" or "Free dessert"',
  valid_until DATE         NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  INDEX idx_listing (listing_id),
  INDEX idx_active  (is_active)
) ENGINE=InnoDB;

-- ─── ANALYTICS: PAGE VIEWS ──────────────────────────────────
CREATE TABLE listing_views (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  listing_id  INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED NULL,
  ip_hash     VARCHAR(64)  NULL COMMENT 'SHA-256 of IP for unique visitor counting',
  user_agent  VARCHAR(500) NULL,
  viewed_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  INDEX idx_listing_date (listing_id, viewed_at),
  INDEX idx_user         (user_id)
) ENGINE=InnoDB;

-- ─── ANALYTICS: BUTTON CLICKS ───────────────────────────────
CREATE TABLE listing_clicks (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  listing_id  INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED NULL,
  button_type ENUM('call','directions','menu','website','instagram','facebook','share') NOT NULL,
  clicked_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  INDEX idx_listing_date (listing_id, clicked_at),
  INDEX idx_button       (button_type)
) ENGINE=InnoDB;

-- ─── ANALYTICS: CONTACTS / LEADS ────────────────────────────
CREATE TABLE contacts (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  listing_id   INT UNSIGNED NULL,
  user_id      INT UNSIGNED NULL,
  name         VARCHAR(120) NOT NULL,
  email        VARCHAR(180) NOT NULL,
  phone        VARCHAR(30)  NULL,
  message      TEXT         NOT NULL,
  contact_type ENUM('general','listing_inquiry','join_request') NOT NULL DEFAULT 'general',
  is_read      TINYINT(1)   NOT NULL DEFAULT 0,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL,
  INDEX idx_listing (listing_id),
  INDEX idx_type    (contact_type)
) ENGINE=InnoDB;

-- ─── ANALYTICS: SESSIONS ────────────────────────────────────
CREATE TABLE sessions (
  id            VARCHAR(36)  PRIMARY KEY COMMENT 'UUID',
  user_id       INT UNSIGNED NULL,
  listing_id    INT UNSIGNED NULL COMMENT 'current listing being viewed',
  ip_hash       VARCHAR(64)  NULL,
  started_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_active_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL,
  INDEX idx_listing     (listing_id),
  INDEX idx_last_active (last_active_at)
) ENGINE=InnoDB;

-- ─── SEED: ADMIN USER ───────────────────────────────────────
-- Password: Admin@123 (bcryptjs, cost 12)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@pejatourism.com',
 '$2b$12$jXuTp/v0Uf0s13lucAmA6uk9YOAYR.wXmMdLb/3PNvaCpFi.puLqa',
 'admin');

-- ─── SEED: SAMPLE LISTINGS ──────────────────────────────────
INSERT INTO listings (title, slug, category, description, short_desc, location, lat, lng, features, contact_info, is_featured, price_range) VALUES
('Hotel Dukagjini',
 'hotel-dukagjini',
 'hotels',
 'A landmark four-star hotel in the heart of Peja, blending modern comfort with warm Kosovar hospitality. Each room offers mountain views and premium amenities.',
 'Four-star comfort in the heart of Peja.',
 'Sheshi i Qytetit, Pejë',
 42.6600, 20.2889,
 '["Free WiFi","Parking","Restaurant","Bar","24h Reception","Air Conditioning","Mountain View"]',
 '{"phone":"+383 39 432 800","email":"info@hoteldukagjini.com","website":"https://hoteldukagjini.com"}',
 1, 3),

('Restaurant Drini',
 'restaurant-drini',
 'restaurants',
 'Authentic Albanian and Kosovar cuisine served beside the crystal-clear Drini river. Famous for fresh trout, traditional qebapa, and home-made bread.',
 'Riverside dining with authentic Kosovar flavors.',
 'Rugova, Pejë',
 42.6712, 20.2534,
 '["River View","Outdoor Seating","Live Music Weekends","Vegetarian Options","Local Wine"]',
 '{"phone":"+383 44 123 456","instagram":"restaurant_drini"}',
 1, 2),

('Rugova Adventures',
 'rugova-adventures',
 'activities',
 'Your gateway to the Rugova Gorge. We offer guided hiking, via ferrata, zip-lining, mountain biking, and kayaking in one of the Balkans'' most dramatic landscapes.',
 'Outdoor adventures in the Rugova Gorge.',
 'Rugova Canyon, Pejë',
 42.6850, 20.2000,
 '["Guided Tours","Equipment Rental","All Skill Levels","Group Discounts","Photo Tours"]',
 '{"phone":"+383 44 987 654","email":"info@rugovaadventures.com","website":"https://rugovaadventures.com","instagram":"rugova_adventures"}',
 1, 2),

('Villa Bjeshkët',
 'villa-bjeshket',
 'villas',
 'Luxury stone villa nestled in the Rugova mountains. Sleeps up to 12 guests with a fully equipped kitchen, wood-burning fireplace, and panoramic terrace.',
 'Luxury mountain villa with panoramic views.',
 'Rugova Valley, Pejë',
 42.6920, 20.1870,
 '["Mountain View","Fireplace","Full Kitchen","BBQ","Hot Tub","Parking","Pet Friendly"]',
 '{"phone":"+383 49 555 777","email":"book@villabjesket.com"}',
 1, 4),

('Café Tirana',
 'cafe-tirana',
 'cafes',
 'Specialty coffee roastery and social hub in central Peja. Third-wave coffee, house-made pastries, and a curated selection of Kosovar craft beers.',
 'Specialty coffee and craft beer in central Peja.',
 'Rr. UCK, Pejë',
 42.6598, 20.2901,
 '["Specialty Coffee","Free WiFi","Outdoor Terrace","Vegan Options","Co-working Friendly"]',
 '{"phone":"+383 44 222 333","instagram":"cafe_tirana_peja"}',
 0, 1);

-- ─── SEED: IMAGES ───────────────────────────────────────────
INSERT INTO images (listing_id, url, alt_text, sort_order, is_cover) VALUES
(1, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200', 'Hotel Dukagjini exterior', 0, 1),
(1, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200', 'Hotel room', 1, 0),
(2, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200', 'Restaurant Drini riverside', 0, 1),
(2, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200', 'Traditional food', 1, 0),
(3, 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200', 'Rugova hiking', 0, 1),
(3, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200', 'Mountain canyon', 1, 0),
(4, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200', 'Mountain villa exterior', 0, 1),
(5, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200', 'Coffee specialty', 0, 1);

-- ─── SEED: OFFERS ───────────────────────────────────────────
INSERT INTO offers (listing_id, title, description, discount, valid_until, image) VALUES
(1, 'Summer Weekend Package', 'Stay 2 nights, get 3rd free. Includes breakfast and spa access.', '33% OFF', '2025-09-30',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'),
(2, 'Trout Friday Special', 'Every Friday — fresh trout meal + local wine for two at special price.', 'Save €8', '2025-12-31',
 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'),
(3, 'Half-Day Gorge Trek', 'Guided 4-hour canyon trek with equipment included. Groups of 4+.', '20% OFF', '2025-10-31',
 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800');
