import { NextResponse } from "next/server";

import { deleteImage, updateImage } from "@/lib/queries";

type Params = { id: string };

export async function PATCH(req: Request, { params }: { params: Params | Promise<Params> }) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "无效的图片 ID" }, { status: 400 });
    }
    const body = await req.json();
    const data = await updateImage(id, {
      model_id: body.model_id ?? null,
      color_id: body.color_id ?? null,
      alt: body.alt ?? null,
    });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "更新失败", detail: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params | Promise<Params> }) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "无效的图片 ID" }, { status: 400 });
    }
    const data = await deleteImage(id);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "删除失败", detail: String(error) }, { status: 500 });
  }
}
