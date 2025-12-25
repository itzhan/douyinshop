-- 为店铺新增标题模板字段（幂等）
ALTER TABLE shops
  ADD COLUMN IF NOT EXISTS title_templates TEXT[] NOT NULL DEFAULT '{}'::text[];
