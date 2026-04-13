import type { ReviewImage } from "./image";

export interface Review {
  id: string;
  placeId: string;
  userId: string;
  businessId: string;
  rating: number;
  title: string;
  content: string;
  visitDate: string;
  numDogs: number;
  dogBreeds: string[];
  timeOfVisit: string;
  isFirstVisit: boolean;
  likesCount: number;
  repliesCount: number;
  hasBusinessReply: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  parentReplyId: string;
  userId: string;
  businessId: string;
  content: string;
  depth: number;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
  editedAt: Date;
}

export interface ReviewReplyLike {
  id: string;
  replyId: string;
  userId: string;
  businessId: string;
  createdAt: Date;
}

export interface ReviewLike {
  id: string;
  reviewId: string;
  userId: string;
  businessId: string;
  createdAt: Date;
}

export interface ReviewReport {
  id: string;
  reviewId: string;
  userId: string;
  businessId: string;
  reason: string;
  details: string;
  status: string;
  reviewedAt: Date;
  reviewedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaceReview extends Review {
  user: {
    id: string;
    name: string;
    image: string;
    profileImageId: string;
  };
  images: ReviewImage[];
  likes: ReviewLike[];
  replies: ReviewReply[];
  reports: ReviewReport[];
  isOwner: boolean;
  hasLiked: boolean;
  hasReported: boolean;
}

export interface CreateReviewInput {
  placeId: string;
  rating: number;
  title: string;
  content: string;
  visitDate: Date;
  numDogs: number;
  dogBreeds: string[];
  images: File[];
}

export interface UpdateReviewInput {
  title: string | null;
  content: string | null;
  rating: number | null;
  numDogs: number | null;
  dogBreeds: string[] | null;
  visitDate: Date | null;
  newImages: File[] | null;
  deletedImages: string[] | null;
}

export interface UpdateReviewData {
  reviewId: string;
  title: string;
  content: string;
  rating: number;
  numDogs: number | null;
  dogBreeds: string[] | null;
  visitDate: string;
  images: ReviewImage[] | null;
}

export interface ReportReviewInput {
  reason: string;
  details?: string;
}

export interface CommunityReview {
  reviews: PlaceReview[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}
