/**
 * Review Service
 * Handles all review-related business logic
 */

import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { Image, Place, Review, ReviewImage } from "../db/schema";
import { AppError, ConflictError, DatabaseError } from "../lib/errors";
import { sanitizePlainText, sanitizeRichText } from "../lib/sanitize";
import type { CreateReviewInput } from "../routes/review/schemas";
import { ImageUploadService } from "./image-upload.service";

interface CloudflareUploadResult {
  cfImageId: string;
  filename: string;
  mimeType: string;
  fileSize: number;
}

export class ReviewService {
  /**
   * Create a review with optional images
   * Images are uploaded to Cloudflare first, then all database records
   * (Review, Image, ReviewImage) are inserted in a single transaction
   */
  static async createReview(
    userId: string,
    data: CreateReviewInput,
    images?: File[],
  ) {
    const imageUploadService = new ImageUploadService();

    try {
      const sanitizedData = {
        ...data,
        title: sanitizePlainText(data.title),
        content: sanitizeRichText(data.content),
        dogBreeds: data.dogBreeds.map((breed) => sanitizePlainText(breed)),
      };

      // Check for existing review for this user + place combo
      const existingReview = await db.query.Review.findFirst({
        where: and(
          eq(Review.userId, userId),
          eq(Review.placeId, sanitizedData.placeId),
        ),
      });

      if (existingReview) {
        throw new ConflictError("You have already reviewed this place");
      }

      // Step 1: Upload images to Cloudflare first (external API, cannot be rolled back)
      const uploadedImages: CloudflareUploadResult[] = [];

      if (images && images.length > 0) {
        for (const file of images) {
          const cfResult =
            await imageUploadService.uploadToCloudflareOnly(file);
          uploadedImages.push({
            cfImageId: cfResult.id,
            filename: file.name,
            mimeType: file.type,
            fileSize: file.size,
          });
        }
      }

      // Step 2: Insert all database records in a transaction
      const result = await db.transaction(async (tx) => {
        // Insert the review
        const [newReview] = await tx
          .insert(Review)
          .values({
            placeId: sanitizedData.placeId,
            rating: sanitizedData.rating,
            title: sanitizedData.title,
            content: sanitizedData.content,
            visitDate: new Date(sanitizedData.visitDate),
            numDogs: sanitizedData.numDogs,
            dogBreeds: sanitizedData.dogBreeds,
            userId,
          })
          .returning({ id: Review.id });

        if (!newReview) {
          throw new DatabaseError("Failed to create review");
        }

        await tx
          .update(Place)
          .set({
            reviewsCount: sql`${Place.reviewsCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(Place.id, sanitizedData.placeId));

        // Insert images and review_image junction records
        const reviewImages: { imageId: string; displayOrder: number }[] = [];

        for (let i = 0; i < uploadedImages.length; i++) {
          const img = uploadedImages[i]!;

          // Insert into Image table
          const [dbImage] = await tx
            .insert(Image)
            .values({
              id: img.cfImageId,
              cfImageId: img.cfImageId,
              filename: img.filename,
              mimeType: img.mimeType,
              fileSize: img.fileSize,
              imageType: "review_photo",
              uploadedBy: userId,
              source: "user_upload",
              isApproved: true,
              altText: sanitizedData.title,
            })
            .returning({ id: Image.id });

          if (!dbImage) {
            throw new DatabaseError("Failed to save image to database");
          }

          reviewImages.push({
            imageId: dbImage.id,
            displayOrder: i,
          });
        }

        // Insert ReviewImage junction records
        if (reviewImages.length > 0) {
          await tx.insert(ReviewImage).values(
            reviewImages.map((ri) => ({
              reviewId: newReview.id,
              imageId: ri.imageId,
              displayOrder: ri.displayOrder,
            })),
          );
        }

        return {
          reviewId: newReview.id,
          imageCount: reviewImages.length,
        };
      });

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Create review error:", error);
      throw new DatabaseError("Failed to create review", {
        originalError: error,
      });
    }
  }

  static async getDogBreeds() {
    try {
      const dogBreeds = await db.query.DogBreed.findMany({
        orderBy: (breed) => asc(breed.name),
      });

      return dogBreeds.map((breed) => breed.name);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Get dog breeds error:", error);
      throw new DatabaseError("Failed to get dog breeds", {
        originalError: error,
      });
    }
  }
}
