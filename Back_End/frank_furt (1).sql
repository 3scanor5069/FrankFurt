-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-12-2025 a las 11:03:10
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `frank_furt`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id`, `nombre`, `descripcion`, `activo`, `fecha_creacion`) VALUES
(1, 'Hamburguesas', 'Clásicas y gourmet', 1, '2025-08-21 15:18:35'),
(2, 'Bebidas', 'Frías y calientes', 1, '2025-08-21 15:18:35'),
(3, 'Papas', 'Papas fritas y acompañamientos', 1, '2025-08-21 15:18:35'),
(4, 'Postres', 'Dulces y postres', 1, '2025-08-21 15:18:35'),
(6, 'Acompañamientos', 'Papas, aros, ensaladas', 1, '2025-11-11 05:16:22');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleado_info`
--

CREATE TABLE `empleado_info` (
  `idEmpleado` int(11) NOT NULL COMMENT 'FK a usuario.idUsuario',
  `cargo` varchar(50) DEFAULT NULL,
  `salario` decimal(10,2) DEFAULT 0.00,
  `idSede` int(11) NOT NULL,
  `fecha_ingreso` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insumo`
--

CREATE TABLE `insumo` (
  `idInsumo` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `unidad_medida` varchar(20) NOT NULL COMMENT 'Ej: unidad, gramo, mililitro, litro, kg',
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `insumo`
--

INSERT INTO `insumo` (`idInsumo`, `nombre`, `unidad_medida`, `activo`, `fecha_creacion`) VALUES
(1, 'Pan de Hamburguesa', 'unidad', 1, '2025-09-28 02:35:27'),
(2, 'Carne de Res 150g', 'unidad', 1, '2025-09-28 02:35:27'),
(3, 'Lechuga', 'gramo', 1, '2025-09-28 02:35:27'),
(4, 'Tomate', 'unidad', 1, '2025-09-28 02:35:27'),
(5, 'Salsa BBQ', 'mililitro', 1, '2025-09-28 02:35:27'),
(6, 'Papas para freir', 'kg', 1, '2025-09-28 02:35:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insumos_config`
--

CREATE TABLE `insumos_config` (
  `idInsumo` int(11) NOT NULL,
  `nombre_insumo` varchar(255) NOT NULL,
  `unidad_medida` enum('paquete','kg','litro','unidades','gramos','ml') NOT NULL,
  `stock_minimo_insumo` decimal(10,2) NOT NULL DEFAULT 10.00,
  `fecha_vencimiento` date DEFAULT NULL COMMENT 'Fecha de vencimiento del insumo',
  `idSede` int(11) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `insumos_config`
--

INSERT INTO `insumos_config` (`idInsumo`, `nombre_insumo`, `unidad_medida`, `stock_minimo_insumo`, `fecha_vencimiento`, `idSede`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Paquete de Pan (x24)', 'paquete', 20.00, '2025-11-30', 1, '2025-11-03 22:31:03', '2025-11-25 14:37:49'),
(2, 'Paquete de Salchichas (x12)', 'paquete', 15.00, '2025-12-05', 1, '2025-11-03 22:31:03', '2025-11-25 14:37:49'),
(3, 'Queso Cheddar', 'kg', 5.00, '2025-11-28', 1, '2025-11-03 22:31:03', '2025-11-25 14:37:49'),
(4, 'Lechuga', 'kg', 3.00, '2026-01-09', 1, '2025-11-03 22:31:03', '2025-11-25 14:37:49'),
(5, 'Tomate', 'kg', 4.00, '2026-01-24', 1, '2025-11-03 22:31:03', '2025-11-25 14:37:49'),
(6, 'Cebolla', 'kg', 3.00, '2025-12-25', 1, '2025-11-03 22:31:03', '2025-11-25 14:37:49'),
(7, 'Papas Fritas Congeladas', 'kg', 20.00, '2026-02-23', 1, '2025-11-03 22:31:03', '2025-11-25 14:37:49'),
(8, 'Salsa de Tomate Ketchup', 'litro', 5.00, NULL, 1, '2025-11-03 22:31:03', '2025-11-03 22:31:03'),
(9, 'Mostaza', 'litro', 3.00, NULL, 1, '2025-11-03 22:31:03', '2025-11-03 22:31:03'),
(10, 'Mayonesa', 'litro', 4.00, NULL, 1, '2025-11-03 22:31:03', '2025-11-03 22:31:03'),
(11, 'Aceite para freír', 'litro', 10.00, NULL, 1, '2025-11-03 22:31:03', '2025-11-03 22:31:03'),
(12, 'Servilletas', 'paquete', 10.00, NULL, 1, '2025-11-03 22:31:03', '2025-11-03 22:31:03'),
(13, 'Vasos desechables', 'paquete', 15.00, NULL, 1, '2025-11-03 22:31:03', '2025-11-03 22:31:03'),
(14, 'Platos desechables', 'paquete', 15.00, NULL, 1, '2025-11-03 22:31:03', '2025-11-03 22:31:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `idInventario` int(11) NOT NULL,
  `idInsumo` int(11) NOT NULL,
  `idSede` int(11) NOT NULL,
  `stockDisponible` int(11) DEFAULT 0,
  `stock_minimo` int(11) DEFAULT 10,
  `stock_maximo` int(11) DEFAULT 1000,
  `fechaActualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `idProducto` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`idInventario`, `idInsumo`, `idSede`, `stockDisponible`, `stock_minimo`, `stock_maximo`, `fechaActualizacion`, `idProducto`) VALUES
(1, 1, 1, 48, 10, 1000, '2025-12-09 01:13:11', 2),
(2, 2, 1, 60, 10, 1000, '2025-12-08 20:05:43', 4),
(3, 3, 1, 5000, 10, 1000, '2025-10-03 00:53:04', 5),
(4, 6, 1, 25, 10, 1000, '2025-12-08 20:05:43', 7);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_general`
--

CREATE TABLE `inventario_general` (
  `idMovimiento` int(11) NOT NULL,
  `nombre_insumo` varchar(255) NOT NULL,
  `cantidad_movida` decimal(10,2) NOT NULL,
  `tipo_movimiento` enum('entrada','salida') NOT NULL,
  `motivo_detalle` enum('compra','venta/consumo','merma/desperdicio','ajuste_conteo','desperdicio') NOT NULL COMMENT 'Motivo detallado del movimiento',
  `observaciones` text DEFAULT NULL,
  `fecha_movimiento` datetime NOT NULL DEFAULT current_timestamp(),
  `idSede` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `inventario_general`
--

INSERT INTO `inventario_general` (`idMovimiento`, `nombre_insumo`, `cantidad_movida`, `tipo_movimiento`, `motivo_detalle`, `observaciones`, `fecha_movimiento`, `idSede`) VALUES
(1, 'Paquete de Pan (x24)', 50.00, 'entrada', 'compra', 'Compra inicial - Proveedor Panadería Central', '2025-11-03 22:31:04', 1),
(2, 'Paquete de Salchichas (x12)', 30.00, 'entrada', 'compra', 'Compra inicial - Proveedor Carnes Selectas', '2025-11-03 22:31:04', 1),
(3, 'Queso Cheddar', 10.00, 'entrada', 'compra', 'Compra inicial - Proveedor Lácteos del Valle', '2025-11-03 22:31:04', 1),
(4, 'Lechuga', 8.00, 'entrada', 'compra', 'Compra inicial - Proveedor Verduras Frescas', '2025-11-03 22:31:04', 1),
(5, 'Tomate', 10.00, 'entrada', 'compra', 'Compra inicial - Proveedor Verduras Frescas', '2025-11-03 22:31:04', 1),
(6, 'Cebolla', 7.00, 'entrada', 'compra', 'Compra inicial - Proveedor Verduras Frescas', '2025-11-03 22:31:04', 1),
(7, 'Papas Fritas Congeladas', 40.00, 'entrada', 'compra', 'Compra inicial - Proveedor Alimentos McCain', '2025-11-03 22:31:04', 1),
(8, 'Salsa de Tomate Ketchup', 12.00, 'entrada', 'compra', 'Compra inicial - Proveedor Heinz', '2025-11-03 22:31:04', 1),
(9, 'Mostaza', 8.00, 'entrada', 'compra', 'Compra inicial - Proveedor French\'s', '2025-11-03 22:31:04', 1),
(10, 'Mayonesa', 10.00, 'entrada', 'compra', 'Compra inicial - Proveedor Hellmann\'s', '2025-11-03 22:31:04', 1),
(11, 'Aceite para freír', 20.00, 'entrada', 'compra', 'Compra inicial - Proveedor Grasas Industriales', '2025-11-03 22:31:04', 1),
(12, 'Servilletas', 25.00, 'entrada', 'compra', 'Compra inicial - Proveedor Papelería La Estrella', '2025-11-03 22:31:04', 1),
(13, 'Vasos desechables', 30.00, 'entrada', 'compra', 'Compra inicial - Proveedor Papelería La Estrella', '2025-11-03 22:31:04', 1),
(14, 'Platos desechables', 30.00, 'entrada', 'compra', 'Compra inicial - Proveedor Papelería La Estrella', '2025-11-03 22:31:04', 1),
(15, 'Paquete de Pan (x24)', 10.00, 'salida', 'venta/consumo', 'Consumo diario del día 01/11/2025', '2025-11-03 22:31:04', 1),
(16, 'Paquete de Salchichas (x12)', 8.00, 'salida', 'venta/consumo', 'Consumo diario del día 01/11/2025', '2025-11-03 22:31:04', 1),
(17, 'Papas Fritas Congeladas', 5.00, 'salida', 'venta/consumo', 'Consumo diario del día 01/11/2025', '2025-11-03 22:31:04', 1),
(18, 'Lechuga', 1.50, 'salida', 'merma/desperdicio', 'Lechuga dañada por mal almacenamiento', '2025-11-03 22:31:04', 1),
(19, 'Lechuga', 6.50, 'salida', 'venta/consumo', 'cosumo en produccion', '2025-11-03 22:54:38', 1),
(20, 'Cebolla', 7.00, 'salida', 'venta/consumo', 'gasto en produccion', '2025-11-03 22:55:31', 1),
(21, 'Tomate', 8.00, 'salida', 'venta/consumo', 'venta', '2025-11-30 18:37:27', 1);

--
-- Disparadores `inventario_general`
--
DELIMITER $$
CREATE TRIGGER `before_insert_inventario_general` BEFORE INSERT ON `inventario_general` FOR EACH ROW BEGIN
    IF NEW.cantidad_movida <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La cantidad_movida debe ser mayor a 0';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_movimientos`
--

CREATE TABLE `inventario_movimientos` (
  `idMovimiento` int(11) NOT NULL,
  `idInventario` int(11) NOT NULL,
  `tipo` enum('entrada','salida','ajuste') NOT NULL,
  `cantidad` int(11) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `menu`
--

CREATE TABLE `menu` (
  `idMenu` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `idSede` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `menu`
--

INSERT INTO `menu` (`idMenu`, `nombre`, `descripcion`, `categoria`, `activo`, `fecha_creacion`, `fecha_actualizacion`, `idSede`) VALUES
(1, 'Menú Principal', 'Menú principal de la sede', 'General', 1, '2025-08-21 15:18:35', '2025-08-21 15:18:35', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mesa`
--

CREATE TABLE `mesa` (
  `idMesa` int(11) NOT NULL,
  `numero` varchar(20) NOT NULL,
  `idSede` int(11) NOT NULL,
  `estado` enum('disponible','ocupada','limpieza') DEFAULT 'disponible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mesa`
--

INSERT INTO `mesa` (`idMesa`, `numero`, `idSede`, `estado`) VALUES
(1, 'Mesa 1', 1, 'disponible'),
(2, 'Mesa 2', 1, 'disponible'),
(3, 'Mesa 3', 1, 'disponible'),
(4, 'Mesa 4', 1, 'disponible'),
(5, 'Mesa 5', 1, 'disponible'),
(6, 'Mesa 6', 1, 'disponible'),
(7, 'Mesa 7', 1, 'disponible'),
(8, 'Mesa 8', 1, 'disponible'),
(28, '8', 1, 'disponible'),
(29, '1', 1, 'disponible'),
(30, '1', 1, 'disponible');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `idPago` int(11) NOT NULL,
  `idPedido` int(11) NOT NULL,
  `metodo` enum('efectivo','tarjeta','transferencia') NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pago`
--

INSERT INTO `pago` (`idPago`, `idPedido`, `metodo`, `monto`, `fecha`) VALUES
(2001, 2001, 'efectivo', 28000.00, '2025-11-04 04:16:13'),
(2002, 2002, 'tarjeta', 33000.00, '2025-11-06 04:16:13'),
(2003, 2003, 'transferencia', 25000.00, '2025-11-08 04:16:13'),
(2004, 2004, 'efectivo', 40000.00, '2025-11-09 04:16:13'),
(2005, 2005, 'tarjeta', 35000.00, '2025-11-10 04:16:13'),
(2028, 2028, 'efectivo', 45000.00, '2025-12-09 01:10:55'),
(2056, 2056, 'efectivo', 48000.00, '2025-12-09 01:11:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `idPedido` int(11) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('pendiente','en_preparacion','entregado','pagado','cancelado') DEFAULT 'pendiente',
  `total` decimal(10,2) DEFAULT 0.00,
  `idUsuario` int(11) NOT NULL DEFAULT 1 COMMENT 'FK a usuario.idUsuario',
  `idSede` int(11) NOT NULL,
  `idMesa` int(11) DEFAULT NULL,
  `tipo_pedido` enum('mesa','domicilio','llevar') DEFAULT 'domicilio',
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido`
--

INSERT INTO `pedido` (`idPedido`, `fecha`, `estado`, `total`, `idUsuario`, `idSede`, `idMesa`, `tipo_pedido`, `observaciones`) VALUES
(2001, '2025-11-04 04:14:57', 'entregado', 28000.00, 1, 1, 1, 'domicilio', NULL),
(2002, '2025-11-06 04:14:57', 'entregado', 33000.00, 2, 1, 2, 'domicilio', NULL),
(2003, '2025-11-08 04:14:57', 'entregado', 25000.00, 3, 1, 3, 'domicilio', NULL),
(2004, '2025-11-09 04:14:57', 'entregado', 40000.00, 4, 1, 1, 'domicilio', NULL),
(2005, '2025-11-10 04:14:57', 'entregado', 35000.00, 5, 1, 2, 'domicilio', NULL),
(2027, '2025-12-07 02:15:26', 'pagado', 32000.00, 15, 1, NULL, 'domicilio', 'Pedido 1'),
(2028, '2025-12-05 02:15:26', 'pagado', 45000.00, 15, 1, NULL, 'domicilio', 'Pedido 2'),
(2029, '2025-12-03 02:15:26', 'pagado', 38000.00, 15, 1, NULL, 'llevar', 'Pedido 3'),
(2030, '2025-12-01 02:15:26', 'pagado', 51000.00, 15, 1, NULL, 'domicilio', 'Pedido 4'),
(2031, '2025-11-28 02:15:26', 'entregado', 29000.00, 15, 1, NULL, 'mesa', 'Pedido 5'),
(2032, '2025-11-25 02:15:26', 'pagado', 43000.00, 15, 1, NULL, 'domicilio', 'Pedido 6'),
(2033, '2025-11-22 02:15:26', 'pagado', 35000.00, 15, 1, NULL, 'domicilio', 'Pedido 7'),
(2034, '2025-11-19 02:15:26', 'entregado', 47000.00, 15, 1, NULL, 'llevar', 'Pedido 8'),
(2035, '2025-11-16 02:15:26', 'pagado', 31000.00, 15, 1, NULL, 'domicilio', 'Pedido 9'),
(2036, '2025-11-13 02:15:26', 'pagado', 40000.00, 15, 1, NULL, 'mesa', 'Pedido 10'),
(2037, '2025-12-06 02:16:21', 'pagado', 28000.00, 16, 1, NULL, 'domicilio', 'Pedido 1'),
(2038, '2025-12-04 02:16:21', 'entregado', 35000.00, 16, 1, NULL, 'domicilio', 'Pedido 2'),
(2039, '2025-12-01 02:16:21', 'pagado', 42000.00, 16, 1, NULL, 'llevar', 'Pedido 3'),
(2040, '2025-11-28 02:16:21', 'pagado', 31000.00, 16, 1, NULL, 'domicilio', 'Pedido 4'),
(2041, '2025-11-24 02:16:21', 'entregado', 38000.00, 16, 1, NULL, 'mesa', 'Pedido 5'),
(2042, '2025-11-20 02:16:21', 'pagado', 44000.00, 16, 1, NULL, 'domicilio', 'Pedido 6'),
(2043, '2025-11-16 02:16:21', 'pagado', 29000.00, 16, 1, NULL, 'domicilio', 'Pedido 7'),
(2044, '2025-11-12 02:16:21', 'entregado', 36000.00, 16, 1, NULL, 'llevar', 'Pedido 8'),
(2045, '2025-12-06 02:16:44', 'pagado', 30000.00, 17, 1, NULL, 'domicilio', 'Pedido 1'),
(2046, '2025-12-03 02:16:44', 'entregado', 37000.00, 17, 1, NULL, 'domicilio', 'Pedido 2'),
(2047, '2025-11-28 02:16:44', 'pagado', 33000.00, 17, 1, NULL, 'llevar', 'Pedido 3'),
(2048, '2025-11-22 02:16:44', 'pagado', 41000.00, 17, 1, NULL, 'domicilio', 'Pedido 4'),
(2049, '2025-11-15 02:16:44', 'entregado', 28000.00, 17, 1, NULL, 'mesa', 'Pedido 5'),
(2053, '2025-12-09 00:58:51', 'pendiente', 42000.00, 5, 1, 1, 'mesa', 'Sin cebolla en la hamburguesa'),
(2054, '2025-12-09 00:58:52', 'entregado', 56000.00, 5, 1, 2, 'mesa', NULL),
(2055, '2025-12-09 00:43:52', 'en_preparacion', 73000.00, 5, 1, 3, 'mesa', 'Extra queso'),
(2056, '2025-12-09 00:55:06', 'pagado', 48000.00, 5, 1, 4, 'mesa', NULL),
(2057, '2025-12-09 01:13:11', 'en_preparacion', 6000.00, 7, 1, NULL, 'domicilio', 'en vaso con hielo');

--
-- Disparadores `pedido`
--
DELIMITER $$
CREATE TRIGGER `after_pedido_insert` AFTER INSERT ON `pedido` FOR EACH ROW BEGIN
    UPDATE usuario 
    SET total_pedidos = total_pedidos + 1 
    WHERE idUsuario = NEW.idUsuario;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_personalizacion`
--

CREATE TABLE `pedido_personalizacion` (
  `id` int(11) NOT NULL,
  `idPedido` int(11) NOT NULL,
  `idProducto` int(11) NOT NULL,
  `idPersonalizacion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_producto`
--

CREATE TABLE `pedido_producto` (
  `idPedido` int(11) NOT NULL,
  `idProducto` int(11) NOT NULL,
  `cantidad` int(11) DEFAULT 1,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS (`cantidad` * `precio_unitario`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido_producto`
--

INSERT INTO `pedido_producto` (`idPedido`, `idProducto`, `cantidad`, `precio_unitario`) VALUES
(2027, 2, 1, 3000.00),
(2027, 5, 2, 6000.00),
(2027, 38, 1, 18000.00),
(2028, 2, 1, 3000.00),
(2028, 39, 2, 22000.00),
(2029, 2, 1, 3000.00),
(2029, 38, 2, 18000.00),
(2030, 7, 1, 8000.00),
(2030, 39, 2, 22000.00),
(2031, 5, 1, 6000.00),
(2031, 41, 2, 12000.00),
(2032, 2, 1, 3000.00),
(2032, 5, 1, 6000.00),
(2032, 38, 2, 18000.00),
(2033, 2, 1, 3000.00),
(2033, 5, 2, 6000.00),
(2033, 39, 1, 22000.00),
(2034, 2, 1, 3000.00),
(2034, 39, 2, 22000.00),
(2035, 2, 1, 3000.00),
(2035, 5, 2, 6000.00),
(2035, 38, 1, 18000.00),
(2036, 5, 3, 6000.00),
(2036, 39, 1, 22000.00),
(2037, 2, 1, 3000.00),
(2037, 41, 2, 12000.00),
(2038, 5, 2, 6000.00),
(2038, 6, 1, 3000.00),
(2038, 38, 1, 18000.00),
(2039, 28, 1, 20000.00),
(2039, 39, 1, 22000.00),
(2040, 2, 1, 3000.00),
(2040, 5, 2, 6000.00),
(2040, 38, 1, 18000.00),
(2045, 5, 2, 6000.00),
(2045, 38, 1, 18000.00),
(2046, 2, 1, 3000.00),
(2046, 5, 2, 6000.00),
(2046, 39, 1, 22000.00),
(2047, 5, 2, 6000.00),
(2047, 6, 1, 3000.00),
(2047, 38, 1, 18000.00),
(2048, 28, 1, 20000.00),
(2048, 39, 1, 22000.00),
(2049, 2, 1, 3000.00),
(2049, 41, 2, 12000.00),
(2053, 2, 2, 3000.00),
(2053, 38, 2, 18000.00),
(2054, 5, 2, 6000.00),
(2054, 39, 2, 22000.00),
(2055, 2, 1, 3000.00),
(2055, 5, 1, 6000.00),
(2055, 38, 1, 18000.00),
(2055, 39, 1, 22000.00),
(2055, 41, 2, 12000.00),
(2056, 7, 1, 8000.00),
(2056, 28, 2, 20000.00),
(2057, 2, 2, 3000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personalizacionproducto`
--

CREATE TABLE `personalizacionproducto` (
  `idPersonalizacion` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `costoExtra` decimal(10,2) DEFAULT 0.00,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `idProducto` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `disponible` tinyint(1) DEFAULT 1,
  `stock_limite` int(11) DEFAULT 10 COMMENT 'Stock mínimo de seguridad del producto',
  `especial_dia` tinyint(1) DEFAULT 0 COMMENT 'Indica si el producto está en especiales del día (0=No, 1=Sí)',
  `idMenu` int(11) NOT NULL,
  `idCategoria` int(11) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `stock_minimo_producto` int(11) DEFAULT 5 COMMENT 'Stock mínimo del producto antes de alertar',
  `stock_maximo_producto` int(11) DEFAULT 100 COMMENT 'Stock máximo del producto',
  `es_especial_dia` tinyint(4) DEFAULT 0 COMMENT 'Indica si el producto es especial del día (0=No, 1=Sí)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`idProducto`, `nombre`, `precio`, `disponible`, `stock_limite`, `especial_dia`, `idMenu`, `idCategoria`, `descripcion`, `imagen_url`, `fecha_creacion`, `stock_minimo_producto`, `stock_maximo_producto`, `es_especial_dia`) VALUES
(2, 'Coca Cola 350ml', 3000.00, 1, 10, 1, 1, 2, 'Bebida gaseosa', NULL, '2025-08-21 15:18:35', 5, 100, 0),
(4, 'Hamburguesa BBQ', 18000.00, 0, 10, 1, 1, 1, 'Carne, salsa BBQ, cebolla caramelizada', NULL, '2025-08-21 15:22:43', 5, 100, 0),
(5, 'Papas Fritas', 6000.00, 1, 10, 1, 1, 3, 'Papas fritas medianas', NULL, '2025-08-21 15:22:43', 5, 100, 0),
(6, 'Sprite 350ml', 3000.00, 1, 10, 0, 1, 2, 'Bebida gaseosa', NULL, '2025-08-21 15:22:43', 5, 100, 0),
(7, 'Brownie con Helado y vainilia negra', 8000.00, 1, 10, 0, 1, 4, 'Postre dulce', '', '2025-08-21 15:22:43', 5, 100, 0),
(28, 'Pizza Personal', 20000.00, 1, 10, 0, 1, 2, 'Pizza de 4 porciones con ingredientes al gusto', NULL, '2025-10-02 19:58:49', 5, 100, 0),
(38, 'Hamburguesa Clásica', 18000.00, 1, 10, 0, 1, 1, 'Pan artesanal, carne 120g, queso y vegetales.', 'hamburguesa.jpg', '2025-08-11 20:56:54', 5, 100, 0),
(39, 'Hamburguesa Doble', 22000.00, 1, 10, 0, 1, 1, 'Doble carne y doble queso.', 'doble.jpg', '2025-08-21 20:56:54', 5, 100, 0),
(41, 'Perro Caliente', 12000.00, 1, 10, 0, 1, 1, 'Salchicha americana con salsas.', 'perro.jpg', '2025-09-10 20:56:54', 5, 100, 0),
(43, 'chescake', 18000.00, 1, 10, 1, 1, 4, 'ches', NULL, '2025-12-02 16:10:29', 5, 100, 0),
(44, 'salchipollo', 18000.00, 1, 10, 1, 1, 1, 'pollo con salchicha', NULL, '2025-12-02 18:21:53', 5, 100, 0),
(45, 'alchipollo', 18000.00, 1, 10, 0, 1, 1, 'salchi', NULL, '2025-12-02 18:27:49', 5, 100, 0),
(46, 'ogdoguetergia', 21000.00, 1, 10, 0, 1, 1, 'ot dog', NULL, '2025-12-02 18:39:22', 5, 100, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `receta`
--

CREATE TABLE `receta` (
  `idReceta` int(11) NOT NULL,
  `idProducto` int(11) NOT NULL COMMENT 'Producto final (Hamburguesa)',
  `idInsumo` int(11) NOT NULL COMMENT 'Materia prima (Pan, Carne, etc.)',
  `cantidad_requerida` decimal(10,2) NOT NULL COMMENT 'Cantidad de insumo para 1 unidad del producto'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `receta`
--

INSERT INTO `receta` (`idReceta`, `idProducto`, `idInsumo`, `cantidad_requerida`) VALUES
(5, 5, 6, 0.25);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `idRol` int(11) NOT NULL,
  `nombreRol` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`idRol`, `nombreRol`, `descripcion`) VALUES
(1, 'admin', 'Administrador del sistema con acceso total'),
(2, 'empleado', 'Empleado del restaurante con acceso limitado'),
(3, 'cliente', 'Cliente que realiza pedidos y gestiona su cuenta');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sede`
--

CREATE TABLE `sede` (
  `idSede` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sede`
--

INSERT INTO `sede` (`idSede`, `nombre`, `direccion`, `ciudad`, `telefono`, `activo`, `fecha_creacion`) VALUES
(1, 'Frank Furt Centro', 'Calle 10 #15-30', 'Bogotá', '601-555-0100', 1, '2025-08-21 15:18:35'),
(2, 'Sede Secundaria', 'Carrera 45 #20-15', '', NULL, 1, '2025-10-02 19:53:02'),
(3, 'Sede Principal', 'Calle 123 #45-67', '', '3001234567', 1, '2025-11-11 05:16:22');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `idUsuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('administrador','empleado','cliente') NOT NULL DEFAULT 'cliente' COMMENT 'Rol del usuario',
  `activo` tinyint(1) DEFAULT 1,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `total_pedidos` int(11) DEFAULT 0 COMMENT 'Contador de pedidos totales del usuario'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`idUsuario`, `nombre`, `correo`, `telefono`, `direccion`, `password`, `rol`, `activo`, `fecha_registro`, `ultimo_acceso`, `reset_token`, `reset_token_expires`, `total_pedidos`) VALUES
(1, 'Cliente General', 'general@frankfurt.com', '', '', 'default_hash', 'cliente', 1, '2025-10-14 05:12:10', NULL, NULL, NULL, 1),
(2, 'tarlo mendes', 'tarlo@gmail.com', '', '', '$2b$10$yXReb5fMTyByeUIzkwKcHO4T3z05.LGfSZ3LKMUWpvLcqxxm./paK', 'cliente', 1, '2025-10-14 06:26:10', NULL, NULL, NULL, 1),
(3, 'taniasss gutierres', 'tania@gmail.com', '', '', '$2b$10$Ub8Lj4MWiPcNtX4XFQw.Duzcq53nDdTwTdmbGFlL5cD3xm6sBattG', '', 1, '2025-10-14 06:41:16', '2025-10-20 04:06:50', NULL, NULL, 1),
(4, 'camilo plazas', 'cami@gmail.com', '', '', '$2b$10$Z95K/ZN2g5YMDST90L3auOOP19cIYVPmK1zhdEKvr9AhsYuDOU3JO', 'cliente', 1, '2025-10-21 04:02:09', '2025-10-21 04:04:02', NULL, NULL, 1),
(5, 'syrax targueryen', 'syrax@gmail.com', '', '', '$2b$10$TU5YCTNU1SYR1KVek/E0KuqPwv3/yhLIZ9VMain6sUkheAcvwdoY2', 'administrador', 1, '2025-10-21 04:08:46', '2025-12-09 01:08:08', NULL, NULL, 5),
(6, 'julian plazas', 'juli@gmail.com', '82734672437', 'calle 20', '$2b$10$8w5ONQaIXY.548E5zy07QOlkoI1fYw5xDZf.IaMACMmS31W06m.QK', 'cliente', 1, '2025-11-04 03:51:20', NULL, NULL, NULL, 0),
(7, 'edsson garzon', 'edssongarzon62@gmail.com', '', '', '$2b$10$Oe7qWMt66VV6XfQxrqJgy./8OtrXEuNhW6x1KElOYbVQOvozTso/W', 'cliente', 1, '2025-11-04 08:26:21', NULL, '957655', '2025-12-02 17:49:15', 1),
(8, 'charlie morningstar', 'charlie@gmail.com', '2873582654', 'calle H', '$2b$10$RhPVW1Wlet9e9XN7gzBLjOAwrc9X4419Te6wDtrWEJAvZL2/INM/O', '', 1, '2025-11-10 04:22:25', NULL, NULL, NULL, 0),
(9, 'vagi umberta', 'vagi@gmail.com', '', '', '$2b$10$x2FbCCRxr20lm.zQlbOT7.8IcQ2q6945tahRwqoCvRrjklRl2fXJK', '', 1, '2025-11-10 19:04:16', '2025-11-10 19:04:32', NULL, NULL, 0),
(10, 'jiseth polas Muñoz', 'jisethmunoz1207@gmail.com', '', '', '$2b$10$4KidYYYiCA8K991XFfhi/unI2ApDarVBOF5aMaXT2k36fhRW5tiI2', '', 1, '2025-11-11 02:06:55', '2025-11-11 02:07:12', NULL, NULL, 0),
(11, 'ivis  moreno', 'ivis@gmail.com', '4356457567', 'juan rey', '$2b$10$.UdedDhIbDV8uv87e603eeZCuPRwHplyCwjfhjYc5h2cyXtm9EhTm', '', 1, '2025-11-25 20:49:27', NULL, NULL, NULL, 0),
(12, 'angel dust w', 'angel@gmail.com', '1234123465', 'hell', '$2b$10$34X3PHQNmxod7WHNU4/QHO3IUK.Da47bA1Hh0hwqIJqC3JnazyDri', '', 1, '2025-11-26 00:59:48', NULL, NULL, NULL, 0),
(13, 'husk alas', 'husk@gmail.com', '8275634870', 'hell', '$2b$10$QwAqliiOa1hzfERLuUJooOUrbTl8UDI8e4jAUgd.In7X3TE.yV/n6', '', 1, '2025-12-02 15:50:07', NULL, NULL, NULL, 0),
(14, 'María González - Cliente VIP', 'maria.vip@test.com', '3001234567', 'Calle 123 # 45-67', '$2b$10$rqWC1hJpHwKOvWKJ5vQk8.kR7qG2HqQvXz8n9YqNqZpKbKXqJqH0O', 'cliente', 1, '2025-09-08 02:11:28', NULL, NULL, NULL, 0),
(15, 'Carlos Rodríguez - Cliente Oro', 'carlos.oro@test.com', '3002345678', 'Carrera 45 # 12-34', '$2b$10$rqWC1hJpHwKOvWKJ5vQk8.kR7qG2HqQvXz8n9YqNqZpKbKXqJqH0O', 'cliente', 1, '2025-10-08 02:11:28', NULL, NULL, NULL, 10),
(16, 'Ana Martínez - Cliente Plata', 'ana.plata@test.com', '3003456789', 'Avenida 67 # 89-01', '$2b$10$rqWC1hJpHwKOvWKJ5vQk8.kR7qG2HqQvXz8n9YqNqZpKbKXqJqH0O', 'cliente', 1, '2025-11-08 02:11:28', NULL, NULL, NULL, 8),
(17, 'Pedro López - Cliente Normal', 'pedro.normal@test.com', '3004567890', 'Calle 90 # 12-34', '$2b$10$rqWC1hJpHwKOvWKJ5vQk8.kR7qG2HqQvXz8n9YqNqZpKbKXqJqH0O', 'cliente', 1, '2025-11-08 02:11:28', NULL, NULL, NULL, 5);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_inventario_alertas`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_inventario_alertas` (
`idInsumo` int(11)
,`nombre_insumo` varchar(255)
,`unidad_medida` enum('paquete','kg','litro','unidades','gramos','ml')
,`stock_minimo_insumo` decimal(10,2)
,`fecha_vencimiento` date
,`dias_hasta_vencer` int(7)
,`stock_disponible` decimal(32,2)
,`estado_stock` varchar(17)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_pedidos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_pedidos` (
`idPedido` int(11)
,`fecha` timestamp
,`estado` enum('pendiente','en_preparacion','entregado','pagado','cancelado')
,`total` decimal(10,2)
,`cliente` varchar(100)
,`sede` varchar(100)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_pedidos_activos_mesa`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_pedidos_activos_mesa` (
`idPedido` int(11)
,`fecha` timestamp
,`estado` enum('pendiente','en_preparacion','entregado','pagado','cancelado')
,`total` decimal(10,2)
,`observaciones` text
,`numeroMesa` varchar(20)
,`idMesa` int(11)
,`estadoMesa` enum('disponible','ocupada','limpieza')
,`sede` varchar(100)
,`idSede` int(11)
,`cantidadProductos` bigint(21)
,`cliente` binary(0)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_productos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_productos` (
`idProducto` int(11)
,`nombre` varchar(100)
,`precio` decimal(10,2)
,`descripcion` text
,`categoria` varchar(100)
,`menu` varchar(100)
,`sede` varchar(100)
,`stock` int(11)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_productos_vencimiento_proximo`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_productos_vencimiento_proximo` (
`idInsumo` int(11)
,`nombre_insumo` varchar(255)
,`unidad_medida` enum('paquete','kg','litro','unidades','gramos','ml')
,`fecha_vencimiento` date
,`dias_hasta_vencer` int(7)
,`estado_vencimiento` varchar(7)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_stock_actual`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_stock_actual` (
`nombre_insumo` varchar(255)
,`unidad_medida` enum('paquete','kg','litro','unidades','gramos','ml')
,`stock_disponible` decimal(32,2)
,`stock_minimo_insumo` decimal(10,2)
,`idSede` int(11)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_stock_insumos_sede`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_stock_insumos_sede` (
`idInventario` int(11)
,`nombreSede` varchar(100)
,`nombreInsumo` varchar(100)
,`unidad_medida` varchar(20)
,`stockDisponible` int(11)
,`stock_minimo` int(11)
,`estadoStock` varchar(11)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_usuarios_sin_pedidos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_usuarios_sin_pedidos` (
`idUsuario` int(11)
,`nombre` varchar(100)
,`correo` varchar(150)
,`telefono` varchar(20)
,`fecha_registro` timestamp
,`activo` tinyint(1)
,`total_pedidos` int(11)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_inventario_alertas`
--
DROP TABLE IF EXISTS `vista_inventario_alertas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_inventario_alertas`  AS SELECT `ic`.`idInsumo` AS `idInsumo`, `ic`.`nombre_insumo` AS `nombre_insumo`, `ic`.`unidad_medida` AS `unidad_medida`, `ic`.`stock_minimo_insumo` AS `stock_minimo_insumo`, `ic`.`fecha_vencimiento` AS `fecha_vencimiento`, to_days(`ic`.`fecha_vencimiento`) - to_days(curdate()) AS `dias_hasta_vencer`, coalesce(sum(case when `ig`.`tipo_movimiento` = 'entrada' then `ig`.`cantidad_movida` when `ig`.`tipo_movimiento` = 'salida' then -`ig`.`cantidad_movida` else 0 end),0) AS `stock_disponible`, CASE WHEN coalesce(sum(case when `ig`.`tipo_movimiento` = 'entrada' then `ig`.`cantidad_movida` when `ig`.`tipo_movimiento` = 'salida' then -`ig`.`cantidad_movida` else 0 end),0) = 0 THEN 'Agotado' WHEN coalesce(sum(case when `ig`.`tipo_movimiento` = 'entrada' then `ig`.`cantidad_movida` when `ig`.`tipo_movimiento` = 'salida' then -`ig`.`cantidad_movida` else 0 end),0) <= `ic`.`stock_minimo_insumo` THEN 'Requiere Atención' ELSE 'Suficiente' END AS `estado_stock` FROM (`insumos_config` `ic` left join `inventario_general` `ig` on(`ic`.`nombre_insumo` = `ig`.`nombre_insumo`)) WHERE `ic`.`idSede` = 1 GROUP BY `ic`.`idInsumo`, `ic`.`nombre_insumo`, `ic`.`unidad_medida`, `ic`.`stock_minimo_insumo`, `ic`.`fecha_vencimiento` ORDER BY coalesce(sum(case when `ig`.`tipo_movimiento` = 'entrada' then `ig`.`cantidad_movida` when `ig`.`tipo_movimiento` = 'salida' then -`ig`.`cantidad_movida` else 0 end),0) ASC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_pedidos`
--
DROP TABLE IF EXISTS `vista_pedidos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_pedidos`  AS SELECT `p`.`idPedido` AS `idPedido`, `p`.`fecha` AS `fecha`, `p`.`estado` AS `estado`, `p`.`total` AS `total`, `u`.`nombre` AS `cliente`, `s`.`nombre` AS `sede` FROM ((`pedido` `p` join `usuario` `u` on(`p`.`idUsuario` = `u`.`idUsuario`)) join `sede` `s` on(`p`.`idSede` = `s`.`idSede`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_pedidos_activos_mesa`
--
DROP TABLE IF EXISTS `vista_pedidos_activos_mesa`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_pedidos_activos_mesa`  AS SELECT `p`.`idPedido` AS `idPedido`, `p`.`fecha` AS `fecha`, `p`.`estado` AS `estado`, `p`.`total` AS `total`, `p`.`observaciones` AS `observaciones`, `m`.`numero` AS `numeroMesa`, `m`.`idMesa` AS `idMesa`, `m`.`estado` AS `estadoMesa`, `s`.`nombre` AS `sede`, `s`.`idSede` AS `idSede`, count(`pp`.`idProducto`) AS `cantidadProductos`, NULL AS `cliente` FROM (((`pedido` `p` join `mesa` `m` on(`p`.`idMesa` = `m`.`idMesa`)) join `sede` `s` on(`p`.`idSede` = `s`.`idSede`)) left join `pedido_producto` `pp` on(`p`.`idPedido` = `pp`.`idPedido`)) WHERE `p`.`estado` in ('pendiente','en preparación') GROUP BY `p`.`idPedido`, `p`.`fecha`, `p`.`estado`, `p`.`total`, `p`.`observaciones`, `m`.`numero`, `m`.`idMesa`, `m`.`estado`, `s`.`nombre`, `s`.`idSede` ORDER BY `p`.`fecha` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_productos`
--
DROP TABLE IF EXISTS `vista_productos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_productos`  AS SELECT `p`.`idProducto` AS `idProducto`, `p`.`nombre` AS `nombre`, `p`.`precio` AS `precio`, `p`.`descripcion` AS `descripcion`, `c`.`nombre` AS `categoria`, `m`.`nombre` AS `menu`, `s`.`nombre` AS `sede`, coalesce(`i`.`stockDisponible`,0) AS `stock` FROM ((((`producto` `p` join `categoria` `c` on(`p`.`idCategoria` = `c`.`id`)) join `menu` `m` on(`p`.`idMenu` = `m`.`idMenu`)) join `sede` `s` on(`m`.`idSede` = `s`.`idSede`)) left join `inventario` `i` on(`p`.`idProducto` = `i`.`idProducto`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_productos_vencimiento_proximo`
--
DROP TABLE IF EXISTS `vista_productos_vencimiento_proximo`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_productos_vencimiento_proximo`  AS SELECT `ic`.`idInsumo` AS `idInsumo`, `ic`.`nombre_insumo` AS `nombre_insumo`, `ic`.`unidad_medida` AS `unidad_medida`, `ic`.`fecha_vencimiento` AS `fecha_vencimiento`, to_days(`ic`.`fecha_vencimiento`) - to_days(curdate()) AS `dias_hasta_vencer`, CASE WHEN to_days(`ic`.`fecha_vencimiento`) - to_days(curdate()) < 0 THEN 'Vencido' WHEN to_days(`ic`.`fecha_vencimiento`) - to_days(curdate()) <= 3 THEN 'Crítico' WHEN to_days(`ic`.`fecha_vencimiento`) - to_days(curdate()) <= 7 THEN 'Urgente' ELSE 'Normal' END AS `estado_vencimiento` FROM `insumos_config` AS `ic` WHERE `ic`.`fecha_vencimiento` is not null AND to_days(`ic`.`fecha_vencimiento`) - to_days(curdate()) <= 7 ORDER BY to_days(`ic`.`fecha_vencimiento`) - to_days(curdate()) ASC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_stock_actual`
--
DROP TABLE IF EXISTS `vista_stock_actual`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_stock_actual`  AS SELECT `ic`.`nombre_insumo` AS `nombre_insumo`, `ic`.`unidad_medida` AS `unidad_medida`, coalesce(sum(case when `ig`.`tipo_movimiento` = 'entrada' then `ig`.`cantidad_movida` when `ig`.`tipo_movimiento` = 'salida' then -`ig`.`cantidad_movida` else 0 end),0) AS `stock_disponible`, `ic`.`stock_minimo_insumo` AS `stock_minimo_insumo`, `ic`.`idSede` AS `idSede` FROM (`insumos_config` `ic` left join `inventario_general` `ig` on(`ic`.`nombre_insumo` = `ig`.`nombre_insumo`)) GROUP BY `ic`.`nombre_insumo`, `ic`.`unidad_medida`, `ic`.`stock_minimo_insumo`, `ic`.`idSede` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_stock_insumos_sede`
--
DROP TABLE IF EXISTS `vista_stock_insumos_sede`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_stock_insumos_sede`  AS SELECT `i`.`idInventario` AS `idInventario`, `s`.`nombre` AS `nombreSede`, `ins`.`nombre` AS `nombreInsumo`, `ins`.`unidad_medida` AS `unidad_medida`, `i`.`stockDisponible` AS `stockDisponible`, `i`.`stock_minimo` AS `stock_minimo`, CASE WHEN `i`.`stockDisponible` <= `i`.`stock_minimo` THEN 'Reabastecer' ELSE 'Suficiente' END AS `estadoStock` FROM ((`inventario` `i` join `insumo` `ins` on(`i`.`idInsumo` = `ins`.`idInsumo`)) join `sede` `s` on(`i`.`idSede` = `s`.`idSede`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_usuarios_sin_pedidos`
--
DROP TABLE IF EXISTS `vista_usuarios_sin_pedidos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_usuarios_sin_pedidos`  AS SELECT `u`.`idUsuario` AS `idUsuario`, `u`.`nombre` AS `nombre`, `u`.`correo` AS `correo`, `u`.`telefono` AS `telefono`, `u`.`fecha_registro` AS `fecha_registro`, `u`.`activo` AS `activo`, `u`.`total_pedidos` AS `total_pedidos` FROM `usuario` AS `u` WHERE `u`.`rol` = 'cliente' AND `u`.`total_pedidos` = 0 AND `u`.`activo` = 1 ORDER BY `u`.`fecha_registro` DESC ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `empleado_info`
--
ALTER TABLE `empleado_info`
  ADD PRIMARY KEY (`idEmpleado`),
  ADD KEY `idSede` (`idSede`);

--
-- Indices de la tabla `insumo`
--
ALTER TABLE `insumo`
  ADD PRIMARY KEY (`idInsumo`);

--
-- Indices de la tabla `insumos_config`
--
ALTER TABLE `insumos_config`
  ADD PRIMARY KEY (`idInsumo`),
  ADD UNIQUE KEY `nombre_insumo` (`nombre_insumo`),
  ADD KEY `idx_nombre_insumo` (`nombre_insumo`),
  ADD KEY `idx_sede` (`idSede`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`idInventario`),
  ADD UNIQUE KEY `idx_insumo_sede` (`idInsumo`,`idSede`),
  ADD KEY `idSede` (`idSede`);

--
-- Indices de la tabla `inventario_general`
--
ALTER TABLE `inventario_general`
  ADD PRIMARY KEY (`idMovimiento`),
  ADD KEY `idx_nombre_insumo` (`nombre_insumo`),
  ADD KEY `idx_fecha_movimiento` (`fecha_movimiento`),
  ADD KEY `idx_tipo_movimiento` (`tipo_movimiento`),
  ADD KEY `idx_sede` (`idSede`);

--
-- Indices de la tabla `inventario_movimientos`
--
ALTER TABLE `inventario_movimientos`
  ADD PRIMARY KEY (`idMovimiento`),
  ADD KEY `idInventario` (`idInventario`);

--
-- Indices de la tabla `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`idMenu`),
  ADD KEY `idSede` (`idSede`);

--
-- Indices de la tabla `mesa`
--
ALTER TABLE `mesa`
  ADD PRIMARY KEY (`idMesa`),
  ADD KEY `idSede` (`idSede`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`idPago`),
  ADD KEY `idPedido` (`idPedido`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`idPedido`),
  ADD KEY `idSede` (`idSede`),
  ADD KEY `idMesa` (`idMesa`),
  ADD KEY `idUsuario` (`idUsuario`),
  ADD KEY `idx_estado_fecha` (`estado`,`fecha`);

--
-- Indices de la tabla `pedido_personalizacion`
--
ALTER TABLE `pedido_personalizacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idPedido` (`idPedido`),
  ADD KEY `idProducto` (`idProducto`),
  ADD KEY `idPersonalizacion` (`idPersonalizacion`);

--
-- Indices de la tabla `pedido_producto`
--
ALTER TABLE `pedido_producto`
  ADD PRIMARY KEY (`idPedido`,`idProducto`),
  ADD KEY `idProducto` (`idProducto`);

--
-- Indices de la tabla `personalizacionproducto`
--
ALTER TABLE `personalizacionproducto`
  ADD PRIMARY KEY (`idPersonalizacion`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`idProducto`),
  ADD KEY `idMenu` (`idMenu`),
  ADD KEY `idCategoria` (`idCategoria`);

--
-- Indices de la tabla `receta`
--
ALTER TABLE `receta`
  ADD PRIMARY KEY (`idReceta`),
  ADD UNIQUE KEY `idx_producto_insumo` (`idProducto`,`idInsumo`),
  ADD KEY `idProducto` (`idProducto`),
  ADD KEY `idInsumo` (`idInsumo`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`idRol`),
  ADD UNIQUE KEY `nombreRol` (`nombreRol`);

--
-- Indices de la tabla `sede`
--
ALTER TABLE `sede`
  ADD PRIMARY KEY (`idSede`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`idUsuario`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `idx_usuario_rol` (`rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `insumo`
--
ALTER TABLE `insumo`
  MODIFY `idInsumo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `insumos_config`
--
ALTER TABLE `insumos_config`
  MODIFY `idInsumo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `idInventario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `inventario_general`
--
ALTER TABLE `inventario_general`
  MODIFY `idMovimiento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `inventario_movimientos`
--
ALTER TABLE `inventario_movimientos`
  MODIFY `idMovimiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `menu`
--
ALTER TABLE `menu`
  MODIFY `idMenu` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `mesa`
--
ALTER TABLE `mesa`
  MODIFY `idMesa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `idPago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3025;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `idPedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2058;

--
-- AUTO_INCREMENT de la tabla `pedido_personalizacion`
--
ALTER TABLE `pedido_personalizacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `personalizacionproducto`
--
ALTER TABLE `personalizacionproducto`
  MODIFY `idPersonalizacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `idProducto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT de la tabla `receta`
--
ALTER TABLE `receta`
  MODIFY `idReceta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `idRol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `sede`
--
ALTER TABLE `sede`
  MODIFY `idSede` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `idUsuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `empleado_info`
--
ALTER TABLE `empleado_info`
  ADD CONSTRAINT `empleado_info_ibfk_1` FOREIGN KEY (`idEmpleado`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `empleado_info_ibfk_2` FOREIGN KEY (`idSede`) REFERENCES `sede` (`idSede`) ON DELETE CASCADE;

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`idInsumo`) REFERENCES `insumo` (`idInsumo`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventario_ibfk_2` FOREIGN KEY (`idSede`) REFERENCES `sede` (`idSede`) ON DELETE CASCADE;

--
-- Filtros para la tabla `inventario_movimientos`
--
ALTER TABLE `inventario_movimientos`
  ADD CONSTRAINT `inventario_movimientos_ibfk_1` FOREIGN KEY (`idInventario`) REFERENCES `inventario` (`idInventario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `menu`
--
ALTER TABLE `menu`
  ADD CONSTRAINT `menu_ibfk_1` FOREIGN KEY (`idSede`) REFERENCES `sede` (`idSede`) ON DELETE CASCADE;

--
-- Filtros para la tabla `mesa`
--
ALTER TABLE `mesa`
  ADD CONSTRAINT `mesa_ibfk_1` FOREIGN KEY (`idSede`) REFERENCES `sede` (`idSede`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`idPedido`) REFERENCES `pedido` (`idPedido`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `fk_pedido_usuario_central` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `pedido_ibfk_2` FOREIGN KEY (`idSede`) REFERENCES `sede` (`idSede`) ON DELETE CASCADE,
  ADD CONSTRAINT `pedido_ibfk_3` FOREIGN KEY (`idMesa`) REFERENCES `mesa` (`idMesa`) ON DELETE SET NULL;

--
-- Filtros para la tabla `pedido_personalizacion`
--
ALTER TABLE `pedido_personalizacion`
  ADD CONSTRAINT `pedido_personalizacion_ibfk_1` FOREIGN KEY (`idPedido`) REFERENCES `pedido` (`idPedido`) ON DELETE CASCADE,
  ADD CONSTRAINT `pedido_personalizacion_ibfk_2` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`) ON DELETE CASCADE,
  ADD CONSTRAINT `pedido_personalizacion_ibfk_3` FOREIGN KEY (`idPersonalizacion`) REFERENCES `personalizacionproducto` (`idPersonalizacion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pedido_producto`
--
ALTER TABLE `pedido_producto`
  ADD CONSTRAINT `pedido_producto_ibfk_1` FOREIGN KEY (`idPedido`) REFERENCES `pedido` (`idPedido`) ON DELETE CASCADE,
  ADD CONSTRAINT `pedido_producto_ibfk_2` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`idMenu`) REFERENCES `menu` (`idMenu`) ON DELETE CASCADE,
  ADD CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`idCategoria`) REFERENCES `categoria` (`id`);

--
-- Filtros para la tabla `receta`
--
ALTER TABLE `receta`
  ADD CONSTRAINT `receta_ibfk_1` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`) ON DELETE CASCADE,
  ADD CONSTRAINT `receta_ibfk_2` FOREIGN KEY (`idInsumo`) REFERENCES `insumo` (`idInsumo`) ON DELETE CASCADE;

DELIMITER $$
--
-- Eventos
--
CREATE DEFINER=`root`@`localhost` EVENT `evento_actualizar_dashboard` ON SCHEDULE EVERY 1 DAY STARTS '2025-12-03 00:00:00' ON COMPLETION NOT PRESERVE ENABLE DO CALL actualizar_dashboard_diario()$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
