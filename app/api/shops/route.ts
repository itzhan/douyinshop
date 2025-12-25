import { NextResponse } from "next/server";

import { createShop, listShops } from "@/lib/queries";

const parseTemplates = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(value.map((item) => String(item).trim()).filter((item) => item.length > 0))
  );
};

export async function GET() {
  const data = await listShops();
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "name 必填" }, { status: 400 });
    }
    const templates = parseTemplates(body.title_templates);
    const data = await createShop(body.name, templates);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "创建店铺失败", detail: String(error) }, { status: 500 });
  }
}
