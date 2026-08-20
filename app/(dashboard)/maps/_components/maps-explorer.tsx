"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { OccupancyLevel, PropertyType } from "@/types";
import { OCCUPANCY_LEVELS, PROPERTY_TYPES } from "@/types";
import { ErrorState } from "@/components/error-state";
import { Spinner } from "@/components/ui/spinner";
import { useProperties } from "@/hooks/api/use-property";
import { occupancyLevel } from "../_lib/occupancy";
import { LocationEditor } from "./location-editor";
import { PropertyMap } from "./property-map";
import { PropertyPanel } from "./property-panel";

type Draft = { latitude: number; longitude: number };

export function MapsExplorer() {
  const router = useRouter();
  const { data, isPending, isError, error } = useProperties();

  const [search, setSearch] = useState("");
  const [types, setTypes] = useState(() => new Set(PROPERTY_TYPES));
  const [levels, setLevels] = useState(() => new Set(OCCUPANCY_LEVELS));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const properties = useMemo(() => data?.items ?? [], [data]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return properties.filter(
      (p) =>
        types.has(p.type) &&
        levels.has(occupancyLevel(p)) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.subject_name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)),
    );
  }, [properties, search, types, levels]);

  const visibleIds = useMemo(
    () => new Set(visible.map((p) => p.subject_id)),
    [visible],
  );

  const editing = useMemo(
    () => properties.find((p) => p.subject_id === editingId) ?? null,
    [properties, editingId],
  );

  function toggle<T>(setter: React.Dispatch<React.SetStateAction<Set<T>>>) {
    return (value: T) =>
      setter((prev) => {
        const next = new Set(prev);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        return next;
      });
  }

  function startEdit(subjectId: string) {
    const target = properties.find((p) => p.subject_id === subjectId);
    setEditingId(subjectId);
    setSelectedId(null);
    // Properti yang sudah punya koordinat mulai dari posisinya sekarang, bukan
    // dari nol — mengedit alamat tidak boleh memaksa menaruh ulang titiknya.
    setDraft(
      target?.latitude != null && target?.longitude != null
        ? { latitude: target.latitude, longitude: target.longitude }
        : null,
    );
  }

  function stopEdit() {
    setEditingId(null);
    setDraft(null);
  }

  if (isPending) {
    return (
      <div className="grid h-[70vh] place-items-center rounded-2xl border border-border bg-surface">
        <Spinner className="h-6 w-6 text-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load properties"
        message={error instanceof Error ? error.message : "Coba lagi sebentar."}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100vh-13rem)] lg:flex-row">
      <div className="order-2 lg:order-1 lg:h-full lg:w-[23rem] lg:shrink-0">
        <div className="h-[26rem] lg:h-full">
          <PropertyPanel
            properties={properties}
            visible={visible}
            search={search}
            types={types}
            levels={levels}
            selectedId={selectedId}
            hoveredId={hoveredId}
            editor={
              editing ? (
                <LocationEditor
                  property={editing}
                  draft={draft}
                  onDraftChange={setDraft}
                  onClose={stopEdit}
                />
              ) : undefined
            }
            onSearchChange={setSearch}
            onToggleType={toggle<PropertyType>(setTypes)}
            onToggleLevel={toggle<OccupancyLevel>(setLevels)}
            onSelect={setSelectedId}
            onHover={setHoveredId}
            onEdit={startEdit}
          />
        </div>
      </div>

      <div className="order-1 h-[22rem] overflow-hidden rounded-2xl border border-border sm:h-[28rem] lg:order-2 lg:h-full lg:flex-1">
        <PropertyMap
          properties={properties}
          visibleIds={visibleIds}
          selectedId={selectedId}
          hoveredId={hoveredId}
          editingId={editingId}
          draft={draft}
          onSelect={setSelectedId}
          onHover={setHoveredId}
          onEdit={startEdit}
          onOpenCanvas={(p) =>
            router.push(`/maps/${p.subject_type}/${p.subject_id}`)
          }
          onDraftChange={setDraft}
        />
      </div>
    </div>
  );
}
