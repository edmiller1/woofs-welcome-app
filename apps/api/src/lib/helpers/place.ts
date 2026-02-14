import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env";

export const getBoundingBox = (
  lat: number,
  lng: number,
  radiusInKm: number,
) => {
  const latDelta = radiusInKm / 111;
  const lngDelta = radiusInKm / (111 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
};

export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getPlaceDescription = async (
  placeName: string,
  locationPath: string,
) => {
  const geminiApiKey = env.GOOGLE_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Please google search and provide an accurate one paragraph description of this place or business for my dog friendly directory app: ${placeName}, ${locationPath.split("/").join(" ")}`,
  });

  return response.text;
};
