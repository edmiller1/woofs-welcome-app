import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import PlaceCard from "$lib/components/place-card.svelte";

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

describe("PlaceCard", () => {
  it("renders the place name", () => {
    const { getByText } = render(PlaceCard, { props: baseProps });
    expect(getByText("Victoria Park")).toBeTruthy();
  });

  it("renders city and region", () => {
    const { getByText } = render(PlaceCard, { props: baseProps });
    expect(getByText(/Christchurch/)).toBeTruthy();
  });

  it("renders the rating", () => {
    const { getByText } = render(PlaceCard, { props: baseProps });
    expect(getByText("4.5")).toBeTruthy();
  });

  it("renders review count", () => {
    const { getByText } = render(PlaceCard, { props: baseProps });
    expect(getByText("(10)")).toBeTruthy();
  });

  it("renders place type badge", () => {
    const { getByText } = render(PlaceCard, { props: baseProps });
    expect(getByText("Park")).toBeTruthy();
  });

  it("renders verified badge when isVerified is true", () => {
    const { container } = render(PlaceCard, {
      props: { ...baseProps, isVerified: true },
    });
    // BadgeCheck icon is rendered for verified places
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders a dog amenity when provided", () => {
    const { getByText } = render(PlaceCard, {
      props: { ...baseProps, dogAmenities: ["Dog Menu"] },
    });
    expect(getByText("Dog Menu")).toBeTruthy();
  });

  it("links to the correct place URL", () => {
    const { container } = render(PlaceCard, { props: baseProps });
    const link = container.querySelector("a");
    expect(link?.href).toContain("/places/victoria-park");
  });
});
