import { NextResponse } from "next/server";
import { createModel, listModels } from "@/lib/queries";

export async function GET() {
  const data = await listModels();
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "name 必填" }, { status: 400 });
    }
    const model = await createModel(body.name, body.brand);
    return NextResponse.json({ data: model });
  } catch (error) {
    return NextResponse.json({ error: "创建型号失败", detail: String(error) }, { status: 500 });
  }
}
