/**
 * Satu-satunya tempat token Mapbox dibaca. Peta interaktif dan thumbnail statis
 * memakai token yang sama; kalau tersebar di dua file, salah satunya pasti
 * ketinggalan saat token diganti.
 */
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/** URL gambar peta statis Mapbox: satu <img>, tanpa memuat GL JS sama sekali. */
export function staticMapUrl(
  longitude: number,
  latitude: number,
  { width = 240, height = 150, zoom = 14 } = {},
) {
  const marker = `pin-s+0d4029(${longitude},${latitude})`;
  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${marker}/${longitude},${latitude},${zoom},0/${width}x${height}@2x?access_token=${MAPBOX_TOKEN}`;
}
