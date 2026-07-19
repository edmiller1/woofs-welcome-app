import { describe, it, expect } from "vitest";
import { createPlaceSchema } from "../routes/admin/schemas";
import { searchPlacesSchema } from "../routes/place/schemas";

describe("createPlaceSchema", () => {
  it("accepts a valid place", () => {
    const result = createPlaceSchema.safeParse({
      name: "Victoria Park",
      slug: "victoria-park-auckland",
      types: ["Park"],
      locationId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      countryCode: "NZ",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a slug with uppercase letters", () => {
    const result = createPlaceSchema.safeParse({
      name: "Victoria Park",
      slug: "Victoria-Park",
      types: ["Park"],
      locationId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty types array", () => {
    const result = createPlaceSchema.safeParse({
      name: "Victoria Park",
      slug: "victoria-park",
      types: [],
      locationId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid locationId", () => {
    const result = createPlaceSchema.safeParse({
      name: "Victoria Park",
      slug: "victoria-park",
      types: ["Park"],
      locationId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts adventure fields for hikes", () => {
    const result = createPlaceSchema.safeParse({
      name: "Hooker Valley Track",
      slug: "hooker-valley-track",
      types: ["Hike"],
      locationId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      distanceKm: 10,
      durationMins: 180,
      difficulty: "intermediate",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid difficulty value", () => {
    const result = createPlaceSchema.safeParse({
      name: "Some Track",
      slug: "some-track",
      types: ["Hike"],
      locationId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      difficulty: "expert",
    });
    expect(result.success).toBe(false);
  });
});

describe("searchPlacesSchema", () => {
  it("accepts a valid search query", () => {
    const result = searchPlacesSchema.safeParse({ q: "Victoria Park" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty query", () => {
    const result = searchPlacesSchema.safeParse({ q: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a query over 100 chars", () => {
    const result = searchPlacesSchema.safeParse({ q: "a".repeat(101) });
    expect(result.success).toBe(false);
  });
});
