-- 添加店铺名字段（幂等）
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS shop_name TEXT;

-- 可选：为已存在数据填充默认值（按需取消注释并修改值）
-- UPDATE products SET shop_name = '默认店铺' WHERE shop_name IS NULL;
