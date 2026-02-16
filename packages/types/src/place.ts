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
  dogPolicy: string;
  indoorAllowed: boolean;
  outdoorAllowed: boolean;
  hasDogMenu: boolean;
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
  images: PlaceImage[];
  reviewStats: PlaceReviewStats;
  parentLocationName?: string | null;
}

export interface NearbyPlace extends Place {
  location: Location;
  images: PlaceImage[];
}
