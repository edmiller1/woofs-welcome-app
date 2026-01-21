import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { buildImageUrl } from "@woofs/image-config";
import type { ImageType } from "@woofs/types";
import { ImageUploadService } from "../../services/image-upload.service";
import { authMiddleware } from "../../middleware/auth";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../../lib/errors";
import { zValidator } from "@hono/zod-validator";
import {
  attachImageToPlaceSchema,
  attachImageToReviewSchema,
  attachImageToUserProfileSchema,
  uploadImageSchema,
  uploadMultipleImagesSchema,
} from "./schemas";
import { db } from "../../db";
import {
  Image,
  Place,
  PlaceImage,
  Review,
  ReviewImage,
  user,
} from "../../db/schema";

export const imageRouter = new Hono();
const imageUploadService = new ImageUploadService();

// ============================================================================
// SINGLE IMAGE UPLOAD
// ============================================================================

/**
 * POST /images/upload
 * Upload a single image
 *
 * Body (multipart/form-data):
 *   - file: File (required)
 *   - imageType: string (required) - "place_hero", "review_photo", "user_avatar", etc.
 *   - altText: string (optional)
 *   - metadata: JSON string (optional)
 */
imageRouter.post(
  "/upload",
  authMiddleware,
  zValidator("form", uploadImageSchema),
  async (c) => {
    try {
      const auth = c.get("user");

      if (!auth) {
        throw new UnauthorizedError("Unauthorized");
      }

      const userRecord = await db.query.user.findFirst({
        where: eq(user.id, auth.id),
      });

      if (!userRecord) {
        return c.json({ error: "User not found" }, 404);
      }

      const { file, imageType, altText, metadata } = c.req.valid("form");

      // Validate file
      if (!file || !(file instanceof File)) {
        return c.json({ error: "No file provided" }, 400);
      }

      if (!imageType) {
        return c.json({ error: "imageType is required" }, 400);
      }

      const validTypes = [
        "place_hero",
        "place_gallery",
        "review_photo",
        "user_avatar",
        "business_logo",
      ];
      if (!validTypes.includes(imageType)) {
        return c.json(
          {
            error: `Invalid imageType. Must be one of: ${validTypes.join(", ")}`,
          },
          400,
        );
      }

      // Determine if this is a business upload
      const uploadedByBusiness =
        userRecord.activeContext === "business"
          ? userRecord.activeBusinessId!
          : undefined;

      const validImageType = imageType as ImageType;

      // Upload image
      const result = await imageUploadService.uploadImage(file, {
        imageType: validImageType,
        uploadedBy: userRecord.id,
        uploadedByBusiness,
        altText,
        metadata,
      });

      return c.json({
        success: true,
        data: {
          id: result.id,
          cfImageId: result.cfImageId,
          filename: result.filename,
          urls: result.urls,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      return c.json(
        {
          error:
            error instanceof Error ? error.message : "Failed to upload image",
        },
        500,
      );
    }
  },
);

// ============================================================================
// MULTIPLE IMAGES UPLOAD
// ============================================================================

/**
 * POST /images/upload-multiple
 * Upload multiple images (max 20)
 *
 * Body (multipart/form-data):
 *   - file0, file1, file2... : Files (required, max 20)
 *   - imageType: string (required)
 *   - altText: string (optional)
 *   - metadata: JSON string (optional)
 */
imageRouter.post(
  "/upload-multiple",
  authMiddleware,
  zValidator("form", uploadMultipleImagesSchema),
  async (c) => {
    try {
      const auth = c.get("user");

      if (!auth) {
        throw new UnauthorizedError("Unauthorized");
      }

      const userRecord = await db.query.user.findFirst({
        where: eq(user.id, auth.id),
      });

      if (!userRecord) {
        return c.json({ error: "User not found" }, 404);
      }

      const { files, imageType, altText, metadata } = c.req.valid("form");

      if (!files || !(files instanceof File)) {
        throw new BadRequestError("No files provided");
      }

      if (files.length === 0) {
        throw new BadRequestError("No files provided");
      }

      if (files.length > 20) {
        throw new BadRequestError("Maximum 20 files allowed per upload");
      }

      if (files.length === 0) {
        return c.json({ error: "No files provided" }, 400);
      }

      if (files.length > 20) {
        return c.json({ error: "Maximum 20 files allowed per upload" }, 400);
      }

      // Validate imageType
      if (!imageType) {
        throw new BadRequestError("imageType is required");
      }

      const uploadedByBusiness =
        userRecord.activeContext === "business"
          ? userRecord.activeBusinessId!
          : undefined;

      const validImageType = imageType as ImageType;

      // Upload all images
      const results = await Promise.all(
        files.map((file) =>
          imageUploadService.uploadImage(file, {
            imageType: validImageType,
            uploadedBy: userRecord.id,
            uploadedByBusiness,
            altText,
            metadata,
          }),
        ),
      );

      return c.json({
        success: true,
        data: results.map((result) => ({
          id: result.id,
          cfImageId: result.cfImageId,
          filename: result.filename,
          urls: result.urls,
        })),
      });
    } catch (error) {
      console.error("Multiple upload error:", error);
      return c.json(
        {
          error:
            error instanceof Error ? error.message : "Failed to upload images",
        },
        500,
      );
    }
  },
);

// ============================================================================
// ATTACH IMAGE TO PLACE
// ============================================================================

/**
 * POST /images/place/:placeId
 * Attach an uploaded image to a place
 *
 * Body:
 *   - imageId: string (required) - ID from the Image table
 *   - isPrimary: boolean (optional)
 *   - caption: string (optional)
 *   - displayOrder: number (optional)
 */
imageRouter.post(
  "/place/:placeId",
  authMiddleware,
  zValidator("json", attachImageToPlaceSchema),
  async (c) => {
    try {
      const auth = c.get("user");

      if (!auth) {
        throw new UnauthorizedError("Unauthorized");
      }

      const userRecord = await db.query.user.findFirst({
        where: eq(user.id, auth.id),
      });

      if (!userRecord) {
        throw new NotFoundError("User not found");
      }

      const placeId = c.req.param("placeId");

      const {
        imageId,
        isPrimary = false,
        caption,
        displayOrder = 0,
      } = c.req.valid("json");

      if (!imageId) {
        throw new BadRequestError("imageId is required");
      }

      const place = await db.query.Place.findFirst({
        where: eq(Place.id, placeId),
      });

      if (!place) {
        return c.json({ error: "Place not found" }, 404);
      }

      const image = await db.query.Image.findFirst({
        where: eq(Image.id, imageId),
      });

      if (!image) {
        return c.json({ error: "Image not found" }, 404);
      }

      // Check authorization
      // User must either own the image or be the business that owns the place
      const isOwner = image.uploadedBy === auth.id;
      const isBusinessOwner =
        userRecord.activeContext === "business" &&
        place.claimedBy === userRecord.activeBusinessId;

      if (!isOwner && !isBusinessOwner && !user.isAdmin) {
        throw new UnauthorizedError("Unauthorized");
      }

      // If setting as primary, unset other primary images for this place
      if (isPrimary) {
        await db
          .update(PlaceImage)
          .set({ isPrimary: false })
          .where(eq(PlaceImage.placeId, placeId));
      }

      // Create place-image association
      const [placeImage] = await db
        .insert(PlaceImage)
        .values({
          placeId,
          imageId,
          isPrimary,
          caption,
          displayOrder,
        })
        .returning();

      if (!placeImage) {
        throw new InternalServerError("Failed to attach image to place");
      }

      return c.json({
        success: true,
        data: {
          id: placeImage.id,
          placeId: placeImage.placeId,
          imageId: placeImage.imageId,
          isPrimary: placeImage.isPrimary,
          displayOrder: placeImage.displayOrder,
          caption: placeImage.caption,
        },
      });
    } catch (error) {
      console.error("Attach to place error:", error);
      return c.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to attach image to place",
        },
        500,
      );
    }
  },
);

// ============================================================================
// ATTACH IMAGE TO REVIEW
// ============================================================================

/**
 * POST /images/review/:reviewId
 * Attach an uploaded image to a review
 *
 * Body:
 *   - imageId: string (required)
 *   - displayOrder: number (optional)
 */
imageRouter.post(
  "/review/:reviewId",
  authMiddleware,
  zValidator("json", attachImageToReviewSchema),
  async (c) => {
    try {
      const auth = c.get("user");

      if (!auth) {
        throw new UnauthorizedError("Unauthorized");
      }

      const userRecord = await db.query.user.findFirst({
        where: eq(user.id, auth.id),
      });

      if (!userRecord) {
        throw new NotFoundError("User not found");
      }

      const reviewId = c.req.param("reviewId");

      const { imageId, displayOrder } = c.req.valid("json");

      if (!imageId) {
        throw new BadRequestError("imageId is required");
      }

      const review = await db.query.Review.findFirst({
        where: eq(Review.id, reviewId),
      });

      if (!review) {
        return c.json({ error: "Review not found" }, 404);
      }

      if (review.userId !== auth.id && !userRecord.isAdmin) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const image = await db.query.Image.findFirst({
        where: eq(Image.id, imageId),
      });

      if (!image) {
        return c.json({ error: "Image not found" }, 404);
      }

      // Create review-image association
      const [reviewImage] = await db
        .insert(ReviewImage)
        .values({
          reviewId,
          imageId,
          displayOrder,
        })
        .returning();

      if (!reviewImage) {
        throw new InternalServerError("Failed to attach image to review");
      }

      return c.json({
        success: true,
        data: {
          id: reviewImage.id,
          reviewId: reviewImage.reviewId,
          imageId: reviewImage.imageId,
          displayOrder: reviewImage.displayOrder,
        },
      });
    } catch (error) {
      console.error("Attach to review error:", error);
      return c.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to attach image to review",
        },
        500,
      );
    }
  },
);

// ============================================================================
// SET USER PROFILE IMAGE
// ============================================================================

/**
 * POST /images/profile
 * Set user profile image
 *
 * Body:
 *   - imageId: string (required) - Must be an image of type "user_avatar"
 */
imageRouter.post(
  "/profile",
  authMiddleware,
  zValidator("json", attachImageToUserProfileSchema),
  async (c) => {
    try {
      const auth = c.get("user");

      if (!auth) {
        throw new UnauthorizedError("Unauthorized");
      }

      const { imageId } = c.req.valid("json");

      if (!imageId) {
        return c.json({ error: "imageId is required" }, 400);
      }

      // Verify image exists, is owned by user, and is correct type
      const [image] = await db
        .select()
        .from(Image)
        .where(
          and(
            eq(Image.id, imageId),
            eq(Image.uploadedBy, auth.id),
            eq(Image.imageType, "user_avatar"),
          ),
        )
        .limit(1);

      if (!image) {
        return c.json({ error: "Image not found or invalid type" }, 404);
      }

      // Update user profile
      await db
        .update(user)
        .set({ profileImageId: imageId })
        .where(eq(user.id, auth.id));

      return c.json({
        success: true,
        data: {
          imageId,
          urls: {
            thumbnail: buildImageUrl(image.cfImageId, "thumbnail"),
            medium: buildImageUrl(image.cfImageId, "medium"),
          },
        },
      });
    } catch (error) {
      console.error("Set profile image error:", error);
      return c.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to set profile image",
        },
        500,
      );
    }
  },
);

// ============================================================================
// DELETE IMAGE
// ============================================================================

/**
 * DELETE /images/:id
 * Delete an image (removes from CF Images and database)
 * Also removes all associations (place images, review images, etc.)
 */
imageRouter.delete("/:id", authMiddleware, async (c) => {
  try {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, auth.id),
    });

    if (!userRecord) {
      throw new NotFoundError("User not found");
    }

    const imageId = c.req.param("id");

    const image = await db.query.Image.findFirst({
      where: eq(Image.id, imageId),
    });

    if (!image) {
      return c.json({ error: "Image not found" }, 404);
    }

    // Check authorization
    const isOwner = image.uploadedBy === auth.id;
    const isBusinessOwner =
      userRecord.activeContext === "business" &&
      image.uploadedByBusiness === userRecord.activeBusinessId;

    if (!isOwner && !isBusinessOwner && !user.isAdmin) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    // Delete image (service handles both CF and DB)
    await imageUploadService.deleteImage(imageId);

    return c.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete image",
      },
      500,
    );
  }
});

// ============================================================================
// GET IMAGE DETAILS
// ============================================================================

/**
 * GET /images/:id
 * Get image details
 */
imageRouter.get("/:id", async (c) => {
  try {
    const imageId = c.req.param("id");

    const image = await db.query.Image.findFirst({
      where: eq(Image.id, imageId),
    });

    if (!image) {
      throw new NotFoundError("Image not found");
    }

    return c.json({
      success: true,
      data: {
        id: image.id,
        cfImageId: image.cfImageId,
        filename: image.filename,
        imageType: image.imageType,
        altText: image.altText,
        isApproved: image.isApproved,
        createdAt: image.createdAt,
        urls: {
          thumbnail: buildImageUrl(image.cfImageId, "thumbnail"),
          card: buildImageUrl(image.cfImageId, "card"),
          medium: buildImageUrl(image.cfImageId, "medium"),
          large: buildImageUrl(image.cfImageId, "large"),
          full: buildImageUrl(image.cfImageId, "full"),
        },
      },
    });
  } catch (error) {
    console.error("Get image error:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to get image",
      },
      500,
    );
  }
});
