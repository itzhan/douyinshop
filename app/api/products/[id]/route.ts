import { NextResponse } from "next/server";

import { deleteProduct } from "@/lib/queries";

type Params = { id: string };

export async function DELETE(_req: Request, { params }: { params: Params | Promise<Params> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "无效的商品 ID" }, { status: 400 });
    }
    const data = await deleteProduct(id);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "删除商品失败", detail: String(error) }, { status: 500 });
  }
}
