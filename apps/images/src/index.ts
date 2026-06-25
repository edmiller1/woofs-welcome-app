import type { Env } from "./types";

const VARIANT_MAP: Record<string, string> = {
  thumbnail: "width=320,quality=80,fit=cover,format=webp",
  small:     "width=640,quality=80,fit=cover,format=webp",
  medium:    "width=960,quality=85,fit=cover,format=webp",
  large:     "width=1280,quality=85,fit=cover,format=webp",
  xlarge:    "width=1920,quality=90,fit=cover,format=webp",
  public:    "width=1920,quality=90,fit=cover,format=webp",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    const allowedOrigins = env.ALLOWED_ORIGINS.split(",");
    const origin = request.headers.get("Origin") ?? "";
    const corsHeaders: Record<string, string> = {
      "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins[0],
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok", service: "woofs-images" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Expected format: /{imageId}/{variant}
    // imageId may contain slashes, variant is always the last segment
    const parts = url.pathname.replace(/^\//, "").split("/");
    if (parts.length < 2) {
      return new Response("Invalid URL format. Use: /{imageId}/{variant}", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const variant = parts[parts.length - 1];
    const imageId = parts.slice(0, -1).join("/");

    const variantParams = VARIANT_MAP[variant];
    if (!variantParams) {
      return new Response(
        `Unknown variant "${variant}". Valid: ${Object.keys(VARIANT_MAP).join(", ")}`,
        { status: 400, headers: corsHeaders },
      );
    }

    const cfImageUrl = `${env.CF_IMAGES_DELIVERY_URL}/${imageId}/${variantParams}`;

    const imageResponse = await fetch(cfImageUrl, {
      cf: { cacheTtl: 31536000, cacheEverything: true },
    } as RequestInit);

    if (!imageResponse.ok) {
      if (imageResponse.status === 404) {
        return new Response(`Image not found: ${imageId}`, {
          status: 404,
          headers: corsHeaders,
        });
      }
      return new Response("Failed to load image", {
        status: imageResponse.status,
        headers: corsHeaders,
      });
    }

    return new Response(imageResponse.body, {
      headers: {
        "Content-Type": imageResponse.headers.get("Content-Type") ?? "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "CDN-Cache-Control": "public, max-age=31536000",
        Vary: "Accept",
        ...corsHeaders,
      },
    });
  },
};
