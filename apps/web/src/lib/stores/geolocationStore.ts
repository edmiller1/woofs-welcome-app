import { writable } from "svelte/store";

export const userLocation = writable<[number, number] | null>(null);
