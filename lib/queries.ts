import { randomBytes } from "crypto";
import { query } from "./db";

export type PhoneModel = {
  id: number;
  name: string;
  brand: string | null;
};

export type Color = {
  id: number;
  name: string;
  hex: string | null;
};

export type ImageAsset = {
  id: number;
  url: string;
  model_id: number | null;
  color_id: number | null;
  alt: string | null;
};

export type Product = {
  id: string;
  title: string;
  price: number;
  model_id: number | null;
  color_id: number | null;
  paid_amount: number | null;
  order_number: string | null;
  cover_image_id: number | null;
  share_token: string;
  status: string;
};

export type ProductWithRelations = Product & {
  model_name: string | null;
  color_name: string | null;
  cover_url: string | null;
};

export type ProductDetail = ProductWithRelations & {
  images: ImageAsset[];
};

export async function listModels(): Promise<PhoneModel[]> {
  const { rows } = await query("SELECT id, name, brand FROM phone_models ORDER BY name ASC");
  return rows;
}

export async function createModel(name: string, brand?: string) {
  const { rows } = await query(
    "INSERT INTO phone_models (name, brand) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET brand = EXCLUDED.brand RETURNING id, name, brand",
    [name, brand ?? null]
  );
  return rows[0];
}

export async function listColors(): Promise<Color[]> {
  const { rows } = await query("SELECT id, name, hex FROM colors ORDER BY name ASC");
  return rows;
}

export async function createColor(name: string, hex?: string) {
  const { rows } = await query(
    "INSERT INTO colors (name, hex) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET hex = EXCLUDED.hex RETURNING id, name, hex",
    [name, hex ?? null]
  );
  return rows[0];
}

export async function listImages(modelId?: number, colorId?: number): Promise<ImageAsset[]> {
  const filters: string[] = [];
  const params: any[] = [];
  if (modelId) {
    params.push(modelId);
    filters.push(`model_id = $${params.length}`);
  }
  if (colorId) {
    params.push(colorId);
    filters.push(`color_id = $${params.length}`);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const { rows } = await query(
    `SELECT id, url, model_id, color_id, alt FROM image_assets ${where} ORDER BY id DESC`,
    params
  );
  return rows;
}

export async function createImages(urls: string[], modelId?: number, colorId?: number, alt?: string) {
  const results: ImageAsset[] = [];
  for (const url of urls) {
    const { rows } = await query(
      "INSERT INTO image_assets (url, model_id, color_id, alt) VALUES ($1, $2, $3, $4) RETURNING id, url, model_id, color_id, alt",
      [url, modelId ?? null, colorId ?? null, alt ?? null]
    );
    results.push(rows[0]);
  }
  return results;
}

function generateShareToken() {
  return randomBytes(6).toString("hex");
}

export async function listProducts(): Promise<ProductWithRelations[]> {
  const { rows } = await query(
    `SELECT p.id, p.title, p.price, p.model_id, p.color_id, p.paid_amount, p.order_number, p.cover_image_id, p.share_token, p.status,
            m.name AS model_name, c.name AS color_name, ia.url AS cover_url
     FROM products p
     LEFT JOIN phone_models m ON m.id = p.model_id
     LEFT JOIN colors c ON c.id = p.color_id
     LEFT JOIN image_assets ia ON ia.id = p.cover_image_id
     ORDER BY p.updated_at DESC`
  );
  return rows;
}

export async function createProduct(data: {
  title: string;
  price: number;
  model_id?: number | null;
  color_id?: number | null;
  paid_amount?: number | null;
  order_number?: string | null;
  cover_image_id?: number | null;
  image_ids?: number[];
  status?: string;
}): Promise<ProductWithRelations> {
  const shareToken = generateShareToken();
  const { rows } = await query(
    `INSERT INTO products (title, price, model_id, color_id, paid_amount, order_number, cover_image_id, share_token, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id, title, price, model_id, color_id, paid_amount, order_number, cover_image_id, share_token, status`,
    [
      data.title,
      data.price,
      data.model_id ?? null,
      data.color_id ?? null,
      data.paid_amount ?? null,
      data.order_number ?? null,
      data.cover_image_id ?? null,
      shareToken,
      data.status ?? "published",
    ]
  );
  const product = rows[0] as Product;

  if (data.image_ids?.length) {
    const values = data.image_ids.map((id, idx) => `('${product.id}', ${id}, ${idx})`).join(",");
    await query(`INSERT INTO product_images (product_id, image_id, sort_order) VALUES ${values} ON CONFLICT DO NOTHING`);
  }

  const [{ rows: relRows }] = await Promise.all([
    query(
      `SELECT p.id, p.title, p.price, p.model_id, p.color_id, p.paid_amount, p.order_number, p.cover_image_id, p.share_token, p.status,
              m.name AS model_name, c.name AS color_name, ia.url AS cover_url
       FROM products p
       LEFT JOIN phone_models m ON m.id = p.model_id
       LEFT JOIN colors c ON c.id = p.color_id
       LEFT JOIN image_assets ia ON ia.id = p.cover_image_id
       WHERE p.id = $1`,
      [product.id]
    ),
  ]);

  return relRows[0];
}

export async function getProductDetail(id: string): Promise<ProductDetail | null> {
  const { rows } = await query(
    `SELECT p.id, p.title, p.price, p.model_id, p.color_id, p.paid_amount, p.order_number, p.cover_image_id, p.share_token, p.status,
            m.name AS model_name, c.name AS color_name, ia.url AS cover_url
     FROM products p
     LEFT JOIN phone_models m ON m.id = p.model_id
     LEFT JOIN colors c ON c.id = p.color_id
     LEFT JOIN image_assets ia ON ia.id = p.cover_image_id
     WHERE p.id = $1`,
    [id]
  );
  if (!rows[0]) return null;
  const product = rows[0];
  const images = await query(
    `SELECT i.id, i.url, i.model_id, i.color_id, i.alt
     FROM product_images pi
     JOIN image_assets i ON i.id = pi.image_id
     WHERE pi.product_id = $1
     ORDER BY pi.sort_order ASC`,
    [id]
  );
  return { ...(product as ProductWithRelations), images: images.rows };
}

export async function getProductByToken(token: string): Promise<ProductDetail | null> {
  const { rows } = await query(
    `SELECT p.id, p.title, p.price, p.model_id, p.color_id, p.paid_amount, p.order_number, p.cover_image_id, p.share_token, p.status,
            m.name AS model_name, c.name AS color_name, ia.url AS cover_url
     FROM products p
     LEFT JOIN phone_models m ON m.id = p.model_id
     LEFT JOIN colors c ON c.id = p.color_id
     LEFT JOIN image_assets ia ON ia.id = p.cover_image_id
     WHERE p.share_token = $1`,
    [token]
  );
  if (!rows[0]) return null;
  const product = rows[0];
  const images = await query(
    `SELECT i.id, i.url, i.model_id, i.color_id, i.alt
     FROM product_images pi
     JOIN image_assets i ON i.id = pi.image_id
     WHERE pi.product_id = $1
     ORDER BY pi.sort_order ASC`,
    [product.id]
  );
  return { ...(product as ProductWithRelations), images: images.rows };
}
