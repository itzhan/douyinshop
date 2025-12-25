import { NextResponse } from "next/server";

import { deleteShop, updateShopTemplates } from "@/lib/queries";

const parseTemplates = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(value.map((item) => String(item).trim()).filter((item) => item.length > 0))
  );
};

type Params = { id: string };

export async function DELETE(_req: Request, { params }: { params: Params | Promise<Params> }) {
  try {
    const { id } = await params;
    const num = Number(id);
    if (!Number.isFinite(num)) return NextResponse.json({ error: "无效的店铺 ID" }, { status: 400 });
    const data = await deleteShop(num);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "删除店铺失败", detail: String(error) }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Params | Promise<Params> }) {
  try {
    const { id } = await params;
    const num = Number(id);
    if (!Number.isFinite(num)) return NextResponse.json({ error: "无效的店铺 ID" }, { status: 400 });
    const body = await req.json();
    if (!Array.isArray(body.title_templates)) {
      return NextResponse.json({ error: "title_templates 必须是数组" }, { status: 400 });
    }
    const templates = parseTemplates(body.title_templates);
    const data = await updateShopTemplates(num, templates);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "更新店铺模板失败", detail: String(error) }, { status: 500 });
  }
}
