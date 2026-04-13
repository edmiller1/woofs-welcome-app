export interface UpcomingEvent {
  id: string;
  title: string;
  description: string | null;
  placeId: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  organiserId: string;
  startsAt: string;
  endsAt: string | null;
  maxAttendees: number | null;
  isCancelled: boolean;
  createdAt: string;
  updatedAt: string;
  attendeeCount: number;
  isAttending: boolean;
  organiser: {
    id: string;
    name: string;
    image: string | null;
    profileImageId: string | null;
  };
  place: {
    id: string;
    name: string;
    slug: string;
    images: {
      image: {
        cfImageId: string;
      };
    }[];
  } | null;
}
