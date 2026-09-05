import { count } from "drizzle-orm";
import type { Db } from "../db";
import { Collection, Location, Place, Review, user } from "../db/schema";
import { AppError, DatabaseError } from "../lib/errors";

/**
 * App Service
 *
 * Handles application-level operations and business logic.
 *
 */

export class AppService {
  constructor(private db: Db) {}

  async getAppStats() {
    try {
      const [mau, totalPlaces, totalReviews, totalCollections, totalLocations] =
        await Promise.all([
          await this.db.select({ count: count() }).from(user),
          await this.db.select({ count: count() }).from(Place),
          await this.db.select({ count: count() }).from(Review),
          await this.db.select({ count: count() }).from(Collection),
          await this.db.select({ count: count() }).from(Location),
        ]);

      return {
        monthlyActiveUsers: mau[0]?.count ?? 0,
        totalPlaces: totalPlaces[0]?.count ?? 0,
        totalReviews: totalReviews[0]?.count ?? 0,
        totalCollections: totalCollections[0]?.count ?? 0,
        totalLocations: totalLocations[0]?.count ?? 0,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new DatabaseError("Failed to get places sum", {
        originalError: error,
      });
    }
  }
}
