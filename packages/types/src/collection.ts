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
