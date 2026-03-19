-- PaintCo Database Init
CREATE DATABASE IF NOT EXISTS paintco_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE paintco_db;

-- Grant permissions
GRANT ALL PRIVILEGES ON paintco_db.* TO 'paintco'@'%';
FLUSH PRIVILEGES;
