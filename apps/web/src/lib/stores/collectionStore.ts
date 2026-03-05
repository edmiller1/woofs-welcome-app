import type { CollectionPlace } from "@woofs/types";
import { writable } from "svelte/store";

export const hoveredPlaceId = writable<string | null>(null);
export const collectionPlaces = writable<CollectionPlace[]>([]);
