-- Adicionar campos de endereço de entrega na tabela orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_cep VARCHAR(9),
ADD COLUMN IF NOT EXISTS shipping_street VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS shipping_complement VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_neighborhood VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(2),
ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(50);
