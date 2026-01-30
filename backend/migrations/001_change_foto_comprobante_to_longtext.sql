-- Migration to change foto_comprobante from VARCHAR to LONGTEXT
-- Run this SQL on your MySQL database (Render console or MySQL client)

ALTER TABLE reservas MODIFY COLUMN foto_comprobante LONGTEXT;
