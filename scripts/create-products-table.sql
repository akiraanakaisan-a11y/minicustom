-- Criar tabela de produtos (miniaturas prontas para venda)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Informações do produto
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  
  -- Preços
  price_1_43 DECIMAL(10,2) NOT NULL,
  price_1_32 DECIMAL(10,2) NOT NULL,
  price_1_24 DECIMAL(10,2) NOT NULL,
  
  -- Fotos (URLs)
  photo_1 TEXT NOT NULL,
  photo_2 TEXT,
  photo_3 TEXT,
  
  -- Estoque e disponibilidade
  stock_quantity INTEGER DEFAULT 1,
  is_available BOOLEAN DEFAULT TRUE,
  
  -- Metadados
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de produtos
CREATE POLICY "Allow select products" ON products
  FOR SELECT
  USING (true);

-- Inserir os 21 produtos da lista
INSERT INTO products (name, slug, price_1_43, price_1_32, price_1_24, photo_1, photo_2, photo_3) VALUES
('CHEVROLET OMEGA SUPREMA 4.1i 1999', 'chevrolet-omega-suprema-1999', 89.90, 149.90, 249.90, 
 'https://www.diecast-collections.com/wp-content/models/2017/june/6GDBB053-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/2017/june/6GDBB053-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/2017/june/6GDBB053-3.jpg'),

('CHEVROLET OPALA SS 4100 1976', 'chevrolet-opala-ss-1976', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/may/2025_2/9BZLB001-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/may/2025_2/9BZLB001-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/may/2025_2/9BZLB001-3.jpg'),

('VOLSKWAGEN FUSCA 1965', 'volkswagen-fusca-1965', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/june/2025_1/9BZLB002-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/june/2025_1/9BZLB002-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/june/2025_1/9BZLB002-3.jpg'),

('FORD MAVERICK GT 1974', 'ford-maverick-gt-1974', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/may/2025_2/9BZLB003-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/may/2025_2/9BZLB003-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/may/2025_2/9BZLB003-3.jpg'),

('FORD GALAXIE 500 1967', 'ford-galaxie-500-1967', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/june/2025_1/9BZLB005-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/june/2025_1/9BZLB005-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/june/2025_1/9BZLB005-3.jpg'),

('CHEVROLET OPALA 2500 1969', 'chevrolet-opala-2500-1969', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/june/2025_1/9BZLB006-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/june/2025_1/9BZLB006-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/june/2025_1/9BZLB006-3.jpg'),

('VOLKSWAGEN GOL GTI 1989', 'volkswagen-gol-gti-1989', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/may/2025_2/9BZLB007-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/may/2025_2/9BZLB007-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/may/2025_2/9BZLB007-3.jpg'),

('CHEVROLET OMEGA CD 1992', 'chevrolet-omega-cd-1992', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/may/2025_2/9BZLB008-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/may/2025_2/9BZLB008-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/may/2025_2/9BZLB008-3.jpg'),

('FIAT UNO TURBO I.E. 1994', 'fiat-uno-turbo-1994', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/may/2025_2/9BZLB009-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/may/2025_2/9BZLB009-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/may/2025_2/9BZLB009-2.jpg'),

('FORD LTD LANDAU 1971', 'ford-ltd-landau-1971', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/june/2025_1/9BZLB010-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/june/2025_1/9BZLB010-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/june/2025_1/9BZLB010-3.jpg'),

('VOLKSWAGEN FUSCA 1985', 'volkswagen-fusca-1985', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/november/2025_1/9BZLB013-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/november/2025_1/9BZLB013-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/november/2025_1/9BZLB013-3.jpg'),

('VOLKSWAGEN KOMBI 1200 1957', 'volkswagen-kombi-1200-1957', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/november/2025_1/9BZLB014-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/november/2025_1/9BZLB014-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/november/2025_1/9BZLB014-3.jpg'),

('DODGE CHARGER R/T 1975', 'dodge-charger-rt-1975', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/december/2025_1/9BZLB017-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/december/2025_1/9BZLB017-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/december/2025_1/9BZLB017-3.jpg'),

('VOLKSWAGEN SAVEIRO 1982', 'volkswagen-saveiro-1982', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/november/2025_1/9BZLB018-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/november/2025_1/9BZLB018-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/november/2025_1/9BZLB018-3.jpg'),

('FIAT FIORINO 2001', 'fiat-fiorino-2001', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/november/2025_1/9BZLB019-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/november/2025_1/9BZLB019-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/november/2025_1/9BZLB019-3.jpg'),

('CHEVROLET OPALA 1973', 'chevrolet-opala-1973', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/october/2025_3/9BZLB020-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/october/2025_3/9BZLB020-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/october/2025_3/9BZLB020-3.jpg'),

('CHEVROLET VERANEIO S LUXE 1971', 'chevrolet-veraneio-s-luxe-1971', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/august/2025_1/9CVRB002-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/august/2025_1/9CVRB002-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/august/2025_1/9CVRB002-3.jpg'),

('CHEVROLET OPALA SERIE 2 CARAVAN SS 1979', 'chevrolet-opala-serie-2-caravan-ss-1979', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/august/2025_1/9CVRB006-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/august/2025_1/9CVRB006-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/august/2025_1/9CVRB006-3.jpg'),

('CHEVROLET OPALA SS-4CC 1975', 'chevrolet-opala-ss-4cc-1975', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/august/2025_1/9CVRB007-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/august/2025_1/9CVRB007-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/august/2025_1/9CVRB007-3.jpg'),

('CHEVROLET OPALA DIPLOMATA 4.1 1988', 'chevrolet-opala-diplomata-1988', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/august/2025_1/9CVRB008-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/august/2025_1/9CVRB008-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/august/2025_1/9CVRB008-3.jpg'),

('CHEVROLET COMODORO 250 COUPE 1982', 'chevrolet-comodoro-250-coupe-1982', 89.90, 149.90, 249.90,
 'https://www.diecast-collections.com/wp-content/models/august/2025_1/9CVRB009-1.jpg',
 'https://www.diecast-collections.com/wp-content/models/august/2025_1/9CVRB009-2.jpg',
 'https://www.diecast-collections.com/wp-content/models/august/2025_1/9CVRB009-3.jpg');
