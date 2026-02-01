export interface Review {
  id: string;
  placeId: string;
  userId: string;
  businessId: string;
  rating: number;
  title: string;
  content: string;
  visitDate: Date;
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
