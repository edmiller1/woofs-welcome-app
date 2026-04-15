<script lang="ts">
  import { PUBLIC_MAPTILER_API_KEY } from "$env/static/public";
  import "maplibre-gl/dist/maplibre-gl.css";
  import { MapLibre, Marker } from "svelte-maplibre-gl";

  interface Props {
    lng: number;
    lat: number;
    zoom?: number;
    markerLabel?: string;
    className?: string;
    interactive?: boolean;
  }

  let {
    lng,
    lat,
    zoom = 12,
    className = "",
    interactive = true,
  }: Props = $props();
</script>

<MapLibre
  style={`https://api.maptiler.com/maps/streets/style.json?key=${PUBLIC_MAPTILER_API_KEY}`}
  class="map-container {className}"
  center={[lng, lat]}
  {zoom}
  {interactive}
>
  <Marker lnglat={[lng, lat]}>
    {#snippet content()}
      <div class="custom-marker">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#154b11" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    {/snippet}
  </Marker>
</MapLibre>

<style>
  .map-container {
    height: 350px;
    width: 100%;
    border-radius: 0.75rem;
    z-index: 0;
    isolation: isolate;
  }

  :global(.custom-marker) {
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  :global(.custom-marker:hover) {
    transform: scale(1.1);
  }

  :global(.custom-popup .maplibregl-popup-content) {
    padding: 0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  :global(.custom-popup .maplibregl-popup-tip) {
    border-top-color: white;
  }
</style>
