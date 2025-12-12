import { NextResponse } from "next/server";

import { deleteColor } from "@/lib/queries";

type Params = { id: string };

export async function DELETE(_req: Request, { params }: { params: Params | Promise<Params> }) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "无效的颜色 ID" }, { status: 400 });
    }
    const data = await deleteColor(id);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "删除颜色失败", detail: String(error) }, { status: 500 });
  }
}
