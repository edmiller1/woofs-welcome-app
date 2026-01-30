// Image transformation presets
export const IMAGE_VARIANTS = {
  thumbnail: { width: 150, height: 150, quality: 80, fit: "cover" as const },
  avatar: { width: 200, height: 200, quality: 85, fit: "cover" as const },
  card: { width: 400, height: 300, quality: 85, fit: "cover" as const },
  hero: { width: 1200, height: 400, quality: 90, fit: "cover" as const },
  medium: { width: 800, height: 600, quality: 85, fit: "scale-down" as const },
  large: { width: 1200, height: 900, quality: 90, fit: "scale-down" as const },
  full: { width: 2000, height: 2000, quality: 95, fit: "scale-down" as const },
} as const;

export type ImageVariant = keyof typeof IMAGE_VARIANTS;

// Supported formats
export const SUPPORTED_FORMATS = [
  "webp",
  "jpeg",
  "png",
  "avif",
  "auto",
] as const;
export type ImageFormat = (typeof SUPPORTED_FORMATS)[number];

// Image CDN base URL
export const IMAGE_CDN_URL = "https://images.woofswelcome.app";

/**
 * Build optimized image URL with transformations
 * @example
 * buildImageUrl('3cbb3af7-1364-4694-0c57-562797b9be00', 'medium')
 * // Returns: https://images.woofswelcome.app/w_800,h_600,q_85,f_auto,fit_scale-down/{imageId}
 */
export function buildImageUrl(
  imageId: string,
  variant: ImageVariant = "medium",
  format: ImageFormat = "auto",
): string {
  const config = IMAGE_VARIANTS[variant];

  const params = [
    `w_${config.width}`,
    `h_${config.height}`,
    `q_${config.quality}`,
    `f_${format}`,
    `fit_${config.fit}`,
  ].join(",");

  return `${IMAGE_CDN_URL}/${params}/${imageId}`;
}

/**
 * Build responsive srcset for <img> tags
 * @example
 * <img
 *   src={buildImageUrl(imageId, 'medium')}
 *   srcset={buildResponsiveSrcSet(imageId)}
 *   sizes="(max-width: 768px) 100vw, 50vw"
 * />
 */
export function buildResponsiveSrcSet(
  imageId: string,
  variants: ImageVariant[] = ["thumbnail", "card", "medium", "large"],
  format: ImageFormat = "auto",
): string {
  return variants
    .map((variant) => {
      const url = buildImageUrl(imageId, variant, format);
      const width = IMAGE_VARIANTS[variant].width;
      return `${url} ${width}w`;
    })
    .join(", ");
}

/**
 * Build custom transformation URL for non-standard sizes
 * @example
 * buildCustomImageUrl('image-id', { width: 600, height: 400, quality: 90 })
 */
export function buildCustomImageUrl(
  imageId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: ImageFormat;
    fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
  },
): string {
  const {
    width,
    height,
    quality = 85,
    format = "auto",
    fit = "scale-down",
  } = options;

  const params: string[] = [];

  if (width) params.push(`w_${width}`);
  if (height) params.push(`h_${height}`);
  params.push(`q_${quality}`);
  params.push(`f_${format}`);
  params.push(`fit_${fit}`);

  return `${IMAGE_CDN_URL}/${params.join(",")}/${imageId}`;
}

/**
 * Generate low-quality placeholder for progressive loading
 * @example
 * const placeholder = getPlaceholderUrl(imageId);
 * // Returns tiny blurred version for fast initial load
 */
export function getPlaceholderUrl(imageId: string): string {
  return buildCustomImageUrl(imageId, {
    width: 20,
    quality: 30,
    format: "jpeg",
  });
}

/**
 * Cloudflare Images API configuration
 */
export const CF_IMAGES_CONFIG = {
  accountId: "08e981cecb92746f1f2cf59ac9969f40",
  deliveryUrl: IMAGE_CDN_URL,
  apiEndpoint: (accountId: string) =>
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
} as const;
