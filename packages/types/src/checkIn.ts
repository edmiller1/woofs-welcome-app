export interface CheckIn {
  id: string;
  userId: string;
  placeId: string;
  date: Date;
  imageId: string;
  note: string;
  createdAt: Date;
}

export interface CheckInDog {
  id: string;
  checkInId: string;
  dogId: string;
}
