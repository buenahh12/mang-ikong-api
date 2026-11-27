-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 27, 2026 at 07:49 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mang_ikong_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `item_id` int(11) NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(50) NOT NULL,
  `is_available` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`item_id`, `item_name`, `description`, `price`, `category`, `is_available`) VALUES
(1, 'Chicken Adobo', 'Chicken braised in soy sauce, vinegar and garlic', 120.00, 'Ulam', 1),
(2, 'Pork Sinigang', 'Sour tamarind soup with pork and vegetables', 150.00, 'Ulam', 1),
(3, 'Lechon Kawali', 'Crispy deep-fried pork belly', 160.00, 'Ulam', 1),
(4, 'Pancit Canton', 'Stir-fried egg noodles with vegetables', 110.00, 'Noodles', 1),
(5, 'Plain Rice', 'One cup of steamed rice', 20.00, 'Rice', 1),
(6, 'Garlic Rice', 'One cup of garlic fried rice', 30.00, 'Rice', 1),
(7, 'Halo-Halo', 'Shaved ice with sweet beans, fruits and leche flan', 90.00, 'Dessert', 1),
(8, 'Sago’t Gulaman', 'Brown sugar drink with tapioca pearls and jelly', 35.00, 'Drinks', 1);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `order_date` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `order_status` enum('received','processing','completed','cancelled') NOT NULL DEFAULT 'received',
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `order_date`, `total_amount`, `order_status`, `user_id`) VALUES
(2, '2026-11-27 14:13:47.883148', 280.00, 'processing', 2);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `order_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `quantity`, `subtotal`, `order_id`, `item_id`) VALUES
(3, 2, 240.00, 2, 1),
(4, 2, 40.00, 2, 5);

-- --------------------------------------------------------

--
-- Table structure for table `table_reservations`
--

CREATE TABLE `table_reservations` (
  `reservation_id` int(11) NOT NULL,
  `table_number` int(11) NOT NULL,
  `reservation_date` datetime NOT NULL,
  `party_size` int(11) NOT NULL,
  `status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `table_reservations`
--

INSERT INTO `table_reservations` (`reservation_id`, `table_number`, `reservation_date`, `party_size`, `status`, `user_id`) VALUES
(5, 3, '2026-12-24 18:00:00', 6, 'confirmed', 2);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('customer','admin') NOT NULL DEFAULT 'customer',
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `full_name`, `email`, `password_hash`, `role`, `created_at`) VALUES
(2, 'Juan P. Dela Cruz', 'juan@example.com', '$2b$10$51ghotF2ep5u5q1/BQfF4uN2Xy3Z7RgZvj1I438dCbpGJJgJc.T3q', 'customer', '2026-11-27 13:44:57.390782'),
(3, 'Mang Ikong Admin', 'admin@mangikong.com', '$2b$10$7iA9YWM6y3eeDTf2UWBcf.JgXNKn4ZEjXA2pHHHMHFJHYM88Havfe', 'admin', '2026-11-27 13:53:18.186970');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`item_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `FK_a922b820eeef29ac1c6800e826a` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `FK_145532db85752b29c57d2b7b1f1` (`order_id`),
  ADD KEY `FK_de591fd3dc04191ab115c03eab1` (`item_id`);

--
-- Indexes for table `table_reservations`
--
ALTER TABLE `table_reservations`
  ADD PRIMARY KEY (`reservation_id`),
  ADD KEY `FK_0c656fffcec6fdf1bdcddb79b73` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `table_reservations`
--
ALTER TABLE `table_reservations`
  MODIFY `reservation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `FK_a922b820eeef29ac1c6800e826a` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `FK_145532db85752b29c57d2b7b1f1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_de591fd3dc04191ab115c03eab1` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`item_id`) ON UPDATE NO ACTION;

--
-- Constraints for table `table_reservations`
--
ALTER TABLE `table_reservations`
  ADD CONSTRAINT `FK_0c656fffcec6fdf1bdcddb79b73` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
