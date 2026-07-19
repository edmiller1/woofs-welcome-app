import type { DayOfWeekHours } from "./hours";
import type { PlaceImage } from "./image";
import type { BreadcrumbItem, Location } from "./location";

export interface Place {
  id: string;
  name: string;
  slug: string;
  types: string[];
  description: string;
  locationId: string;
  countryCode: string;
  address: string;
  latitude: string;
  longitude: string;
  phone: string;
  email: string;
  website: string;
  hours: DayOfWeekHours;
  difficulty: "beginner" | "intermediate" | "advanced" | null;
  distanceKm: number;
  durationMins: number;
  dogRules: string[] | null;
  dogAmenities: string[];
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  isSaved: boolean;
  createdAt: Date;
  updatedAt: Date;
  claimedBy: string;
  claimedAt: Date;
  totalViews: number;
  viewsThisMonth: number;
  memberFavourite: boolean;
}

export interface PlaceReviewStats {
  averageRating: number;
  totalReviews: number;
  reviewBreakdown: {
    count: number;
    percentage: number;
    rating: number;
  }[];
}

export interface PlaceWithDetails extends Place {
  breadcrumbs: BreadcrumbItem[];
  location: Location;
  region: Location;
  images: PlaceImage[];
  reviewStats: PlaceReviewStats;
  parentLocationName?: string | null;
}

export interface NearbyPlace extends Place {
  location: Location;
  images: PlaceImage[];
}

export interface PopularPlace {
  id: string;
  name: string;
  slug: string;
  types: string[];
  rating: string;
  reviewsCount: number;
  isVerified: boolean;
  countryCode: string;
  dogAmenities: string[];
  imageId: string | null;
  cityName: string;
  regionName: string | null;
  locationPath: string;
  isSaved: boolean;
  memberFavourite: boolean;
}

export interface TrendingPlace extends Place {
  location: Location;
  checkInCount: number;
  isSaved: boolean;
  imageId: string | null;
}

export interface CommunityStats {
  totalReviews: number;
  checkIns: number;
  placesSaved: number;
}

export interface ExplorePlacesParams {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
  types?: string[];
  rating?: number;
  distance?: number;
  minLength?: number;
  maxLength?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export interface ExplorePlaceItem {
  id: string;
  name: string;
  slug: string;
  types: string[];
  rating: number;
  reviewsCount: number;
  lat: number;
  lng: number;
  imageId: string;
  locationPath: string;
  cityName: string;
  regionName: string;
  countryCode: string;
  dogAmenities: string[];
  isSaved: boolean;
  isVerified: boolean;
  memberFavourite: boolean;
}

export interface ExplorePlacesResult {
  places: ExplorePlaceItem[];
  total: number;
}
