import { NextResponse } from "next/server";
import { createColor, listColors } from "@/lib/queries";

export async function GET() {
  const data = await listColors();
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "name 必填" }, { status: 400 });
    }
    const color = await createColor(body.name, body.hex);
    return NextResponse.json({ data: color });
  } catch (error) {
    return NextResponse.json({ error: "创建颜色失败", detail: String(error) }, { status: 500 });
  }
}
