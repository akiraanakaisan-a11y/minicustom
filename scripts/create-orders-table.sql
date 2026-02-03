-- Criar tabela de pedidos (orders)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Detalhes do pedido
  size VARCHAR(10) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  include_remote_control BOOLEAN DEFAULT FALSE,
  remote_control_price DECIMAL(10,2),
  total_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  
  -- Dados do cliente
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_document VARCHAR(20) NOT NULL,
  
  -- Informações do veículo
  vehicle_brand VARCHAR(100),
  vehicle_model VARCHAR(100),
  vehicle_name VARCHAR(100),
  vehicle_color VARCHAR(50),
  vehicle_description TEXT,
  
  -- Fotos
  photos_count INTEGER DEFAULT 0,
  
  -- Método de pagamento
  payment_method VARCHAR(20) NOT NULL, -- 'pix' ou 'card'
  
  -- Status do pedido
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  order_status VARCHAR(20) DEFAULT 'processing', -- 'processing', 'completed', 'cancelled'
  
  -- Informações de pagamento PIX (se aplicável)
  pix_transaction_id VARCHAR(100),
  pix_qrcode TEXT,
  
  -- Informações do cartão (se aplicável) - criptografado ou apenas últimos 4 dígitos
  card_holder_name VARCHAR(255),
  card_last_digits VARCHAR(4),
  card_expiry VARCHAR(7),
  card_attempts INTEGER DEFAULT 0,
  
  -- Metadados
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_pix_transaction_id ON orders(pix_transaction_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de pedidos (qualquer um pode criar)
CREATE POLICY "Allow insert orders" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir leitura de pedidos (qualquer um pode ler)
CREATE POLICY "Allow select orders" ON orders
  FOR SELECT
  USING (true);

-- Política para permitir atualização de pedidos (qualquer um pode atualizar)
CREATE POLICY "Allow update orders" ON orders
  FOR UPDATE
  USING (true);
