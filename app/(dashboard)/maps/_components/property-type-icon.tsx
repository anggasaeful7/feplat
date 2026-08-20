import type { PropertyType } from "@/types";

/**
 * Ikon tipe properti: garis, satu warna, selalu `currentColor`. Tipe properti
 * tidak pernah berubah, jadi dia tidak berhak atas warna — warna disimpan
 * untuk status.
 *
 * Disimpan sebagai string path karena penanda Mapbox dibangun sebagai DOM
 * imperatif dan tidak bisa merender komponen React. Satu sumber, dua pemakai.
 */
export const PROPERTY_TYPE_ICON_PATHS: Record<PropertyType, string> = {
  kost: '<path d="M3 19v-9" /><path d="M3 13h13a5 5 0 0 1 5 5v1" /><path d="M3 19h18" /><circle cx="7.5" cy="9.5" r="1.8" />',
  residence:
    '<path d="M4 10.5 12 4l8 6.5" /><path d="M6 9.8V20h12V9.8" /><path d="M10 20v-5h4v5" />',
  outlet:
    '<path d="M4 9h16l-1 11H5L4 9Z" /><path d="M4 9 6 4h12l2 5" /><path d="M9.5 13a2.5 2.5 0 0 0 5 0" />',
};

export const ICON_SVG_ATTRS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function PropertyTypeIcon({
  type,
  ...props
}: { type: PropertyType } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...ICON_SVG_ATTRS}
      {...props}
      dangerouslySetInnerHTML={{ __html: PROPERTY_TYPE_ICON_PATHS[type] }}
    />
  );
}
