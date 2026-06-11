export interface FeaturedLocation {
  id: string;
  name: string;
  path: string;
  type: string;
  level: number;
  image: string | null;
  isPopular: boolean | null;
  totalReviews: number;
  averageRating: string;
  placeCount: number;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  type: string;
  countryCode: string;
  path: string;
  level: number;
  latitude: number;
  longitude: number;
  image: string;
  isPopular: boolean;
  totalReviews: number;
  averageRating: string;
  metaTitle: string;
  metaDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BreadcrumbItem {
  name: string;
  slug: string;
  path: string;
  level: number;
}

export interface LocationsStats {
  totalPlaces: number;
  totalAdventures: number;
  totalEats: number;
  totalStays: number;
  totalStores: number;
}

export interface LocationPlace {
  id: string;
  name: string;
  slug: string;
  types: string[];
  description: string;
  rating: string;
  reviewsCount: number;
  isVerified: boolean;
  countryCode: string;
  imageId: string;
  isSaved: boolean;
  cityName: string;
  regionName: string;
  locationPath: string;
  lat: string | null;
  lng: string | null;
  memberFavourite: boolean;
  dogAmenities: string[];
}

export interface LocationWithDetails extends Location {
  popularPlaces: LocationPlace[];
  stays: LocationPlace[];
  eats: LocationPlace[];
  adventures: LocationPlace[];
  breadcrumbs: BreadcrumbItem[];
  stats: LocationsStats;
}

export interface ChildLocation {
  id: string;
  name: string;
  slug: string;
  path: string;
  type: string;
  image: string | null;
  placeCount: number;
}

export interface LocationPhoto {
  cfImageId: string;
  placeName: string;
  placeSlug: string;
  locationPath: string;
  reviewerName: string | null;
  dogs: { name: string; breed: string }[];
}

export interface LocationPhotosResult {
  photos: LocationPhoto[];
  total: number;
  page: number;
  limit: number;
}

export type PlaceFilter = "popular" | "new" | "verified" | "surprise";

export interface LocationPlacesSort {
  places: LocationPlace[];
}

export interface ExploreResult {
  places: LocationPlace[];
  total: number;
  page: number;
  pageSize: number;
}
