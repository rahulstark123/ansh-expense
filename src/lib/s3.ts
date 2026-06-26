import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || "ansh-expense";

const storagePrefix = (process.env.S3_STORAGE_PREFIX || "")
  .replace(/^\/+|\/+$/g, "");

export const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || "auto",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

export function isS3Configured(): boolean {
  return Boolean(
    process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      process.env.S3_ENDPOINT &&
      BUCKET_NAME
  );
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_");
}

export function buildReceiptObjectKey(wid: number, filename: string): string {
  const relativeKey = `receipts/${wid}/${Date.now()}_${sanitizeFilename(filename)}`;
  return storagePrefix ? `${storagePrefix}/${relativeKey}` : relativeKey;
}

export function getPublicUrl(key: string): string {
  const publicBase = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (publicBase) {
    return `${publicBase}/${key}`;
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  return `${siteUrl}/api/files?key=${encodeURIComponent(key)}`;
}

export function isAllowedObjectKey(key: string): boolean {
  if (!key || key.includes("..")) return false;

  const allowedRoots = storagePrefix
    ? [`${storagePrefix}/receipts/`]
    : ["receipts/"];

  return allowedRoots.some((root) => key.startsWith(root));
}

export async function getObjectBytes(key: string): Promise<{
  bytes: Uint8Array;
  contentType: string | undefined;
}> {
  const result = await s3Client.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );

  if (!result.Body) {
    throw new Error("Empty object body");
  }

  return {
    bytes: await result.Body.transformToByteArray(),
    contentType: result.ContentType,
  };
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}
