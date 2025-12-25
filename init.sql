-- PostgreSQL 初始化脚本
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS phone_models (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  brand TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS colors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  hex CHAR(7),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS image_assets (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  model_id INTEGER REFERENCES phone_models(id) ON DELETE SET NULL,
  color_id INTEGER REFERENCES colors(id) ON DELETE SET NULL,
  alt TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  shop_name TEXT,
  model_id INTEGER REFERENCES phone_models(id) ON DELETE SET NULL,
  color_id INTEGER REFERENCES colors(id) ON DELETE SET NULL,
  paid_amount NUMERIC(12,2),
  order_number TEXT UNIQUE,
  cover_image_id INTEGER REFERENCES image_assets(id) ON DELETE SET NULL,
  share_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_images (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_id INTEGER REFERENCES image_assets(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (product_id, image_id)
);

CREATE INDEX IF NOT EXISTS idx_products_model_color ON products(model_id, color_id);
CREATE INDEX IF NOT EXISTS idx_images_model_color ON image_assets(model_id, color_id);

-- 店铺表（用于管理可选店铺名）
CREATE TABLE IF NOT EXISTS shops (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  title_templates TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 示例数据
INSERT INTO shops (name) VALUES ('抖音森林科技-批发号'), ('旗舰店'), ('批发店')
ON CONFLICT (name) DO NOTHING;

INSERT INTO phone_models (name, brand) VALUES
  ('iPhone 16', 'Apple'),
  ('iPhone 16 Pro', 'Apple'),
  ('Mate 70', 'Huawei')
ON CONFLICT (name) DO NOTHING;

INSERT INTO colors (name, hex) VALUES
  ('粉色', '#f9d5e5'),
  ('黑色', '#000000'),
  ('远峰蓝', '#6c8ebf')
ON CONFLICT (name) DO NOTHING;

INSERT INTO image_assets (url, model_id, color_id, alt) VALUES
  ('https://example.com/iphone16-pink-front.png', 1, 1, 'iPhone16 粉色 正面'),
  ('https://example.com/iphone16-pink-back.png', 1, 1, 'iPhone16 粉色 背面'),
  ('https://example.com/iphone16pro-black-front.png', 2, 2, 'iPhone16 Pro 黑色 正面')
ON CONFLICT DO NOTHING;

INSERT INTO products (title, price, shop_name, model_id, color_id, paid_amount, order_number, cover_image_id, share_token, status)
VALUES ('森林科技批发 - iPhone16', 4800, '森林科技旗舰店', 1, 1, 4800, 'ORDER-20241204-0001', 1, 'demo-token-1', 'published')
ON CONFLICT (order_number) DO NOTHING;

INSERT INTO product_images (product_id, image_id, sort_order)
SELECT p.id, i.id, row_number() OVER () - 1
FROM products p
JOIN image_assets i ON i.model_id = p.model_id AND i.color_id = p.color_id
WHERE p.order_number = 'ORDER-20241204-0001'
ON CONFLICT DO NOTHING;
