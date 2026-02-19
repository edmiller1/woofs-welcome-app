import type { Review } from "./review";
import type { Collection } from "./collection";
import type { PlaceImage } from "./image";

export interface Profile {
  id: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
  profileImageId: string | null;
  createdAt: Date;
  reviews: ProfileReview[];
  collections: ProfileCollection[];
  reviewCount: number;
  collectionCount: number;
  averageRating: number;
  currentCity: string | null;
  x: string | null;
  tiktok: string | null;
  facebook: string | null;
  instagram: string | null;
  dogs: Dog[];
}

export interface Dog {
  id: string;
  name: string;
  breed: string;
  imageId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileReview extends Review {
  place: {
    name: string;
    slug: string;
    rating: number;
    countryCode: string;
    images: PlaceImage[];
    location: {
      name: string;
      path: string;
      parent: {
        name: true;
      };
    };
  };
}

export interface ProfileCollection extends Collection {
  items: {
    id: string;
    collectionId: string;
    placeId: string;
    note: string;
    createdAt: Date;
    place: {
      name: string;
      images: PlaceImage[];
    };
  }[];
}
