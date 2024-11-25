import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

export const getOffset = (page: number, pageSize: number): number =>
  (page - 1) * pageSize;

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const encrypt = (data: string, key: Buffer): string => {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "base64");
  encrypted += cipher.final("base64");
  return `${iv.toString("base64")}:${encrypted}`;
};

export const decrypt = (data: string, key: Buffer): string => {
  const [iv, encrypted] = data.split(":");
  const decipher = createDecipheriv(
    "aes-256-cbc",
    key,
    Buffer.from(iv, "base64")
  );
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
