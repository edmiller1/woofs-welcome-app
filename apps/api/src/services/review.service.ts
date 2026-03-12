/**
 * Review Service
 * Handles all review-related business logic
 */

import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { Image, Place, Review, ReviewImage } from "../db/schema";
import {
  AppError,
  ConflictError,
  DatabaseError,
  NotFoundError,
} from "../lib/errors";
import { sanitizePlainText, sanitizeRichText } from "../lib/sanitize";
import type {
  CreateReviewInput,
  UpdateReviewInput,
} from "../routes/review/schemas";
import { ImageUploadService } from "./image-upload.service";
import type { AnyDb } from "../db";

interface CloudflareUploadResult {
  cfImageId: string;
  filename: string;
  mimeType: string;
  fileSize: number;
}

export class ReviewService {
  constructor(
    private db: AnyDb,
    private imageUploadService: ImageUploadService,
  ) {}
  /**
   * Create a review with optional images
   * Images are uploaded to Cloudflare first, then all database records
   * (Review, Image, ReviewImage) are inserted in a single transaction
   */
  async createReview(userId: string, data: CreateReviewInput, images?: File[]) {
    try {
      const sanitizedData = {
        ...data,
        title: sanitizePlainText(data.title),
        content: sanitizeRichText(data.content),
        dogBreeds: data.dogBreeds.map((breed) => sanitizePlainText(breed)),
      };

      // Check for existing review for this user + place combo
      const existingReview = await this.db.query.Review.findFirst({
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
            await this.imageUploadService.uploadToCloudflareOnly(file);
          uploadedImages.push({
            cfImageId: cfResult.id,
            filename: file.name,
            mimeType: file.type,
            fileSize: file.size,
          });
        }
      }

      // Step 2: Insert all database records in a transaction
      const result = await this.db.transaction(async (tx) => {
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

  async getDogBreeds() {
    try {
      const dogBreeds = await this.db.query.DogBreed.findMany({
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

  async updateReview(
    userId: string,
    reviewId: string,
    data: UpdateReviewInput,
    newImages?: File[],
    deletedImages?: string[],
  ) {
    try {
      const sanitizedData = {
        ...data,
        title: sanitizePlainText(data.title),
        content: sanitizeRichText(data.content),
        dogBreeds: data.dogBreeds.map((breed) => sanitizePlainText(breed)),
      };

      // Check if review exists and belongs to the user
      const review = await this.db.query.Review.findFirst({
        where: and(eq(Review.id, reviewId), eq(Review.userId, userId)),
        with: {
          images: true,
        },
      });

      if (!review) {
        throw new NotFoundError("Review not found");
      }

      // Upload images to Cloudflare
      const uploadedImages: CloudflareUploadResult[] = [];

      if (newImages && newImages.length > 0) {
        for (const file of newImages) {
          const cfresult =
            await this.imageUploadService.uploadToCloudflareOnly(file);
          uploadedImages.push({
            cfImageId: cfresult.id,
            filename: file.name,
            mimeType: file.type,
            fileSize: file.size,
          });
        }
      }

      // Update review, add new images, delete images in a transaction
      const result = await this.db.transaction(async (tx) => {
        // Update review
        const [updatedreview] = await tx
          .update(Review)
          .set({
            title: sanitizedData.title,
            content: sanitizedData.content,
            rating: sanitizedData.rating,
            numDogs: sanitizedData.numDogs,
            dogBreeds: sanitizedData.dogBreeds,
            visitDate: sanitizedData.visitDate,
          })
          .returning({ id: Review.id })
          .where(eq(Review.id, reviewId));

        if (!updatedreview) {
          throw new DatabaseError("Failed to update review");
        }

        const numImages = review.images.length;

        // insert images
        const newReviewImages: { imageId: string; displayOrder: number }[] = [];

        for (let i = 0; i < uploadedImages.length; i++) {
          const img = uploadedImages[i]!;

          //Insert into Image table
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

          newReviewImages.push({
            imageId: dbImage.id,
            displayOrder: numImages + i,
          });
        }

        // Insert ReviewImage junction records
        if (newReviewImages.length > 0) {
          await tx.insert(ReviewImage).values(
            newReviewImages.map((ri) => ({
              reviewId: review.id,
              imageId: ri.imageId,
              displayOrder: ri.displayOrder,
            })),
          );
        }

        if (deletedImages && deletedImages.length > 0) {
          for (const imageId of deletedImages) {
            const [deleted] = await tx
              .delete(ReviewImage)
              .where(
                and(
                  eq(ReviewImage.reviewId, review.id),
                  eq(ReviewImage.imageId, imageId),
                ),
              )
              .returning({ id: ReviewImage.id });

            if (!deleted) {
              throw new DatabaseError("Failed to delete image from database");
            }
          }
        }

        return {
          reviewId: review.id,
        };
      });

      if (deletedImages && deletedImages.length > 0) {
        for (const imageId of deletedImages) {
          await this.imageUploadService.deleteImage(imageId);
        }
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Update review error:", error);
      throw new DatabaseError("Failed to update review", {
        originalError: error,
      });
    }
  }

  async deleteReview(userId: string, reviewId: string) {
    try {
      //Check if review exists and belongs to the user
      const review = await this.db.query.Review.findFirst({
        where: and(eq(Review.id, reviewId), eq(Review.userId, userId)),
        with: {
          images: {
            with: {
              image: true,
            },
          },
        },
      });

      if (!review) {
        throw new NotFoundError("Review not found");
      }

      const cfImageIds = review.images.map((ri) => ri.image.cfImageId);

      await this.db.transaction(async (tx) => {
        // Cascade handles ReviewImage cleanup
        await tx.delete(Review).where(eq(Review.id, reviewId));

        // Manually clean up Image records
        if (cfImageIds.length > 0) {
          await tx.delete(Image).where(inArray(Image.cfImageId, cfImageIds));
        }
      });

      // Only after DB transaction succeeds
      for (const cfImageId of cfImageIds) {
        await this.imageUploadService.deleteImage(cfImageId);
      }

      return { isSuccess: true };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Delete review error:", error);
      throw new DatabaseError("Failed to delete review", {
        originalError: error,
      });
    }
  }
}
