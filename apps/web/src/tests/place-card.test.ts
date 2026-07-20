import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import PlaceCard from "$lib/components/place-card.svelte";
import QueryWrapper from "../test/mocks/query-wrapper.svelte";

const baseProps = {
  id: "test-id",
  name: "Victoria Park",
  rating: "4.5",
  slug: "victoria-park",
  cityName: "Christchurch",
  regionName: "Canterbury",
  countryCode: "NZ",
  types: ["Park"],
  isSaved: false,
  user: null,
  locationPath: "new-zealand/south-island/canterbury/christchurch",
  isVerified: false,
  memberFavourite: false,
  reviewCount: 10,
  dogAmenities: [],
  imageIds: ["test-image-id"],
};

const options = { wrapper: QueryWrapper };

describe("PlaceCard", () => {
  it("renders the place name", () => {
    const { getByText } = render(PlaceCard, baseProps, options);
    expect(getByText("Victoria Park")).toBeTruthy();
  });

  it("renders city and region", () => {
    const { getByText } = render(PlaceCard, baseProps, options);
    expect(getByText(/Christchurch/)).toBeTruthy();
  });

  it("renders the rating", () => {
    const { getByText } = render(PlaceCard, baseProps, options);
    expect(getByText("4.5")).toBeTruthy();
  });

  it("renders review count", () => {
    const { getByText } = render(PlaceCard, baseProps, options);
    expect(getByText("(10)")).toBeTruthy();
  });

  it("renders place type badge", () => {
    const { getByText } = render(PlaceCard, baseProps, options);
    expect(getByText("Park")).toBeTruthy();
  });

  it("renders verified badge when isVerified is true", () => {
    const { container } = render(PlaceCard, { ...baseProps, isVerified: true }, options);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders a dog amenity when provided", () => {
    const { getByText } = render(PlaceCard, { ...baseProps, dogAmenities: ["Dog Menu"] }, options);
    expect(getByText("Dog Menu")).toBeTruthy();
  });

  it("links to the correct place URL", () => {
    const { container } = render(PlaceCard, baseProps, options);
    const link = container.querySelector("a");
    expect(link?.href).toContain("/places/victoria-park");
  });
});
