import { NextResponse } from "next/server";
import { createImages, listImages } from "@/lib/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const modelId = searchParams.get("modelId");
  const colorId = searchParams.get("colorId");
  const data = await listImages(modelId ? Number(modelId) : undefined, colorId ? Number(colorId) : undefined);
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const urls: string[] = body.urls;
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "urls 必须是非空数组" }, { status: 400 });
    }
    const modelId = body.model_id ? Number(body.model_id) : undefined;
    const colorId = body.color_id ? Number(body.color_id) : undefined;
    const data = await createImages(urls, modelId, colorId, body.alt);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "新增图片失败", detail: String(error) }, { status: 500 });
  }
}
