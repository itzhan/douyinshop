import COS from "cos-nodejs-sdk-v5";

let client: COS | null = null;

export function getCosClient() {
  if (client) return client;
  const secretId = process.env.COS_SECRET_ID;
  const secretKey = process.env.COS_SECRET_KEY;
  if (!secretId || !secretKey) {
    throw new Error("缺少 COS_SECRET_ID / COS_SECRET_KEY 环境变量");
  }
  // 基础格式校验，便于提前发现错误拷贝
  if (!/^AKID[A-Za-z0-9]{12,}$/.test(secretId.trim())) {
    throw new Error("COS_SECRET_ID 格式不正确，应以 AKID 开头且无空格/引号");
  }
  if (secretKey.trim().length < 16) {
    throw new Error("COS_SECRET_KEY 似乎不正确，请重新从腾讯云控制台复制");
  }
  client = new COS({
    SecretId: secretId.trim(),
    SecretKey: secretKey.trim(),
  });
  return client;
}

export function getCosPublicUrl(key: string) {
  const bucket = process.env.COS_BUCKET;
  const region = process.env.COS_REGION;
  if (!bucket || !region) throw new Error("缺少 COS_BUCKET / COS_REGION 环境变量");
  if (process.env.COS_CDN_DOMAIN) {
    return `https://${process.env.COS_CDN_DOMAIN.replace(/\/$/, "")}/${key}`;
  }
  return `https://${bucket}.cos.${region}.myqcloud.com/${key}`;
}
