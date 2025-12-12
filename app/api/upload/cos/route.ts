import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { getCosClient, getCosPublicUrl } from "@/lib/cos";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const dir = (formData.get("dir") as string) || "";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "请提供待上传的文件" }, { status: 400 });
    }
    if (!process.env.COS_BUCKET || !process.env.COS_REGION) {
      return NextResponse.json({ error: "缺少 COS_BUCKET / COS_REGION 环境变量" }, { status: 500 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
    const safeDir = dir.replace(/^\/+|\/+$/g, "").replace(/\/{2,}/g, "/");
    const keyBase = `${Date.now()}-${randomUUID()}`;
    const basePrefix = "douyin"; // 统一前缀
    const fullDir = [basePrefix, safeDir].filter(Boolean).join("/");
    const key = `${fullDir ? `${fullDir}/` : ""}${keyBase}${ext ? `.${ext}` : ""}`;

    const cos = getCosClient();
    await new Promise((resolve, reject) => {
      cos.putObject(
        {
          Bucket: process.env.COS_BUCKET!,
          Region: process.env.COS_REGION!,
          Key: key,
          Body: buffer,
          ContentLength: buffer.length,
        },
        (err: Error | null) => {
          if (err) reject(err);
          else resolve(null);
        }
      );
    });

    const url = getCosPublicUrl(key);
    return NextResponse.json({ url, key });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
