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

export const collectionRouter = new Hono();

collectionRouter.get("/collections", authMiddleware, async (c) => {
  const auth = c.get("user");

  if (!auth) {
    throw new UnauthorizedError("Unauthorized");
  }

  const result = await CollectionService.getCollections(auth.id);

  return c.json(result, 200);
});

collectionRouter.post(
  "/create",
  authMiddleware,
  zValidator("json", createCollectionSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { name, description } = c.req.valid("json");

    const result = await CollectionService.createCollection(
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
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { placeId, collectionId } = c.req.valid("json");

    const result = await CollectionService.savePlaceToCollection(
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
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { placeId, collectionId } = c.req.valid("json");

    const result = await CollectionService.removePlaceFromCollection(
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
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { placeId } = c.req.valid("param");

    const result = await CollectionService.isPlaceSaved(placeId, auth.id);

    return c.json(result, 200);
  },
);

collectionRouter.get(
  "/place-collections/:placeId",
  authMiddleware,
  zValidator("param", placeIdSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { placeId } = c.req.valid("param");

    const result = await CollectionService.getPlaceCollections(
      placeId,
      auth.id,
    );

    return c.json(result, 200);
  },
);
