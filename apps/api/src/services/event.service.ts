import { and, asc, count, eq, gte, lte, sql } from "drizzle-orm";
import { Event, EventAttendee, Place, PlaceImage, Image, user } from "../db/schema";
import type { AnyDb } from "../db";

export class EventService {
  constructor(private db: AnyDb) {}

  async getUpcomingEvents(limit: number = 10, userId?: string) {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const events = await this.db.query.Event.findMany({
      where: and(
        gte(Event.startsAt, now),
        lte(Event.startsAt, thirtyDaysFromNow),
        eq(Event.isCancelled, false),
      ),
      with: {
        organiser: {
          columns: { id: true, name: true, image: true, profileImageId: true },
        },
        place: {
          columns: { id: true, name: true, slug: true },
          with: {
            images: {
              where: eq(PlaceImage.isPrimary, true),
              limit: 1,
              with: { image: true },
            },
          },
        },
        attendees: { columns: { userId: true } },
      },
      orderBy: asc(Event.startsAt),
      limit,
    });

    return events.map((event) => ({
      ...event,
      attendeeCount: event.attendees.length,
      isAttending: userId
        ? event.attendees.some((a) => a.userId === userId)
        : false,
      attendees: undefined,
    }));
  }
}
