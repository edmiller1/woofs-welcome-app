export interface Env {
  ALLOWED_ORIGINS: string;
  CF_ACCOUNT_HASH: string;
  CF_IMAGES_DELIVERY_URL: string;
}

export interface TransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png" | "avif" | "auto";
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
}
