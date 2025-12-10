import { NextResponse } from "next/server";
import { createProduct, listProducts } from "@/lib/queries";

export async function GET() {
  const data = await listProducts();
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.price) {
      return NextResponse.json({ error: "title 与 price 为必填" }, { status: 400 });
    }
    const payload = {
      title: body.title as string,
      price: Number(body.price),
      model_id: body.model_id ? Number(body.model_id) : null,
      color_id: body.color_id ? Number(body.color_id) : null,
      paid_amount: body.paid_amount ? Number(body.paid_amount) : null,
      order_number: body.order_number ?? null,
      cover_image_id: body.cover_image_id ? Number(body.cover_image_id) : null,
      image_ids: Array.isArray(body.image_ids) ? body.image_ids.map(Number) : [],
      status: body.status ?? "published",
    };
    const product = await createProduct(payload);
    return NextResponse.json({ data: product });
  } catch (error) {
    return NextResponse.json({ error: "创建商品失败", detail: String(error) }, { status: 500 });
  }
}
