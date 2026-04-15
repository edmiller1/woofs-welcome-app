export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  isPublic: boolean;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionItem {
  id: string;
  collectionId: string;
  placeId: string;
  note: string;
  createdAt: Date;
}

export interface PlaceCollection {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  itemCount: number;
  hasPlace: boolean;
  previewImages: string[];
}

export interface CollectionWithItems extends Collection {
  items: CollectionItem[];
}

export interface UserCollection {
  isPrivate: boolean;
  collections: {
    id: string;
    name: string;
    emoji: string | null;
    color: string | null;
    itemCount: number;
    description: string;
    isPublic: boolean;
    previewImages: string[];
  }[];
  isOwner: boolean;
}

export interface CollectionPlace {
  id: string;
  name: string;
  slug: string;
  rating: string | null;
  lat: number | null;
  lng: number | null;
  countryCode: string;
  reviewsCount: number;
  isVerified: boolean;
  types: string[];
  isSaved: boolean;
  imageId: string;
  cfImageId: string | null;
  cityName: string;
  regionName: string;
  locationPath: string;
}

export interface CollectionWithPlaces {
  collection: Collection;
  places: CollectionPlace[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LimitedCollection extends Collection {
  items: {
    id: string;
    createdAt: string;
    placeId: string;
    note: string;
    collectionId: string;
    place: {
      name: string;
      images: {
        imageId: string;
      }[];
    };
  }[];
}
