"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import type { Feature, FeatureCollection, Point, Polygon } from "geojson";
import { useEffect, useRef } from "react";
import type { OccupancyLevel, Property, PropertyType } from "@/types";
import { PROPERTY_TYPE_LABELS, SUBJECT_LABELS, UNIT_STATUS_LABELS } from "@/types";
import {
  formatRate,
  occupancyLevel,
  occupancyRate,
  vacantUnits,
} from "../_lib/occupancy";
import { MAPBOX_TOKEN } from "../_lib/mapbox";
import { ICON_SVG_ATTRS, PROPERTY_TYPE_ICON_PATHS } from "./property-type-icon";

// Style "standard" sudah membawa gedung 3D, bayangan, dan pencahayaan sendiri.
const MAP_STYLE = "mapbox://styles/mapbox/standard";

const POINT_SOURCE = "properties";
const BOX_SOURCE = "property-boxes";
const BOX_LAYER = "property-boxes-3d";
/** Layer tak terlihat; ada semata supaya tile source titik ikut dibangun. */
const POINT_PROBE_LAYER = "properties-probe";

/** Kemiringan default. Cukup untuk gedung terbaca sebagai volume, belum cukup
 *  untuk pin berdesakan di garis horizon. */
const PITCH = 55;
const BEARING = -18;

/** Sisi balok penanda, dalam meter. Ukurannya fisik, bukan piksel — jadi balok
 *  mengecil sendiri saat zoom menjauh dan tidak perlu digating per level zoom. */
const BOX_SIDE_M = 42;
/** Tinggi dasar + tambahan per unit kosong, dalam meter. */
const BOX_BASE_H = 25;
const BOX_H_PER_VACANT = 9;

type PinProps = {
  id: string;
  name: string;
  type: PropertyType;
  vacant: number;
  level: OccupancyLevel;
  color: string;
  hoverColor: string;
  dimColor: string;
};

type Draft = { latitude: number; longitude: number };

type Props = {
  properties: Property[];
  /** Kunci di seluruh UI adalah subject_id (tenant atau workspace): properti
   *  yang belum dipetakan belum punya id sendiri. */
  visibleIds: Set<string>;
  selectedId: string | null;
  hoveredId: string | null;
  editingId: string | null;
  draft: Draft | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  onEdit: (id: string) => void;
  onOpenCanvas: (property: Property) => void;
  onDraftChange: (draft: Draft) => void;
};

// ─── Warna ──────────────────────────────────────────────────────────────────
// Mapbox tidak bisa membaca `var(--success)`, jadi token CSS-nya diresolusi ke
// hex sekali saat peta dibuat. Sumbernya tetap satu: globals.css.

function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return raw || fallback;
}

function mix(hex: string, toward: string, amount: number) {
  const parse = (h: string) => {
    const v = h.replace("#", "");
    const full =
      v.length === 3
        ? v
            .split("")
            .map((c) => c + c)
            .join("")
        : v;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  };
  const a = parse(hex);
  const b = parse(toward);
  const out = a.map((v, i) => Math.round(v + (b[i] - v) * amount));
  return `#${out.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

type Palette = Record<OccupancyLevel, { base: string; hover: string; dim: string }>;

function buildPalette(): Palette {
  const surface = cssVar("--surface", "#ffffff");
  const level = (name: string, fallback: string) => {
    const base = cssVar(name, fallback);
    return {
      base,
      // Hover naik terang, bukan ganti hue — supaya tetap terbaca sebagai
      // status yang sama, hanya sedang disentuh.
      hover: mix(base, "#ffffff", 0.34),
      dim: mix(base, surface, 0.78),
    };
  };
  return {
    healthy: level("--success", "#166534"),
    attention: level("--warning", "#92590a"),
    critical: level("--danger", "#b42318"),
  };
}

// ─── GeoJSON ────────────────────────────────────────────────────────────────

type LocatedProperty = Property & { latitude: number; longitude: number };

/** Properti yang lokasinya belum diisi tidak bisa digambar. Disaring di satu
 *  tempat supaya sisa file tidak perlu tahu koordinatnya nullable. */
function locatedOnly(properties: Property[]): LocatedProperty[] {
  return properties.filter(
    (p): p is LocatedProperty => p.latitude !== null && p.longitude !== null,
  );
}

function pinProps(p: LocatedProperty, palette: Palette): PinProps {
  const level = occupancyLevel(p);
  return {
    id: p.subject_id,
    name: p.name,
    type: p.type,
    vacant: vacantUnits(p),
    level,
    color: palette[level].base,
    hoverColor: palette[level].hover,
    dimColor: palette[level].dim,
  };
}

function toPointGeoJSON(
  properties: LocatedProperty[],
  palette: Palette,
): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: properties.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.longitude, p.latitude] },
      properties: pinProps(p, palette),
    })),
  };
}

/** Balok butuh poligon; titik tidak bisa di-extrude. Persegi kecil digambar
 *  di sekitar koordinatnya, ukurannya dalam meter supaya skalanya nyata. */
function squareAround(lng: number, lat: number, sideMeters: number) {
  const half = sideMeters / 2;
  const dLat = half / 111_320;
  const dLng = half / (111_320 * Math.cos((lat * Math.PI) / 180));
  return [
    [
      [lng - dLng, lat - dLat],
      [lng + dLng, lat - dLat],
      [lng + dLng, lat + dLat],
      [lng - dLng, lat + dLat],
      [lng - dLng, lat - dLat],
    ],
  ];
}

function toBoxGeoJSON(
  properties: LocatedProperty[],
  palette: Palette,
): FeatureCollection<Polygon> {
  return {
    type: "FeatureCollection",
    features: properties.map((p) => ({
      type: "Feature",
      id: p.subject_id,
      geometry: {
        type: "Polygon",
        coordinates: squareAround(p.longitude, p.latitude, BOX_SIDE_M),
      },
      properties: pinProps(p, palette),
    })),
  };
}

// ─── Elemen DOM ─────────────────────────────────────────────────────────────

function iconSvg(type: PropertyType) {
  const { viewBox, strokeWidth, strokeLinecap, strokeLinejoin } = ICON_SVG_ATTRS;
  return `<svg class="maps-pin__icon" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="${strokeLinecap}" stroke-linejoin="${strokeLinejoin}">${PROPERTY_TYPE_ICON_PATHS[type]}</svg>`;
}

function createPin(props: PinProps) {
  const el = document.createElement("div");
  el.className = "maps-pin";
  el.style.setProperty("--pin-color", props.color);
  el.title = `${props.name} — ${props.vacant} unit kosong`;

  const body = document.createElement("div");
  body.className = "maps-pin__body";
  // Hanya SVG statis milik kita sendiri yang lewat innerHTML; nama dan angka
  // dari data masuk lewat textContent.
  body.innerHTML = iconSvg(props.type);

  const count = document.createElement("span");
  count.textContent = String(props.vacant);
  body.appendChild(count);

  const tail = document.createElement("div");
  tail.className = "maps-pin__tail";

  el.append(body, tail);
  return el;
}

function createCluster(vacant: number) {
  const el = document.createElement("div");
  el.className = "maps-cluster";

  const count = document.createElement("strong");
  count.textContent = String(vacant);

  const label = document.createElement("span");
  label.textContent = "kosong";

  el.append(count, label);
  return el;
}

function createDraftPin() {
  const el = document.createElement("div");
  el.className = "maps-draft-pin";
  el.title = "Geser untuk menyesuaikan posisi";
  return el;
}

function row(label: string, value: string) {
  const dt = document.createElement("dt");
  dt.textContent = label;
  const dd = document.createElement("dd");
  dd.textContent = value;
  return [dt, dd];
}

function createPopupContent(
  p: LocatedProperty,
  onEdit: () => void,
  onOpenCanvas: () => void,
) {
  const el = document.createElement("div");
  el.className = "maps-popup";

  const title = document.createElement("h3");
  title.textContent = p.name;

  const sub = document.createElement("p");
  sub.className = "maps-popup__sub";
  sub.textContent =
    p.subject_type === "tenant"
      ? `${SUBJECT_LABELS.tenant} · ${p.workspace_count} workspace`
      : SUBJECT_LABELS.workspace;

  const dl = document.createElement("dl");
  const rate = occupancyRate(p);
  dl.append(
    ...row("Tipe", PROPERTY_TYPE_LABELS[p.type]),
    ...row("Alamat", p.address || "—"),
    ...row("Total unit", String(p.total_units)),
    ...row(UNIT_STATUS_LABELS.occupied, `${p.occupied_units} (${formatRate(rate)})`),
    ...row("Unit kosong", String(vacantUnits(p))),
    ...row(
      "Koordinat",
      `${p.latitude.toFixed(6)}, ${p.longitude.toFixed(6)}`,
    ),
  );

  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "maps-popup__action";
  edit.textContent = "Ubah lokasi";
  edit.addEventListener("click", onEdit);

  const canvas = document.createElement("button");
  canvas.type = "button";
  canvas.className = "maps-popup__action maps-popup__action--ghost";
  canvas.textContent = "Buka denah";
  canvas.addEventListener("click", onOpenCanvas);

  el.append(title, sub, dl, canvas, edit);
  return el;
}

// ─── Komponen ───────────────────────────────────────────────────────────────

export function PropertyMap({
  properties,
  visibleIds,
  selectedId,
  hoveredId,
  editingId,
  draft,
  onSelect,
  onHover,
  onEdit,
  onOpenCanvas,
  onDraftChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const paletteRef = useRef<Palette | null>(null);
  const markersRef = useRef(new Map<string, mapboxgl.Marker>());
  const onScreenRef = useRef(new Set<string>());
  const pinElsRef = useRef(new Map<string, HTMLElement>());
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const draftMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const boxHoverRef = useRef<string | null>(null);

  // Listener Mapbox dipasang sekali, jadi state terbaru dibaca lewat ref
  // supaya tidak menangkap closure basi.
  const stateRef = useRef({ visibleIds, selectedId, hoveredId, editingId, properties });
  const handlersRef = useRef({ onSelect, onHover, onEdit, onOpenCanvas, onDraftChange });

  function applyVisualState() {
    const map = mapRef.current;
    const { visibleIds, selectedId, hoveredId } = stateRef.current;

    for (const [id, el] of pinElsRef.current) {
      el.classList.toggle("is-dimmed", !visibleIds.has(id));
      el.classList.toggle("is-selected", id === selectedId);
      el.classList.toggle("is-hovered", id === hoveredId);
    }

    if (!map?.getSource(BOX_SOURCE)) return;
    for (const p of locatedOnly(stateRef.current.properties)) {
      map.setFeatureState(
        { source: BOX_SOURCE, id: p.subject_id },
        {
          dimmed: !visibleIds.has(p.subject_id),
          hover:
            p.subject_id === hoveredId || p.subject_id === selectedId,
        },
      );
    }
  }

  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current || mapRef.current) return;

    const container = containerRef.current;
    const markers = markersRef.current;
    const onScreen = onScreenRef.current;
    const pinEls = pinElsRef.current;
    const palette = buildPalette();
    paletteRef.current = palette;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container,
      style: MAP_STYLE,
      center: [106.827, -6.21],
      zoom: 10,
      pitch: PITCH,
      bearing: BEARING,
      // Tepi gedung 3D bergerigi tanpa ini.
      antialias: true,
      attributionControl: false,
    });
    mapRef.current = map;

    // Kompas wajib menyala begitu peta miring: itu satu-satunya jalan pulang
    // ke utara setelah pengguna memutar peta.
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));

    map.on("style.load", () => {
      // Siang hari, label POI dimatikan — penanda kita yang harus jadi hal
      // paling menonjol di layar, bukan nama kafe.
      map.setConfigProperty("basemap", "lightPreset", "day");
      map.setConfigProperty("basemap", "showPointOfInterestLabels", false);
    });

    map.on("load", () => {
      const located = locatedOnly(properties);

      map.addSource(POINT_SOURCE, {
        type: "geojson",
        data: toPointGeoJSON(located, palette),
        cluster: true,
        clusterRadius: 55,
        clusterMaxZoom: 13,
        // Angka di cluster = total unit kosong, bukan jumlah properti.
        clusterProperties: { vacant: ["+", ["get", "vacant"]] },
      });

      // Mapbox hanya membangun tile untuk source yang dipakai minimal satu
      // layer. Penanda HTML tidak menghitung sebagai layer, jadi tanpa layer
      // kosong ini querySourceFeatures selalu mengembalikan array kosong dan
      // tidak ada satu pun pin atau cluster yang pernah muncul.
      map.addLayer({
        id: POINT_PROBE_LAYER,
        type: "circle",
        source: POINT_SOURCE,
        paint: { "circle-radius": 1, "circle-opacity": 0 },
      });

      map.addSource(BOX_SOURCE, {
        type: "geojson",
        data: toBoxGeoJSON(located, palette),
        // Feature id-nya string (workspace_id); tanpa promoteId, setFeatureState
        // tidak punya pegangan.
        promoteId: "id",
      });

      map.addLayer({
        id: BOX_LAYER,
        type: "fill-extrusion",
        source: BOX_SOURCE,
        paint: {
          "fill-extrusion-color": [
            "case",
            ["boolean", ["feature-state", "dimmed"], false],
            ["get", "dimColor"],
            ["boolean", ["feature-state", "hover"], false],
            ["get", "hoverColor"],
            ["get", "color"],
          ],
          // Tinggi bercerita: makin banyak unit kosong, makin menjulang.
          "fill-extrusion-height": [
            "+",
            BOX_BASE_H,
            ["*", ["coalesce", ["get", "vacant"], 0], BOX_H_PER_VACANT],
          ],
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 0.9,
          "fill-extrusion-vertical-gradient": true,
        },
      });

      fitToProperties(map, properties);
      updateMarkers();
      applyVisualState();
    });

    // Penanda HTML tidak ikut sistem cluster Mapbox, jadi disinkronkan manual
    // dari fitur yang sedang dirender. Pola resmi Mapbox untuk cluster HTML.
    function updateMarkers() {
      if (!map.getSource(POINT_SOURCE) || !map.isSourceLoaded(POINT_SOURCE)) return;

      // `GeoJSONFeature` milik mapbox-gl memakai namespace UMD `GeoJSON`, yang
      // tidak terlihat dari file modul — jadi tipenya kosong. Dikembalikan ke
      // tipe GeoJSON asli di sini, satu tempat.
      const features = map.querySourceFeatures(POINT_SOURCE) as unknown as Feature<
        Point,
        Record<string, unknown>
      >[];
      const seen = new Set<string>();

      for (const f of features) {
        if (f.geometry.type !== "Point") continue;
        const coords = f.geometry.coordinates as [number, number];
        const p = f.properties ?? {};
        const clusterId = p.cluster ? (p.cluster_id as number) : null;
        const key = clusterId !== null ? `c${clusterId}` : `p${p.id}`;
        if (seen.has(key)) continue;
        seen.add(key);

        let marker = markers.get(key);
        if (!marker) {
          const el =
            clusterId !== null
              ? createCluster(Number(p.vacant ?? 0))
              : createPin(p as PinProps);

          if (clusterId !== null) {
            el.addEventListener("click", () => {
              const source = map.getSource(POINT_SOURCE) as mapboxgl.GeoJSONSource;
              source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err || zoom == null) return;
                map.easeTo({ center: coords, zoom });
              });
            });
          } else {
            const id = String(p.id);
            pinEls.set(id, el);
            el.addEventListener("click", () => handlersRef.current.onSelect(id));
            el.addEventListener("mouseenter", () => handlersRef.current.onHover(id));
            el.addEventListener("mouseleave", () => handlersRef.current.onHover(null));
          }

          marker = new mapboxgl.Marker({ element: el }).setLngLat(coords);
          markers.set(key, marker);
        }

        if (!onScreen.has(key)) {
          marker.addTo(map);
          onScreen.add(key);
        }
      }

      for (const key of onScreen) {
        if (!seen.has(key)) {
          markers.get(key)?.remove();
          onScreen.delete(key);
        }
      }

      applyVisualState();
    }

    map.on("render", updateMarkers);

    // Hover di balok 3D. Pointer bisa lepas dari satu balok langsung ke balok
    // lain tanpa mouseleave, jadi id terakhir disimpan dan dibersihkan sendiri.
    map.on("mousemove", BOX_LAYER, (e) => {
      if (stateRef.current.editingId) return;
      const id = e.features?.[0]?.id;
      if (id == null) return;
      const next = String(id);
      if (boxHoverRef.current === next) return;
      boxHoverRef.current = next;
      map.getCanvas().style.cursor = "pointer";
      handlersRef.current.onHover(next);
    });

    map.on("mouseleave", BOX_LAYER, () => {
      if (stateRef.current.editingId) return;
      boxHoverRef.current = null;
      map.getCanvas().style.cursor = "";
      handlersRef.current.onHover(null);
    });

    map.on("click", BOX_LAYER, (e) => {
      if (stateRef.current.editingId) return;
      const id = e.features?.[0]?.id;
      if (id == null) return;
      handlersRef.current.onSelect(String(id));
    });

    // Klik di luar balok: menaruh titik saat sedang mengedit, menutup popup
    // kalau tidak.
    map.on("click", (e) => {
      if (stateRef.current.editingId) {
        handlersRef.current.onDraftChange({
          latitude: e.lngLat.lat,
          longitude: e.lngLat.lng,
        });
        return;
      }
      const hit = map.queryRenderedFeatures(e.point, { layers: [BOX_LAYER] });
      if (hit.length === 0) handlersRef.current.onSelect(null);
    });

    const observer = new ResizeObserver(() => map.resize());
    observer.observe(container);

    return () => {
      observer.disconnect();
      popupRef.current?.remove();
      draftMarkerRef.current?.remove();
      map.remove();
      mapRef.current = null;
      markers.clear();
      onScreen.clear();
      pinEls.clear();
    };
    // Sengaja sekali jalan: data dan state disuntikkan lewat efek di bawah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Data berubah: kedua source diperbarui bersama supaya balok dan pin tidak
  // pernah menggambarkan dua versi data yang berbeda.
  useEffect(() => {
    const map = mapRef.current;
    const palette = paletteRef.current;
    const pointSource = map?.getSource(POINT_SOURCE) as mapboxgl.GeoJSONSource | undefined;
    const boxSource = map?.getSource(BOX_SOURCE) as mapboxgl.GeoJSONSource | undefined;
    if (!map || !palette || !pointSource || !boxSource) return;

    const located = locatedOnly(properties);
    pointSource.setData(toPointGeoJSON(located, palette));
    boxSource.setData(toBoxGeoJSON(located, palette));

    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();
    onScreenRef.current.clear();
    pinElsRef.current.clear();
  }, [properties]);

  // Tanpa deps: setiap render menyegarkan ref lalu langsung menerapkan keadaan
  // visual ke elemen penanda dan feature-state, yang hidup di luar React.
  useEffect(() => {
    stateRef.current = { visibleIds, selectedId, hoveredId, editingId, properties };
    handlersRef.current = { onSelect, onHover, onEdit, onOpenCanvas, onDraftChange };
    applyVisualState();
  });

  // Popup detail mengikuti pilihan, bukan klik — supaya klik baris di panel
  // memunculkan popup yang sama dengan klik balok.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    popupRef.current?.remove();
    popupRef.current = null;

    if (!selectedId || editingId) return;
    const target = locatedOnly(properties).find(
      (p) => p.subject_id === selectedId,
    );
    if (!target) return;

    popupRef.current = new mapboxgl.Popup({
      offset: 22,
      closeButton: true,
      className: "maps-popup-shell",
      maxWidth: "300px",
    })
      .setLngLat([target.longitude, target.latitude])
      .setDOMContent(
        createPopupContent(
          target,
          () => handlersRef.current.onEdit(target.subject_id),
          () => handlersRef.current.onOpenCanvas(target),
        ),
      )
      .addTo(map);

    popupRef.current.on("close", () => handlersRef.current.onSelect(null));
    // `properties` sengaja ikut: popup harus menampilkan angka terbaru setelah
    // lokasi disimpan.
  }, [selectedId, editingId, properties]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId || editingId) return;
    const target = locatedOnly(properties).find(
      (p) => p.subject_id === selectedId,
    );
    if (!target) return;
    // pitch tidak dikirim: flyTo mempertahankan kemiringan yang sedang dipakai,
    // jadi sudut pandang pilihan pengguna tidak direset tiap klik baris.
    map.flyTo({
      center: [target.longitude, target.latitude],
      zoom: Math.max(map.getZoom(), 16),
      duration: 900,
    });
  }, [selectedId, editingId, properties]);

  // Mode edit: kursor jadi bidik, dan titik sementara bisa digeser.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.getCanvas().style.cursor = editingId ? "crosshair" : "";

    if (!editingId || !draft) {
      draftMarkerRef.current?.remove();
      draftMarkerRef.current = null;
      return;
    }

    if (!draftMarkerRef.current) {
      // setLngLat wajib sebelum addTo: Marker membaca koordinatnya sendiri saat
      // menempel ke peta, dan meledak kalau belum ada.
      const marker = new mapboxgl.Marker({
        element: createDraftPin(),
        draggable: true,
        anchor: "bottom",
      }).setLngLat([draft.longitude, draft.latitude]);
      marker.on("dragend", () => {
        const { lat, lng } = marker.getLngLat();
        handlersRef.current.onDraftChange({ latitude: lat, longitude: lng });
      });
      marker.addTo(map);
      draftMarkerRef.current = marker;
      return;
    }
    draftMarkerRef.current.setLngLat([draft.longitude, draft.latitude]);
  }, [editingId, draft]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="grid h-full place-items-center rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
        <div className="max-w-sm space-y-2">
          <h3 className="text-base font-semibold">Peta belum bisa dimuat</h3>
          <p className="text-sm text-muted">
            Access token Mapbox belum diset. Tambahkan{" "}
            <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">
              NEXT_PUBLIC_MAPBOX_TOKEN
            </code>{" "}
            ke file <code className="text-xs">.env.local</code>, lalu jalankan
            ulang dev server. Daftar properti di samping tetap bisa dipakai.
          </p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full rounded-2xl" />;
}

function fitToProperties(map: mapboxgl.Map, properties: Property[]) {
  const located = locatedOnly(properties);
  if (located.length === 0) return;
  const bounds = new mapboxgl.LngLatBounds();
  located.forEach((p) => bounds.extend([p.longitude, p.latitude]));
  // pitch & bearing dikirim eksplisit: tanpa itu fitBounds meratakan kamera
  // kembali ke 0 dan efek 3D-nya hilang.
  map.fitBounds(bounds, {
    padding: 90,
    maxZoom: 16,
    duration: 0,
    pitch: PITCH,
    bearing: BEARING,
  });
}
