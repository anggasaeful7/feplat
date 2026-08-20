import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";
import { FloorplanService } from "@/services/floorplan.service";
import type { FloorPayload, FloorShape, SubjectType } from "@/types";
import { propertyQK } from "./use-property";

export const canvasQK = {
  all: ["canvas"] as const,
  detail: (type: SubjectType, id: string) => [...canvasQK.all, type, id] as const,
};

export function useCanvas(type: SubjectType, id: string) {
  return useQuery({
    queryKey: canvasQK.detail(type, id),
    queryFn: () => FloorplanService.getCanvas(type, id),
    enabled: !!id,
  });
}

function useCanvasMutation<TVars, TData>(
  fn: (vars: TVars) => Promise<TData>,
  type: SubjectType,
  id: string,
  success: string,
  failure: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: canvasQK.detail(type, id) });
      // Jumlah unit di peta ikut berubah begitu unit digambar.
      queryClient.invalidateQueries({ queryKey: propertyQK.all });
      toast.success(success);
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : failure);
    },
  });
}

export function useCreateFloor(type: SubjectType, id: string) {
  return useCanvasMutation(
    (payload: FloorPayload) => FloorplanService.createFloor(type, id, payload),
    type, id, "Lantai ditambahkan", "Gagal menambah lantai",
  );
}

export function useUpdateFloor(type: SubjectType, id: string) {
  return useCanvasMutation(
    ({ floorId, ...payload }: { floorId: string } & FloorPayload) =>
      FloorplanService.updateFloor(type, id, floorId, payload),
    type, id, "Lantai diperbarui", "Gagal memperbarui lantai",
  );
}

export function useDeleteFloor(type: SubjectType, id: string) {
  return useCanvasMutation(
    (floorId: string) => FloorplanService.deleteFloor(type, id, floorId),
    type, id, "Lantai dihapus", "Gagal menghapus lantai",
  );
}

export function useSaveShapes(type: SubjectType, id: string) {
  return useCanvasMutation(
    ({ floorId, shapes }: { floorId: string; shapes: FloorShape[] }) =>
      FloorplanService.replaceShapes(type, id, floorId, shapes),
    type, id, "Denah tersimpan", "Gagal menyimpan denah",
  );
}
