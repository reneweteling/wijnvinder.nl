/**
 * A small, keyless location map for country and region guides. Uses the
 * OpenStreetMap embed iframe (no API key, no client library) centred on the
 * wine area. `span` is the half-width in degrees of longitude; the latitude
 * span is derived from it so the map keeps its aspect ratio.
 */
export function MiniMap({
  lat,
  lon,
  span,
  label,
}: {
  lat: number;
  lon: number;
  span: number;
  label: string;
}) {
  const latHalf = span * 0.46;
  const bbox = `${lon - span},${lat - latHalf},${lon + span},${lat + latHalf}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  const link = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=7/${lat}/${lon}`;

  return (
    <figure className="mt-7 overflow-hidden rounded-xl border border-border bg-card">
      <iframe
        title={`Kaart van ${label}`}
        src={src}
        loading="lazy"
        className="w-full h-[240px] border-0"
      />
      <figcaption className="px-4 py-2.5 text-xs text-text-light border-t border-border">
        {label} op de kaart.{" "}
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-burgundy underline"
        >
          Vergroot
        </a>
      </figcaption>
    </figure>
  );
}
