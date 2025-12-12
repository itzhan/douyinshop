import { NextResponse } from "next/server";

import { deleteShop } from "@/lib/queries";

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
