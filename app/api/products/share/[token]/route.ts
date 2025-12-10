import { NextRequest, NextResponse } from "next/server";
import { getProductByToken } from "@/lib/queries";

export async function GET(_: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getProductByToken(token);
  if (!data) return NextResponse.json({ error: "未找到商品" }, { status: 404 });
  return NextResponse.json({ data });
}
