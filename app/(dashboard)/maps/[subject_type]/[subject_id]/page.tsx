import { notFound } from "next/navigation";
import type { SubjectType } from "@/types";
import { CanvasWorkspace } from "../../_components/canvas-workspace";

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ subject_type: string; subject_id: string }>;
}) {
  const { subject_type, subject_id } = await params;

  // Halaman penuh, bukan modal: URL berubah dan tombol back browser bekerja.
  if (subject_type !== "tenant" && subject_type !== "workspace") notFound();

  return (
    <CanvasWorkspace
      subjectType={subject_type as SubjectType}
      subjectId={subject_id}
    />
  );
}
