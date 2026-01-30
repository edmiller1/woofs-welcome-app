import type { DayOfWeekHours } from "./hours";
import type { PlaceImage } from "./image";
import type { BreadcrumbItem, Location } from "./location";
import type { Review } from "./review";

export interface Place {
  id: string;
  name: string;
  slug: string;
  types: string[];
  description: string;
  locationId: string;
  countryCode: string;
  address: string;
  latitude: number;
  longitude: number;
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
  createdAt: Date;
  updatedAt: Date;
  claimedBy: string;
  claimedAt: Date;
  totalViews: number;
  viewsThisMonth: number;
}

export interface PlaceWithDetails extends Place {
  breadcrumbs: BreadcrumbItem[];
  location: Location;
  images: PlaceImage[];
  reviews: Review[];
}
