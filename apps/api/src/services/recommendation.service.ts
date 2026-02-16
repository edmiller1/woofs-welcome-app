export const CATEGORY_RELATIONSHIPS: Record<string, string[]> = {
  // Food & Drink (closely related)
  Café: ["Restaurant", "Bar"],
  Restaurant: ["Café", "Bar"],
  Bar: ["Café", "Restaurant"],

  // Accommodation (closely related)
  Hotel: ["Motel", "AirBnb"],
  Motel: ["Hotel", "AirBnb"],
  AirBnb: ["Hotel", "Motel"],

  // Outdoor Recreation (nature-based)
  Park: ["Dog Park", "Beach", "Walk", "Trail"],
  "Dog Park": ["Park", "Beach", "Walk"],
  Beach: ["Park", "Dog Park", "Lake", "River"],
  Lake: ["Beach", "River", "Park"],
  River: ["Lake", "Beach", "Park"],

  // Walking/Hiking (activity-based)
  Walk: ["Hike", "Trail", "Park", "Dog Park"],
  Hike: ["Walk", "Trail", "Park"],
  Trail: ["Walk", "Hike", "Park"],

  // Services & Activities (unique categories)
  Store: ["Service"],
  Service: ["Store"],
  Activity: [], // Standalone for now
};

/**
 * Recommendation Service
 * Handles all recommendation-related business logic
 */
export class RecommendationService {
  /**
   * Calculate location proximity score (0-1)
   */
  static calculateLocationScore(
    sourceLocation: { id: string; parentId: string | null; level: number },
    candidateLocation: { id: string; parentId: string | null; level: number },
  ): number {
    // Same exact location (city/suburb)
    if (sourceLocation.id === candidateLocation.id) {
      return 1.0;
    }

    // Same parent location (same region)
    if (
      sourceLocation.parentId &&
      sourceLocation.parentId === candidateLocation.parentId
    ) {
      return 0.7;
    }

    return 0.1;
  }

  /**
   * Calculate category match score (0-1)
   */
  static calculateCategoryScore(
    sourceTypes: string[],
    candidateTypes: string[],
  ): number {
    // Check for excact match
    const hasExactMatch = sourceTypes.some((type) =>
      candidateTypes.includes(type),
    );
    if (hasExactMatch) {
      return 1.0;
    }

    // Check for related match
    for (const sourceType of sourceTypes) {
      const relatedTypes = CATEGORY_RELATIONSHIPS[sourceType] || [];
      const hasRelatedMatch = candidateTypes.some((type) =>
        relatedTypes.includes(type),
      );
      if (hasRelatedMatch) {
        return 0.6;
      }
    }

    return 0.0;
  }
  /**
   * Calculate amenity similarity using Jaccard index (0-1)
   */
  static calculateAmenityScore(
    sourceAmenities: { indoor: boolean; outdoor: boolean; dogMenu: boolean },
    candidateAmenities: { indoor: boolean; outdoor: boolean; dogMenu: boolean },
  ): number {
    // Convert to arrays of enabled amenities
    const sourceSet = [
      sourceAmenities.indoor && "indoor",
      sourceAmenities.outdoor && "outdoor",
      sourceAmenities.dogMenu && "dogMenu",
    ].filter(Boolean) as string[];

    const candidateSet = [
      candidateAmenities.indoor && "indoor",
      candidateAmenities.outdoor && "outdoor",
      candidateAmenities.dogMenu && "dogMenu",
    ].filter(Boolean) as string[];

    // If both have no amenities, they're not similar (avoid division by zero)
    if (sourceSet.length === 0 && candidateSet.length === 0) {
      return 0.0;
    }

    // Jaccard similarity: intersection / union
    const intersection = sourceSet.filter((a) =>
      candidateSet.includes(a),
    ).length;
    const union = new Set([...sourceSet, ...candidateSet]).size;

    return intersection / union;
  }
  /**
   * Calculate rating similarity score (0-1)
   */
  static calculateRatingScore(
    sourceRating: string | null,
    candidateRating: string | null,
  ): number {
    if (!sourceRating || !candidateRating) {
      return 0.0;
    }

    const source = parseFloat(sourceRating);
    const candidate = parseFloat(candidateRating);
    const diff = Math.abs(source - candidate);

    if (diff <= 0.5) return 1.0;
    if (diff <= 1.0) return 0.7;
    if (diff <= 1.5) return 0.4;
    return 0.0;
  }
  /**
   * Calculate overall similarity score
   */
  static calculateSimilarityScore(
    sourcePlace: any,
    candidatePlace: any,
  ): number {
    const locationScore = this.calculateLocationScore(
      {
        id: sourcePlace.locationId,
        parentId: sourcePlace.location?.parentId || null,
        level: sourcePlace.location?.level || 0,
      },
      {
        id: candidatePlace.locationId,
        parentId: candidatePlace.location?.parentId || null,
        level: candidatePlace.location?.level || 0,
      },
    );

    const categoryScore = this.calculateCategoryScore(
      sourcePlace.types,
      candidatePlace.types,
    );

    const amenityScore = this.calculateAmenityScore(
      {
        indoor: sourcePlace.indoorAllowed,
        outdoor: sourcePlace.outdoorAllowed,
        dogMenu: sourcePlace.hasDogMenu,
      },
      {
        indoor: candidatePlace.indoorAllowed,
        outdoor: candidatePlace.outdoorAllowed,
        dogMenu: candidatePlace.hasDogMenu,
      },
    );

    const ratingScore = this.calculateRatingScore(
      sourcePlace.rating,
      candidatePlace.rating,
    );

    // Weighted sum (collaborative score = 0 for now)
    return (
      0.3 * locationScore +
      0.25 * categoryScore +
      0.2 * amenityScore +
      0.15 * ratingScore +
      0.1 * 0 // Collaborative score placeholder
    );
  }
}
