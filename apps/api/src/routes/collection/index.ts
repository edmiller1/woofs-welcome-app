import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { UnauthorizedError } from "../../lib/errors";
import { zValidator } from "@hono/zod-validator";
import {
  createCollectionSchema,
  savePlaceToCollectionSchema,
  removePlaceFromCollectionSchema,
  placeIdSchema,
} from "./schemas";
import { CollectionService } from "../../services/collection.service";
import { ImageUploadService } from "../../services/image-upload.service";

export const collectionRouter = new Hono();

collectionRouter.get("/collections", authMiddleware, async (c) => {
  //Context
  const auth = c.get("user");
  const db = c.get("db");
  const env = c.get("env");

  // Services
  const imageUploadService = new ImageUploadService(db, env);
  const collectionService = new CollectionService(db, imageUploadService);

  if (!auth) {
    throw new UnauthorizedError("Unauthorized");
  }

  const result = await collectionService.getCollections(auth.id);

  return c.json(result, 200);
});

collectionRouter.post(
  "/create",
  authMiddleware,
  zValidator("json", createCollectionSchema),
  async (c) => {
    //Context
    const auth = c.get("user");
    const db = c.get("db");
    const env = c.get("env");

    // Services
    const imageUploadService = new ImageUploadService(db, env);
    const collectionService = new CollectionService(db, imageUploadService);

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { name, description } = c.req.valid("json");

    const result = await collectionService.createCollection(
      auth.id,
      name,
      description,
    );

    return c.json(result, 200);
  },
);

collectionRouter.post(
  "/save-place",
  authMiddleware,
  zValidator("json", savePlaceToCollectionSchema),
  async (c) => {
    //Context
    const auth = c.get("user");
    const db = c.get("db");
    const env = c.get("env");

    // Services
    const imageUploadService = new ImageUploadService(db, env);
    const collectionService = new CollectionService(db, imageUploadService);

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { placeId, collectionId } = c.req.valid("json");

    const result = await collectionService.savePlaceToCollection(
      placeId,
      auth.id,
      collectionId,
    );

    return c.json(result, 200);
  },
);

collectionRouter.post(
  "/remove-place",
  authMiddleware,
  zValidator("json", removePlaceFromCollectionSchema),
  async (c) => {
    //Context
    const auth = c.get("user");
    const db = c.get("db");
    const env = c.get("env");

    // Services
    const imageUploadService = new ImageUploadService(db, env);
    const collectionService = new CollectionService(db, imageUploadService);

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { placeId, collectionId } = c.req.valid("json");

    const result = await collectionService.removePlaceFromCollection(
      placeId,
      auth.id,
      collectionId,
    );

    return c.json(result, 200);
  },
);

collectionRouter.get(
  "/is-saved/:placeId",
  authMiddleware,
  zValidator("param", placeIdSchema),
  async (c) => {
    //Context
    const auth = c.get("user");
    const db = c.get("db");
    const env = c.get("env");

    // Services
    const imageUploadService = new ImageUploadService(db, env);
    const collectionService = new CollectionService(db, imageUploadService);

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { placeId } = c.req.valid("param");

    const result = await collectionService.isPlaceSaved(placeId, auth.id);

    return c.json(result, 200);
  },
);

collectionRouter.get(
  "/place-collections/:placeId",
  authMiddleware,
  zValidator("param", placeIdSchema),
  async (c) => {
    //Context
    const auth = c.get("user");
    const db = c.get("db");
    const env = c.get("env");

    // Services
    const imageUploadService = new ImageUploadService(db, env);
    const collectionService = new CollectionService(db, imageUploadService);

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { placeId } = c.req.valid("param");

    const result = await collectionService.getPlaceCollections(
      placeId,
      auth.id,
    );

    return c.json(result, 200);
  },
);
