import type { TransformOptions } from "./types";

export class ImageTransformer {
  /**
   * Parse transformation parameters from URL path
   * Example: /w_800,h_600,q_85,f_webp,fit_cover/image-id
   */
  parseUrlPath(pathname: string): {
    transforms: TransformOptions;
    imageId: string;
  } | null {
    const path = pathname.replace(/^\//, "");
    const slashIndex = path.indexOf("/");

    if (slashIndex === -1) return null;

    const transformString = path.substring(0, slashIndex);
    const imageId = path.substring(slashIndex + 1);

    const transforms: TransformOptions = {};
    const params = transformString.split(",");

    for (const param of params) {
      const underscoreIndex = param.indexOf("_");
      if (underscoreIndex === -1) continue;

      const key = param.substring(0, underscoreIndex);
      const value = param.substring(underscoreIndex + 1);

      switch (key) {
        case "w":
          transforms.width = parseInt(value);
          break;
        case "h":
          transforms.height = parseInt(value);
          break;
        case "q":
          transforms.quality = parseInt(value);
          break;
        case "f":
          transforms.format = value as TransformOptions["format"];
          break;
        case "fit":
          transforms.fit = value as TransformOptions["fit"];
          break;
      }
    }

    return { transforms, imageId };
  }

  /**
   * Build Cloudflare Images variant string
   * Format: width=800,height=600,fit=cover,quality=85,format=webp
   */
  buildVariantString(options: TransformOptions): string {
    const parts: string[] = [];

    if (options.width) parts.push(`width=${options.width}`);
    if (options.height) parts.push(`height=${options.height}`);
    if (options.fit) parts.push(`fit=${options.fit}`);
    if (options.quality) parts.push(`quality=${options.quality}`);
    if (options.format && options.format !== "auto") {
      parts.push(`format=${options.format}`);
    }

    return parts.join(",");
  }

  /**
   * Validate transformation parameters
   */
  validateParams(options: TransformOptions): {
    valid: boolean;
    error?: string;
  } {
    const { width, height, quality, format, fit } = options;

    if (width && (width < 1 || width > 9999)) {
      return { valid: false, error: "Width must be between 1 and 9999" };
    }

    if (height && (height < 1 || height > 9999)) {
      return { valid: false, error: "Height must be between 1 and 9999" };
    }

    if (quality && (quality < 1 || quality > 100)) {
      return { valid: false, error: "Quality must be between 1 and 100" };
    }

    const validFormats = ["webp", "jpeg", "png", "avif", "auto"];
    if (format && !validFormats.includes(format)) {
      return {
        valid: false,
        error: `Format must be one of: ${validFormats.join(", ")}`,
      };
    }

    const validFits = ["scale-down", "contain", "cover", "crop", "pad"];
    if (fit && !validFits.includes(fit)) {
      return {
        valid: false,
        error: `Fit must be one of: ${validFits.join(", ")}`,
      };
    }

    return { valid: true };
  }
}
