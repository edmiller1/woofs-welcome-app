import type { Review } from "./review";
import type { Collection } from "./collection";
import type { PlaceImage } from "./image";

export interface CityData {
  city: string;
  locality: string;
  country: string;
}

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
  checkInCount: number;
  currentCity: CityData | null;
  x: string | null;
  tiktok: string | null;
  facebook: string | null;
  instagram: string | null;
  dogs: Dog[];
  isOwner: boolean;
  userSettings: ProfileSettings;
  checkIns: {
    date: Date;
    imageId: string;
    note: string;
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
    dogs: Dog[];
  };
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

export interface ProfileSettings {
  showReviews: boolean;
  showCollections: boolean;
  showCheckIns: boolean;
  showDogs: boolean;
  showAbout: boolean;
}

export interface UpdateProfileData {
  name?: string;
  image?: File;
  currentCity?: CityData | null;
  instagram?: string;
  facebook?: string;
  x?: string;
  tiktok?: string;
  dogs?: Array<{
    id?: string;
    name: string;
    breed: string;
    imageIndex?: number;
  }>;
  removeDogIds?: string[];
  dogImages?: File[];
  showAbout?: boolean;
  showDogs?: boolean;
  showCheckIns?: boolean;
  showReviews?: boolean;
  showCollections?: boolean;
}
