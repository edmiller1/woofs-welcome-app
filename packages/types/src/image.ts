export type ImageType =
  | "place_hero"
  | "place_gallery"
  | "review_photo"
  | "user_avatar"
  | "business_logo";

export type ImageSource =
  | "user_upload"
  | "business_upload"
  | "admin_upload"
  | "import";

export interface Image {
  id: string;
  cfImageId: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  imageType: ImageType;
  uploadedBy?: string;
  uploadedByBusiness?: string;
  source: ImageSource;
  altText?: string;
  metadata?: Record<string, any>;
  isApproved: boolean;
  moderatedBy?: string;
  moderatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaceImage {
  id: string;
  placeId: string;
  imageId: string;
  isPrimary: boolean;
  displayOrder: number;
  caption?: string;
  createdAt: Date;
  updatedAt: Date;

  // Joined data
  image?: Image;
}

export interface ReviewImage {
  id: string;
  reviewId: string;
  imageId: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;

  // Joined data
  image?: Image;
}
