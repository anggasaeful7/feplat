"use client";

import { useConfirmStore } from "@/store/use-confirm-store";
import { Modal, ModalFormFooter } from "./modal";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

export function ConfirmDialog() {
  const { isOpen, options, isLoading, close, setLoading } = useConfirmStore();
  const [inputValue, setInputValue] = useState("");
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    setInputValue("");
  }

  if (!isOpen || !options) return null;

  const confirmDisabled =
    options.confirmInputText !== undefined &&
    inputValue !== options.confirmInputText;

  const handleConfirm = async () => {
    try {
      const result = options.onConfirm();
      if (result instanceof Promise) {
        setLoading(true);
        await result;
      }
      close();
    } catch {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (options.onCancel) {
      options.onCancel();
    }
    close();
  };

  return (
    <Modal
      open={isOpen}
      title={
        <div className="flex items-center gap-2">
          {options.isDestructive && <AlertCircle className="text-rose-600 h-5 w-5" />}
          <span className="text-lg font-bold text-zinc-900">
            {options.title || "Konfirmasi"}
          </span>
        </div>
      }
      onClose={handleCancel}
      className="max-w-md"
      footer={
        <ModalFormFooter
          isPending={isLoading}
          onClose={handleCancel}
          onSubmit={handleConfirm}
          submitLabel={options.confirmLabel || "Ya, Lanjutkan"}
          cancelLabel={options.cancelLabel || "Batal"}
          submitVariant={options.isDestructive ? "danger" : "primary"}
          cancelVariant="secondary"
          submitDisabled={confirmDisabled}
        />
      }
    >
      <div className="space-y-4">
        <div className="text-sm text-zinc-600 mt-2">
          {options.message}
        </div>

        {options.confirmInputText !== undefined && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-500">
              Silakan ketik <span className="font-semibold select-all text-zinc-800">&quot;{options.confirmInputText}&quot;</span> untuk mengonfirmasi.
            </p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={options.confirmInputPlaceholder || "Ketik di sini..."}
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-brand focus:ring-2 focus:ring-(--brand)/20"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
