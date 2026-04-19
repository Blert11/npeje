-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 19, 2026 at 02:46 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `peja_tourism`
--

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(10) UNSIGNED NOT NULL,
  `listing_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(180) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `message` text NOT NULL,
  `contact_type` enum('general','listing_inquiry','join_request') NOT NULL DEFAULT 'general',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `images`
--

CREATE TABLE `images` (
  `id` int(10) UNSIGNED NOT NULL,
  `listing_id` int(10) UNSIGNED NOT NULL,
  `url` varchar(500) NOT NULL,
  `alt_text` varchar(200) DEFAULT NULL,
  `sort_order` smallint(6) NOT NULL DEFAULT 0,
  `is_cover` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `images`
--

INSERT INTO `images` (`id`, `listing_id`, `url`, `alt_text`, `sort_order`, `is_cover`, `created_at`) VALUES
(1, 1, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200', 'Hotel Dukagjini exterior', 0, 1, '2026-04-16 19:22:35'),
(2, 1, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200', 'Hotel room', 1, 0, '2026-04-16 19:22:35'),
(3, 2, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200', 'Restaurant Drini riverside', 0, 1, '2026-04-16 19:22:35'),
(4, 2, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200', 'Traditional food', 1, 0, '2026-04-16 19:22:35'),
(5, 3, 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200', 'Rugova hiking', 0, 1, '2026-04-16 19:22:35'),
(6, 3, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200', 'Mountain canyon', 1, 0, '2026-04-16 19:22:35'),
(7, 4, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200', 'Mountain villa exterior', 0, 1, '2026-04-16 19:22:35'),
(8, 5, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200', 'Coffee specialty', 0, 1, '2026-04-16 19:22:35'),
(9, 10, '/uploads/1-1776553032830-136577251.jpeg', NULL, 0, 1, '2026-04-19 00:57:42'),
(10, 10, '/uploads/4650-1776553042233-864211361.jpg', NULL, 1, 0, '2026-04-19 00:57:42'),
(11, 10, '/uploads/andrewtate-4819aa2ffe8a7ba8b601c447b39b5-1776553049174-970934633.webp', NULL, 2, 0, '2026-04-19 00:57:42');

-- --------------------------------------------------------

--
-- Table structure for table `listings`
--

CREATE TABLE `listings` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `category` enum('hotels','restaurants','fast_food','cafes','villas','activities','nightlife','transport','shops') NOT NULL,
  `description` text NOT NULL,
  `short_desc` varchar(300) DEFAULT NULL,
  `location` varchar(300) NOT NULL,
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of feature strings' CHECK (json_valid(`features`)),
  `contact_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '{phone, email, website, instagram, facebook}' CHECK (json_valid(`contact_info`)),
  `opening_hours` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`opening_hours`)),
  `menu_url` varchar(500) DEFAULT NULL,
  `price_range` tinyint(4) DEFAULT NULL COMMENT '1=budget 2=mid 3=upscale 4=luxury',
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `owner_id` int(10) UNSIGNED DEFAULT NULL COMMENT 'linked business user',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `listings`
--

INSERT INTO `listings` (`id`, `title`, `slug`, `category`, `description`, `short_desc`, `location`, `lat`, `lng`, `features`, `contact_info`, `opening_hours`, `menu_url`, `price_range`, `is_featured`, `is_active`, `owner_id`, `created_at`, `updated_at`) VALUES
(1, 'Hotel Dukagjini', 'hotel-dukagjini', 'hotels', 'A landmark four-star hotel in the heart of Peja, blending modern comfort with warm Kosovar hospitality. Each room offers mountain views and premium amenities.', 'Four-star comfort in the heart of Peja.', 'Sheshi i Qytetit, Pejë', 42.6600000, 20.2889000, '[\"Free WiFi\",\"Parking\",\"Restaurant\",\"Bar\",\"24h Reception\",\"Air Conditioning\",\"Mountain View\"]', '{\"phone\":\"+383 39 432 800\",\"email\":\"info@hoteldukagjini.com\",\"website\":\"https://hoteldukagjini.com\"}', NULL, NULL, 3, 1, 1, NULL, '2026-04-16 19:22:35', '2026-04-16 19:22:35'),
(2, 'Restaurant Drini', 'restaurant-drini', 'restaurants', 'Authentic Albanian and Kosovar cuisine served beside the crystal-clear Drini river. Famous for fresh trout, traditional qebapa, and home-made bread.', 'Riverside dining with authentic Kosovar flavors.', 'Rugova, Pejë', 42.6712000, 20.2534000, '[\"River View\",\"Outdoor Seating\",\"Live Music Weekends\",\"Vegetarian Options\",\"Local Wine\"]', '{\"phone\":\"+383 44 123 456\",\"instagram\":\"restaurant_drini\"}', '{\"mon\":[\"12:00\",\"23:00\"],\"tue\":[\"12:00\",\"23:00\"],\"wed\":[\"12:00\",\"23:00\"],\"thu\":[\"12:00\",\"23:00\"],\"fri\":[\"12:00\",\"00:00\"],\"sat\":[\"12:00\",\"00:00\"],\"sun\":[\"12:00\",\"23:00\"]}', NULL, 2, 1, 1, NULL, '2026-04-16 19:22:35', '2026-04-17 01:35:36'),
(3, 'Rugova Adventures', 'rugova-adventures', 'activities', 'Your gateway to the Rugova Gorge. We offer guided hiking, via ferrata, zip-lining, mountain biking, and kayaking in one of the Balkans\' most dramatic landscapes.', 'Outdoor adventures in the Rugova Gorge.', 'Rugova Canyon, Pejë', 42.6850000, 20.2000000, '[\"Guided Tours\",\"Equipment Rental\",\"All Skill Levels\",\"Group Discounts\",\"Photo Tours\"]', '{\"phone\":\"+383 44 987 654\",\"email\":\"info@rugovaadventures.com\",\"website\":\"https://rugovaadventures.com\",\"instagram\":\"rugova_adventures\"}', NULL, NULL, 2, 1, 1, NULL, '2026-04-16 19:22:35', '2026-04-16 19:22:35'),
(4, 'Villa Bjeshkët', 'villa-bjeshket', 'villas', 'Luxury stone villa nestled in the Rugova mountains. Sleeps up to 12 guests with a fully equipped kitchen, wood-burning fireplace, and panoramic terrace.', 'Luxury mountain villa with panoramic views.', 'Rugova Valley, Pejë', 42.6920000, 20.1870000, '[\"Mountain View\",\"Fireplace\",\"Full Kitchen\",\"BBQ\",\"Hot Tub\",\"Parking\",\"Pet Friendly\"]', '{\"phone\":\"+383 49 555 777\",\"email\":\"book@villabjesket.com\"}', NULL, NULL, 4, 1, 1, NULL, '2026-04-16 19:22:35', '2026-04-16 19:22:35'),
(5, 'Café Tirana', 'cafe-tirana', 'cafes', 'Specialty coffee roastery and social hub in central Peja. Third-wave coffee, house-made pastries, and a curated selection of Kosovar craft beers.', 'Specialty coffee and craft beer in central Peja.', 'Rr. UCK, Pejë', 42.6598000, 20.2901000, '[\"Specialty Coffee\",\"Free WiFi\",\"Outdoor Terrace\",\"Vegan Options\",\"Co-working Friendly\"]', '{\"phone\":\"+383 44 222 333\",\"instagram\":\"cafe_tirana_peja\"}', '{\"mon\":[\"07:00\",\"23:00\"],\"tue\":[\"07:00\",\"23:00\"],\"wed\":[\"07:00\",\"23:00\"],\"thu\":[\"07:00\",\"23:00\"],\"fri\":[\"07:00\",\"00:00\"],\"sat\":[\"07:00\",\"00:00\"],\"sun\":[\"07:00\",\"23:00\"]}', NULL, 1, 0, 1, NULL, '2026-04-16 19:22:35', '2026-04-17 01:35:36'),
(6, 'Burger Box Peja', 'burger-box-peja', 'fast_food', 'Quick gourmet burgers, hand-cut fries, and milkshakes in the heart of Peja. Open late on weekends.', 'Late-night burgers and shakes.', 'Rr. Mbretëresha Teutë, Pejë', 42.6595000, 20.2920000, '[\"Takeaway\",\"Delivery\",\"Late Night\",\"Vegan Options\"]', '{\"phone\":\"+383 44 111 222\",\"instagram\":\"burgerbox_peja\"}', '{\"mon\":[\"10:00\",\"23:00\"],\"tue\":[\"10:00\",\"23:00\"],\"wed\":[\"10:00\",\"23:00\"],\"thu\":[\"10:00\",\"23:00\"],\"fri\":[\"10:00\",\"02:00\"],\"sat\":[\"10:00\",\"02:00\"],\"sun\":[\"12:00\",\"23:00\"]}', NULL, 1, 1, 1, NULL, '2026-04-17 01:35:36', '2026-04-17 01:35:36'),
(7, 'Pizza Express Peja', 'pizza-express-peja', 'fast_food', 'Wood-fired pizza ready in 8 minutes. Family-owned since 2015 with the best quattro stagioni in town.', 'Wood-fired pizza in 8 minutes.', 'Rr. UCK 45, Pejë', 42.6608000, 20.2887000, '[\"Takeaway\",\"Delivery\",\"Family Friendly\",\"Wood-fired Oven\"]', '{\"phone\":\"+383 44 333 444\"}', '{\"mon\":[\"11:00\",\"22:00\"],\"tue\":[\"11:00\",\"22:00\"],\"wed\":[\"11:00\",\"22:00\"],\"thu\":[\"11:00\",\"22:00\"],\"fri\":[\"11:00\",\"23:30\"],\"sat\":[\"11:00\",\"23:30\"],\"sun\":[\"12:00\",\"22:00\"]}', NULL, 1, 0, 1, NULL, '2026-04-17 01:35:36', '2026-04-17 01:35:36'),
(8, 'Kebap House', 'kebap-house', 'fast_food', 'Authentic Turkish-Albanian kebaps, döner, and qebapa. Voted best in Peja three years running.', 'Best döner in Peja.', 'Sheshi i Qytetit, Pejë', 42.6601000, 20.2895000, '[\"Takeaway\",\"Halal\",\"Vegetarian Options\"]', '{\"phone\":\"+383 49 555 888\",\"instagram\":\"kebap_house_peja\"}', '{\"mon\":[\"09:00\",\"23:00\"],\"tue\":[\"09:00\",\"23:00\"],\"wed\":[\"09:00\",\"23:00\"],\"thu\":[\"09:00\",\"23:00\"],\"fri\":[\"09:00\",\"00:00\"],\"sat\":[\"09:00\",\"00:00\"],\"sun\":[\"10:00\",\"23:00\"]}', NULL, 1, 1, 1, NULL, '2026-04-17 01:35:36', '2026-04-17 01:35:36'),
(9, 'test', 'test-1776382895768', 'cafes', 'df df df dfd sdfsdf ', 'tstffsd ', 'e3wed', NULL, NULL, '[\"df df\",\"df s\",\"f\",\"sdf\",\"df\",\"df\",\"fd s\"]', '{\"phone\":\"32123\",\"email\":\"fdsfsdf@gmail.com\",\"website\":\"fsdffsd\",\"instagram\":\"dsfsdf\"}', NULL, 'fsdfsdf.com', 1, 1, 1, NULL, '2026-04-17 01:41:35', '2026-04-17 01:41:35'),
(10, 'Testteet', 'testteet-1776553062786', 'restaurants', 'testt', 'tesdt', 'tetetet', NULL, NULL, '[\"hgff\"]', '{\"phone\":\"fghf\",\"email\":\"hf@gmail.com\",\"website\":\"hfdfg#hmail.com\",\"instagram\":\"sdfsdfsf\"}', NULL, NULL, NULL, 1, 1, NULL, '2026-04-19 00:57:42', '2026-04-19 00:57:42');

-- --------------------------------------------------------

--
-- Table structure for table `listing_clicks`
--

CREATE TABLE `listing_clicks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `listing_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `button_type` enum('call','directions','menu','website','instagram','facebook','share') NOT NULL,
  `clicked_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `listing_clicks`
--

INSERT INTO `listing_clicks` (`id`, `listing_id`, `user_id`, `button_type`, `clicked_at`) VALUES
(1, 7, NULL, 'directions', '2026-04-17 01:39:29'),
(2, 9, 1, 'menu', '2026-04-17 01:41:54'),
(3, 3, 1, 'instagram', '2026-04-17 01:47:54'),
(4, 1, NULL, 'share', '2026-04-18 00:09:03'),
(5, 6, NULL, 'menu', '2026-04-18 00:09:10'),
(6, 6, NULL, 'menu', '2026-04-18 00:11:22'),
(7, 2, NULL, 'menu', '2026-04-18 00:11:45'),
(8, 2, NULL, 'menu', '2026-04-18 00:24:33'),
(9, 2, NULL, 'menu', '2026-04-18 00:25:23'),
(10, 1, 1, 'share', '2026-04-19 00:34:20'),
(11, 4, 1, 'share', '2026-04-19 00:34:23'),
(12, 6, 1, 'menu', '2026-04-19 00:38:41'),
(13, 6, 1, 'menu', '2026-04-19 00:38:47'),
(14, 2, 1, 'instagram', '2026-04-19 00:39:30'),
(15, 2, 1, 'menu', '2026-04-19 00:39:32'),
(16, 9, 1, 'menu', '2026-04-19 00:51:50'),
(17, 10, 1, 'menu', '2026-04-19 00:57:57'),
(18, 10, 1, 'menu', '2026-04-19 00:58:41'),
(19, 10, 1, 'menu', '2026-04-19 00:59:16'),
(20, 10, 1, 'menu', '2026-04-19 00:59:54'),
(21, 10, 1, 'directions', '2026-04-19 01:01:14');

-- --------------------------------------------------------

--
-- Table structure for table `listing_views`
--

CREATE TABLE `listing_views` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `listing_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `ip_hash` varchar(64) DEFAULT NULL COMMENT 'SHA-256 of IP for unique visitor counting',
  `user_agent` varchar(500) DEFAULT NULL,
  `viewed_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `listing_views`
--

INSERT INTO `listing_views` (`id`, `listing_id`, `user_id`, `ip_hash`, `user_agent`, `viewed_at`) VALUES
(1, 2, NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-16 20:11:15'),
(2, 2, NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-16 20:11:16'),
(3, 7, NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-17 01:39:14'),
(4, 7, NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-17 01:39:14'),
(5, 9, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-17 01:41:48'),
(6, 9, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-17 01:41:48'),
(7, 3, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-17 01:47:27'),
(8, 3, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-17 01:47:27'),
(9, 6, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-17 01:51:09'),
(10, 6, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-17 01:51:09'),
(11, 1, NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-18 00:09:03'),
(12, 1, NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-18 00:09:03'),
(13, 6, NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-18 00:09:08'),
(14, 6, NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-18 00:09:08'),
(15, 2, NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-18 00:11:34'),
(16, 2, NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-18 00:11:34'),
(17, 1, NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-18 00:20:42'),
(18, 1, NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-18 00:20:42'),
(19, 2, NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-18 00:24:32'),
(20, 2, NULL, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-18 00:24:33'),
(21, 3, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-18 00:35:27'),
(22, 3, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-18 00:35:28'),
(23, 1, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:34:21'),
(24, 1, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:34:21'),
(25, 4, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:34:23'),
(26, 4, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:34:24'),
(27, 6, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:38:31'),
(28, 6, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:38:32'),
(29, 2, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:39:02'),
(30, 2, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:39:03'),
(31, 2, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:39:14'),
(32, 6, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:39:14'),
(33, 2, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:39:14'),
(34, 6, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:39:15'),
(35, 1, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:39:16'),
(36, 1, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:39:16'),
(37, 9, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:39:17'),
(38, 9, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:39:17'),
(39, 3, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:39:20'),
(40, 3, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:39:20'),
(41, 4, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:39:20'),
(42, 4, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:39:21'),
(43, 6, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:48:45'),
(44, 6, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:48:46'),
(45, 10, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:57:47'),
(46, 10, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:57:48'),
(47, 10, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:58:40'),
(48, 10, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:58:41'),
(49, 10, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:59:15'),
(50, 10, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:59:16'),
(51, 10, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:59:51'),
(52, 10, 1, '12ca17b49af2289436f303e0166030a21e525d266e209267433801a8fd4071a0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-19 00:59:52');

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `listing_id` int(10) UNSIGNED NOT NULL,
  `section` varchar(100) DEFAULT NULL COMMENT 'e.g. Starters, Mains, Drinks',
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(8,2) NOT NULL,
  `currency` varchar(5) NOT NULL DEFAULT '€',
  `image` varchar(500) DEFAULT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` smallint(6) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`id`, `listing_id`, `section`, `name`, `description`, `price`, `currency`, `image`, `is_available`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 2, 'Starters', 'Flija', 'Traditional Kosovar layered pancake with cream and honey.', 4.50, '€', 'https://images.unsplash.com/photo-1565299543923-37dd37887442?w=600', 1, 1, '2026-04-18 00:00:34', '2026-04-18 00:00:34'),
(2, 2, 'Starters', 'Ajvar & Bread', 'House-made pepper relish with fresh bread.', 3.50, '€', 'https://images.unsplash.com/photo-1604908554025-dc69cd3a0042?w=600', 1, 2, '2026-04-18 00:00:34', '2026-04-18 00:00:34'),
(3, 2, 'Mains', 'Grilled Trout', 'Fresh Drini river trout with lemon and herbs.', 12.00, '€', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600', 1, 3, '2026-04-18 00:00:34', '2026-04-18 00:00:34'),
(4, 2, 'Mains', 'Tavë Kosi', 'Lamb baked in yogurt sauce — a national favorite.', 10.50, '€', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', 1, 4, '2026-04-18 00:00:34', '2026-04-18 00:00:34'),
(5, 6, 'Burgers', 'Classic Burger', 'Beef patty, cheese, lettuce, tomato, house sauce.', 5.50, '€', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600', 1, 1, '2026-04-18 00:00:34', '2026-04-18 00:00:34'),
(6, 6, 'Burgers', 'Double Cheese', 'Two beef patties, double cheese, bacon.', 7.50, '€', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600', 1, 2, '2026-04-18 00:00:34', '2026-04-18 00:00:34'),
(7, 6, 'Sides', 'Hand-cut Fries', 'Crispy fries with sea salt.', 2.50, '€', 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600', 1, 3, '2026-04-18 00:00:34', '2026-04-18 00:00:34'),
(8, 6, 'Drinks', 'Vanilla Shake', 'Thick house-made vanilla shake.', 3.50, '€', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600', 1, 4, '2026-04-18 00:00:34', '2026-04-18 00:00:34'),
(9, 8, 'Kebaps', 'Döner Sandwich', 'Rotisserie meat, fresh veg, yogurt sauce in flatbread.', 4.00, '€', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600', 1, 1, '2026-04-18 00:00:34', '2026-04-18 00:00:34'),
(10, 8, 'Kebaps', 'Qebapa (10pc)', '10 pieces of grilled minced meat with onion and pita.', 6.00, '€', 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600', 1, 2, '2026-04-18 00:00:34', '2026-04-18 00:00:34'),
(11, 10, 'Logo', 'Logo', 'gsg', 41.00, '€', '/uploads/kv-logo-1776553098723-286396077.png', 1, 0, '2026-04-19 00:58:26', '2026-04-19 00:58:26'),
(12, 10, 'Logo', 'logo', 'fsfsf', 45.00, '€', '/uploads/per-ne---logo-1-1776553143556-98678667.png', 1, 0, '2026-04-19 00:59:11', '2026-04-19 00:59:11'),
(13, 10, 'tat', 'tat', 'teet', 12.00, '€', '/uploads/whatsapp-image-2024-12-15-at-00-42-49-36-1776553182046-528878670.jpg', 1, 0, '2026-04-19 00:59:48', '2026-04-19 00:59:48');

-- --------------------------------------------------------

--
-- Table structure for table `offers`
--

CREATE TABLE `offers` (
  `id` int(10) UNSIGNED NOT NULL,
  `listing_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `action_type` enum('call','whatsapp','listing','custom_url') NOT NULL DEFAULT 'listing',
  `action_value` varchar(500) DEFAULT NULL COMMENT 'phone number for call/whatsapp, URL for custom_url, ignored for listing',
  `discount` varchar(50) DEFAULT NULL COMMENT 'e.g. "20% off" or "Free dessert"',
  `valid_until` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `offers`
--

INSERT INTO `offers` (`id`, `listing_id`, `title`, `description`, `image`, `action_type`, `action_value`, `discount`, `valid_until`, `is_active`, `created_at`) VALUES
(1, 1, 'Summer Weekend Package', 'Stay 2 nights, get 3rd free. Includes breakfast and spa access.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'listing', NULL, '33% OFF', '2025-09-30', 1, '2026-04-16 19:22:35'),
(2, 2, 'Trout Friday Special', 'Every Friday — fresh trout meal + local wine for two at special price.', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', 'listing', NULL, 'Save €8', '2025-12-31', 1, '2026-04-16 19:22:35'),
(3, 3, 'Half-Day Gorge Trek', 'Guided 4-hour canyon trek with equipment included. Groups of 4+.', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', 'listing', NULL, '20% OFF', '2025-10-31', 1, '2026-04-16 19:22:35'),
(4, 1, 'ghcf', NULL, NULL, 'listing', NULL, '50', NULL, 1, '2026-04-17 00:25:10'),
(5, 4, 'testtt', NULL, NULL, 'listing', NULL, '500', '2222-12-22', 1, '2026-04-17 01:40:46');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `listing_id` int(10) UNSIGNED NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `listing_id`, `rating`, `comment`, `is_visible`, `created_at`) VALUES
(1, 1, 10, 5, 'trdt', 1, '2026-04-19 01:01:25');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `listing_id` int(10) UNSIGNED DEFAULT NULL COMMENT 'current listing being viewed',
  `ip_hash` varchar(64) DEFAULT NULL,
  `started_at` datetime NOT NULL DEFAULT current_timestamp(),
  `last_active_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `listing_id`, `ip_hash`, `started_at`, `last_active_at`) VALUES
('4a3db393-875f-4d3f-85f4-f4a21a2c8e59', NULL, 7, NULL, '2026-04-17 01:39:14', '2026-04-17 01:39:44'),
('7edc64bf-c103-4897-9312-5c862614c3cf', NULL, 2, NULL, '2026-04-16 20:11:15', '2026-04-16 20:41:18'),
('8d91a460-3024-4c6a-b6e3-5f3231b56033', 1, 6, NULL, '2026-04-17 01:51:09', '2026-04-17 02:19:18'),
('deff62ca-7686-4c24-9920-fb9cf11f68d3', 1, 3, NULL, '2026-04-17 01:47:27', '2026-04-17 01:50:28'),
('eb97926f-895c-413a-8054-4f65c45119ce', 1, 9, NULL, '2026-04-17 01:41:48', '2026-04-17 01:42:18');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(180) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin','business') NOT NULL DEFAULT 'user',
  `avatar` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatar`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@pejatourism.com', '$2b$12$jXuTp/v0Uf0s13lucAmA6uk9YOAYR.wXmMdLb/3PNvaCpFi.puLqa', 'admin', NULL, 1, '2026-04-16 19:22:35', '2026-04-16 19:22:35');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_listing` (`listing_id`),
  ADD KEY `idx_type` (`contact_type`);

--
-- Indexes for table `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_listing` (`listing_id`);

--
-- Indexes for table `listings`
--
ALTER TABLE `listings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_featured` (`is_featured`),
  ADD KEY `idx_active` (`is_active`);
ALTER TABLE `listings` ADD FULLTEXT KEY `idx_search` (`title`,`description`);

--
-- Indexes for table `listing_clicks`
--
ALTER TABLE `listing_clicks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_listing_date` (`listing_id`,`clicked_at`),
  ADD KEY `idx_button` (`button_type`);

--
-- Indexes for table `listing_views`
--
ALTER TABLE `listing_views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_listing_date` (`listing_id`,`viewed_at`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_listing` (`listing_id`),
  ADD KEY `idx_section` (`listing_id`,`section`);

--
-- Indexes for table `offers`
--
ALTER TABLE `offers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_listing` (`listing_id`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_listing` (`user_id`,`listing_id`),
  ADD KEY `idx_listing` (`listing_id`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_listing` (`listing_id`),
  ADD KEY `idx_last_active` (`last_active_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `images`
--
ALTER TABLE `images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `listings`
--
ALTER TABLE `listings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `listing_clicks`
--
ALTER TABLE `listing_clicks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `listing_views`
--
ALTER TABLE `listing_views`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `offers`
--
ALTER TABLE `offers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `contacts_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `contacts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `images`
--
ALTER TABLE `images`
  ADD CONSTRAINT `images_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `listings`
--
ALTER TABLE `listings`
  ADD CONSTRAINT `listings_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `listing_clicks`
--
ALTER TABLE `listing_clicks`
  ADD CONSTRAINT `listing_clicks_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `listing_views`
--
ALTER TABLE `listing_views`
  ADD CONSTRAINT `listing_views_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `offers`
--
ALTER TABLE `offers`
  ADD CONSTRAINT `offers_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
