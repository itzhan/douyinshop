declare module "cos-nodejs-sdk-v5" {
  type UploadParams = {
    Bucket: string;
    Region: string;
    Key: string;
    Body: Buffer | Blob | string;
    ContentLength?: number;
  };

  export default class COS {
    constructor(config: { SecretId: string; SecretKey: string });
    putObject(params: UploadParams, cb: (err: Error | null, data?: any) => void): void;
  }
}
