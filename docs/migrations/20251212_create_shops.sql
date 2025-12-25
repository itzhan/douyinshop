-- 店铺表（幂等）
CREATE TABLE IF NOT EXISTS shops (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  title_templates TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 示例数据可选
INSERT INTO shops (name) VALUES ('抖音森林科技-批发号'), ('旗舰店'), ('批发店')
ON CONFLICT (name) DO NOTHING;
