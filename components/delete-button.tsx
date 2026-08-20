"use client";

import React from "react";
import { useConfirmStore } from "@/store/use-confirm-store";
import { TrashIcon } from "@/app/_components/icons";

export interface DeleteButtonProps {
  id: string;
  name: string;
  confirmTitle?: string;
  confirmMessage?: string;
  buttonLabel?: string;
  isPending?: boolean;
  onDelete: (id: string) => Promise<void> | void;
  variant?: "icon" | "button";
  confirmInputText?: string;
  confirmInputPlaceholder?: string;
}

export function DeleteButton({
  id,
  name,
  confirmTitle = "Delete Item",
  confirmMessage = `Are you sure you want to delete "${name}"?`,
  buttonLabel = "Delete",
  isPending = false,
  onDelete,
  variant = "icon",
  confirmInputText,
  confirmInputPlaceholder,
}: DeleteButtonProps) {
  const confirm = useConfirmStore((state) => state.confirm);

  function onClick() {
    confirm({
      title: confirmTitle,
      message: confirmMessage,
      isDestructive: true,
      confirmLabel: "Delete",
      confirmInputText,
      confirmInputPlaceholder,
      onConfirm: async () => {
        await onDelete(id);
      },
    });
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft/60 px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger-soft disabled:opacity-60"
      >
        <TrashIcon className="h-4 w-4" />
        {isPending ? "Deleting…" : buttonLabel}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Delete ${name}`}
      disabled={isPending}
      className="grid h-8 w-8 place-items-center rounded-md text-foreground/55 transition hover:bg-danger-soft hover:text-danger disabled:opacity-60"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}
