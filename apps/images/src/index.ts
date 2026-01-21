import { ImageTransformer } from "./transformer";
import type { Env } from "./types";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const allowedOrigins = env.ALLOWED_ORIGINS.split(",");
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins[0],
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow GET requests
    if (request.method !== "GET") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    // Health check endpoint
    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          service: "woofs-images",
          timestamp: Date.now(),
        }),
        {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    try {
      const transformer = new ImageTransformer();

      // Parse URL: /w_800,h_600,q_85,f_webp,fit_cover/image-id
      const parsed = transformer.parseUrlPath(url.pathname);

      if (!parsed) {
        return new Response(
          "Invalid URL format. Use: /w_800,h_600,q_85,f_webp,fit_cover/image-id",
          {
            status: 400,
            headers: { "Content-Type": "text/plain", ...corsHeaders },
          },
        );
      }

      const { transforms, imageId } = parsed;

      // Validate transform parameters
      const validation = transformer.validateParams(transforms);
      if (!validation.valid) {
        return new Response(validation.error, {
          status: 400,
          headers: { "Content-Type": "text/plain", ...corsHeaders },
        });
      }

      // Build Cloudflare Images URL with transformations
      const variantString = transformer.buildVariantString(transforms);
      const cfImageUrl = `${env.CF_IMAGES_DELIVERY_URL}/${imageId}/${variantString}`;

      console.log(`Fetching from CF Images: ${cfImageUrl}`);

      // Fetch transformed image from Cloudflare Images
      const imageResponse = await fetch(cfImageUrl, {
        cf: {
          // Cache at the edge for 1 year
          cacheTtl: 31536000,
          cacheEverything: true,
        },
      });

      if (!imageResponse.ok) {
        console.error(
          `CF Images error: ${imageResponse.status} for ${cfImageUrl}`,
        );

        // Return more helpful error message
        if (imageResponse.status === 404) {
          return new Response(`Image not found: ${imageId}`, {
            status: 404,
            headers: { "Content-Type": "text/plain", ...corsHeaders },
          });
        }

        return new Response("Failed to load image from Cloudflare Images", {
          status: imageResponse.status,
          headers: { "Content-Type": "text/plain", ...corsHeaders },
        });
      }

      // Return transformed image with proper headers
      return new Response(imageResponse.body, {
        headers: {
          "Content-Type":
            imageResponse.headers.get("Content-Type") || "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
          "CDN-Cache-Control": "public, max-age=31536000",
          Vary: "Accept",
          "X-Image-Source": "cloudflare-images",
          ...corsHeaders,
        },
      });
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(
        `Internal server error: ${(error as Error).message}`,
        {
          status: 500,
          headers: { "Content-Type": "text/plain", ...corsHeaders },
        },
      );
    }
  },
};
