/**
 * Review Service
 * Handles all review-related business logic
 */

import { and, asc, eq, inArray, sql } from "drizzle-orm";
import {
  Image,
  Place,
  Review,
  ReviewImage,
  ReviewLike,
  ReviewReport,
  user,
} from "../db/schema";
import {
  AppError,
  ConflictError,
  DatabaseError,
  NotFoundError,
} from "../lib/errors";
import { sanitizePlainText, sanitizeRichText } from "../lib/sanitize";
import type {
  CreateReviewInput,
  ReportReviewInput,
  UpdateReviewInput,
} from "../routes/review/schemas";
import { ImageUploadService } from "./image-upload.service";
import type { AnyDb } from "../db";
import { sendDiscordReportNotification } from "../lib/discord";
import type { Env } from "../config/env";
import { buildImageUrl } from "@woofs/image-config";

interface CloudflareUploadResult {
  cfImageId: string;
  filename: string;
  mimeType: string;
  fileSize: number;
}

export class ReviewService {
  constructor(
    private db: AnyDb,
    private env: Env,
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

  async getReview(reviewId: string, userId?: string) {
    try {
      const review = await this.db.query.Review.findFirst({
        where: eq(Review.id, reviewId),
        with: {
          images: true,
          likes: true,
          replies: true,
          reports: true,
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
              profileImageId: true,
            },
          },
        },
      });

      if (!review) {
        throw new NotFoundError("Review not found");
      }

      return {
        ...review,
        isOwner: userId ? review.userId === userId : false,
        hasLiked: userId
          ? review.likes.some((like) => like.userId === userId)
          : false,
        hasReported: userId
          ? review.reports.some((report) => report.userId === userId)
          : false,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Get review error:", error);
      throw new DatabaseError("Failed to get review", {
        originalError: error,
      });
    }
  }

  async reportReview(
    userId: string,
    reviewId: string,
    reportData: ReportReviewInput,
  ) {
    try {
      const userRecord = await this.db.query.user.findFirst({
        where: eq(user.id, userId),
      });

      if (!userRecord) {
        throw new NotFoundError("User not found");
      }

      const review = await this.db.query.Review.findFirst({
        where: eq(Review.id, reviewId),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              createdAt: true,
            },
          },
          place: {
            columns: {
              id: true,
              name: true,
              countryCode: true,
            },
            with: {
              images: {
                limit: 1,
              },
            },
          },
        },
      });

      if (!review) {
        throw new NotFoundError("Review not found");
      }

      if (review.userId === userId) {
        throw new ConflictError("You cannot report your own review");
      }

      const existingReport = await this.db.query.ReviewReport.findFirst({
        where: and(
          eq(ReviewReport.reviewId, review.id),
          eq(ReviewReport.userId, userId),
        ),
      });

      if (existingReport) {
        throw new ConflictError("You have already reported this review");
      }

      const sanitizedReport = {
        reason: sanitizePlainText(reportData.reason),
        details: sanitizeRichText(reportData.details || ""),
      };

      const [newReport] = await this.db
        .insert(ReviewReport)
        .values({
          userId: userId,
          reviewId: review.id,
          reason: sanitizedReport.reason,
          details: sanitizedReport.details,
          status: "pending",
          reviewedAt: new Date(),
          reviewedBy: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: ReviewReport.id });

      if (!newReport) {
        throw new DatabaseError("Failed to create review report");
      }

      // send discord notification
      await sendDiscordReportNotification(this.env, {
        content: "@here **New Report** ‼️",
        embeds: [
          {
            title: "‼️ New Review Report",
            description: `A new review report has been submitted by ${userRecord.name}`,
            color: 0x00ff00,
            fields: [
              {
                name: "Report ID",
                value: newReport.id,
                inline: true,
              },
              {
                name: "Report Reason",
                value: sanitizedReport.reason,
                inline: true,
              },
              {
                name: "Report Details",
                value: sanitizedReport.details,
                inline: true,
              },
              {
                name: "Review ID",
                value: review.id,
                inline: true,
              },
              {
                name: "Review Title",
                value: review.title,
                inline: true,
              },
              {
                name: "Review Details",
                value: `${review.user.name} reviewed ${review.place.name} on ${review.createdAt.toDateString()}`,
                inline: true,
              },
              {
                name: "Place",
                value: `${review.place.name}, ${review.place.countryCode}`,
                inline: true,
              },
            ],
          },
        ],
        timestamp: new Date().toISOString(),
        thumbnail: {
          url: buildImageUrl(review.place.images[0]!.imageId, "thumbnail"),
        },
        footer: {
          text: "Woofs Welcome",
        },
      });

      return {
        success: true,
        message: "Report submitted successfully",
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Report review error:", error);
      throw new DatabaseError("Failed to report review", {
        originalError: error,
      });
    }
  }

  async likeReview(reviewId: string, userId: string) {
    try {
      const review = await this.db.query.Review.findFirst({
        where: eq(Review.id, reviewId),
      });

      if (!review) {
        throw new NotFoundError("Review not found");
      }

      if (review.userId === userId) {
        throw new ConflictError("You cannot like your own review");
      }

      const reviewLike = await this.db.query.ReviewLike.findFirst({
        where: and(
          eq(ReviewLike.reviewId, review.id),
          eq(ReviewLike.userId, userId),
        ),
      });

      if (reviewLike) {
        //delete reviewLike
        // remove like from likes-count
        const result = await this.db.transaction(async (tx) => {
          await tx.delete(ReviewLike).where(eq(ReviewLike.id, reviewLike.id));
          await tx
            .update(Review)
            .set({
              likesCount: sql`${Review.likesCount} - 1`,
            })
            .where(eq(Review.id, review.id));
        });

        return {
          success: true,
          action: "unlike",
        };
      } else {
        // insert reviewLike
        // add like to likes-count
        await this.db.transaction(async (tx) => {
          await tx.insert(ReviewLike).values({
            reviewId: review.id,
            userId: userId,
          });
          await tx
            .update(Review)
            .set({
              likesCount: sql`${Review.likesCount} + 1`,
            })
            .where(eq(Review.id, review.id));
        });

        return {
          success: true,
          action: "like",
        };
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Like/unlike review error:", error);
      throw new DatabaseError("Failed to like/unlike review", {
        originalError: error,
      });
    }
  }
}
