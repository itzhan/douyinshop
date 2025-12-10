import { NextRequest, NextResponse } from "next/server";
import { getProductDetail } from "@/lib/queries";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProductDetail(id);
  if (!data) return NextResponse.json({ error: "未找到商品" }, { status: 404 });
  return NextResponse.json({ data });
}
