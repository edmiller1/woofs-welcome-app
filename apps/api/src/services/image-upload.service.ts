import { eq } from "drizzle-orm";
import type { ImageType } from "@woofs/types";
import { env } from "../config/env";
import { db } from "../db";
import { Image } from "../db/schema";
import { BadRequestError, InternalServerError } from "../lib/errors";

interface CloudflareUploadResult {
  id: string;
  filename: string;
  uploaded: string;
  requireSignedURLs: boolean;
  variants: string[];
}

interface UploadResult {
  id: string;
  cfImageId: string;
  filename: string;
  urls: {
    thumbnail: string;
    card: string;
    medium: string;
    large: string;
    full: string;
  };
}

interface UploadOptions {
  imageType: ImageType;
  uploadedBy?: string;
  uploadedByBusiness?: string;
  altText?: string;
  metadata?: Record<string, any>;
}

export class ImageUploadService {
  private readonly apiEndpoint: string;
  private readonly apiToken: string;
  private readonly deliveryUrl: string;

  constructor() {
    this.apiEndpoint = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/images/v1`;
    this.apiToken = env.CF_IMAGES_API_TOKEN!;
    this.deliveryUrl = env.CF_IMAGES_DELIVERY_URL;
  }

  /**
   * Upload a single image to Cloudflare Images AND save to database
   */
  async uploadImage(file: File, options: UploadOptions): Promise<UploadResult> {
    try {
      // Validate file
      this.validateImage(file);

      // Upload to Cloudflare Images
      const cfResult = await this.uploadToCloudflare(file);

      // Save to database
      const [dbImage] = await db
        .insert(Image)
        .values({
          cfImageId: cfResult.id,
          filename: file.name,
          mimeType: file.type,
          fileSize: file.size,
          imageType: options.imageType,
          uploadedBy: options.uploadedBy,
          uploadedByBusiness: options.uploadedByBusiness,
          altText: options.altText,
          metadata: options.metadata,
          source: options.uploadedByBusiness
            ? "business_upload"
            : "user_upload",
          isApproved: true,
        })
        .returning();

      if (!dbImage) {
        throw new InternalServerError("Failed to save image to database");
      }

      return {
        id: dbImage.id,
        cfImageId: cfResult.id,
        filename: cfResult.filename,
        urls: this.buildImageUrls(cfResult.id),
      };
    } catch (error) {
      if (
        error instanceof BadRequestError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }
      console.error("Image upload error:", error);
      throw new InternalServerError("Failed to upload image");
    }
  }

  /**
   * Upload multiple images in batches
   * Limits concurrency to avoid rate limits
   */
  async uploadMultipleImages(
    files: File[],
    options: UploadOptions,
  ): Promise<UploadResult[]> {
    const BATCH_SIZE = 5; // Upload 5 at a time
    const results: UploadResult[] = [];

    // Validate all files first
    for (const file of files) {
      this.validateImage(file);
    }

    // Process in batches
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);

      // Upload batch in parallel
      const batchResults = await Promise.all(
        batch.map((file) => this.uploadImage(file, options)),
      );

      results.push(...batchResults);

      // Optional: Add small delay between batches to be nice to the API
      if (i + BATCH_SIZE < files.length) {
        await this.delay(100); // 100ms delay
      }
    }

    return results;
  }

  /**
   * Delete image from both Cloudflare Images and database
   * Cascade deletes will handle PlaceImage and ReviewImage associations
   */
  async deleteImage(imageId: string): Promise<void> {
    try {
      // Get image from database
      const [image] = await db
        .select()
        .from(Image)
        .where(eq(Image.id, imageId))
        .limit(1);

      if (!image) {
        throw new BadRequestError("Image not found");
      }

      // Delete from Cloudflare Images
      const response = await fetch(`${this.apiEndpoint}/${image.cfImageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        console.error("Cloudflare Images delete failed:", result);
        // Continue anyway - we'll delete from DB even if CF delete fails
      }

      // Delete from database (cascade handles associations)
      await db.delete(Image).where(eq(Image.id, imageId));
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      console.error("Image delete error:", error);
      throw new InternalServerError("Failed to delete image");
    }
  }

  /**
   * Get image details from database
   */
  async getImage(imageId: string) {
    const [image] = await db
      .select()
      .from(Image)
      .where(eq(Image.id, imageId))
      .limit(1);

    if (!image) {
      throw new BadRequestError("Image not found");
    }

    return {
      ...image,
      urls: this.buildImageUrls(image.cfImageId),
    };
  }

  /**
   * Update image metadata
   */
  async updateImage(
    imageId: string,
    updates: {
      altText?: string;
      metadata?: Record<string, any>;
      isApproved?: boolean;
    },
  ) {
    const [updated] = await db
      .update(Image)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(Image.id, imageId))
      .returning();

    if (!updated) {
      throw new BadRequestError("Image not found");
    }

    return updated;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Upload file to Cloudflare Images API
   */
  private async uploadToCloudflare(
    file: File,
  ): Promise<CloudflareUploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(this.apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
      body: formData,
    });

    const result = (await response.json()) as any;

    if (!result.success) {
      console.error("Cloudflare Images upload failed:", result.errors);
      throw new InternalServerError("Failed to upload image to CDN");
    }

    return result.result;
  }

  /**
   * Build image URLs for all variants using your worker
   */
  private buildImageUrls(cfImageId: string) {
    return {
      thumbnail: `${this.deliveryUrl}/w_150,h_150,q_80,f_webp,fit_cover/${cfImageId}`,
      card: `${this.deliveryUrl}/w_400,h_300,q_85,f_webp,fit_cover/${cfImageId}`,
      medium: `${this.deliveryUrl}/w_800,h_600,q_85,f_webp,fit_scale-down/${cfImageId}`,
      large: `${this.deliveryUrl}/w_1200,h_900,q_90,f_webp,fit_scale-down/${cfImageId}`,
      full: `${this.deliveryUrl}/w_2000,h_2000,q_95,f_webp,fit_scale-down/${cfImageId}`,
    };
  }

  /**
   * Validate image file before upload
   */
  private validateImage(file: File): void {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!file) {
      throw new BadRequestError("No file provided");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestError(
        `File size exceeds 10MB limit. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new BadRequestError(
        `Invalid file type: ${file.type}. Allowed types: JPEG, PNG, WebP, AVIF`,
      );
    }

    // Validate filename (prevent directory traversal)
    if (
      file.name.includes("..") ||
      file.name.includes("/") ||
      file.name.includes("\\")
    ) {
      throw new BadRequestError("Invalid filename");
    }
  }

  /**
   * Utility: Delay helper for batch processing
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get image URL for a specific variant
   * Useful for quick URL generation
   */
  getImageUrl(
    cfImageId: string,
    variant: "thumbnail" | "card" | "medium" | "large" | "full" = "medium",
  ): string {
    const urls = this.buildImageUrls(cfImageId);
    return urls[variant];
  }

  /**
   * Batch delete multiple images
   * Useful for cleanup operations
   */
  async deleteMultipleImages(imageIds: string[]): Promise<void> {
    const BATCH_SIZE = 5;

    for (let i = 0; i < imageIds.length; i += BATCH_SIZE) {
      const batch = imageIds.slice(i, i + BATCH_SIZE);

      await Promise.all(batch.map((imageId) => this.deleteImage(imageId)));

      if (i + BATCH_SIZE < imageIds.length) {
        await this.delay(100);
      }
    }
  }
}
