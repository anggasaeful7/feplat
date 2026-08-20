"use client";

import { useState, useId } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";

import { invoiceSchema, type InvoiceInput } from "@/lib/validations/invoice";
import { useCreateInvoice, useUpdateInvoice } from "@/hooks/api/use-invoice";
import { useWorkspaces } from "@/hooks/api/use-workspace";
import type { PlatformInvoice } from "@/types";
import { FormStyles } from "@/components/form-styles";
import { Drawer } from "@/components/ui/drawer";
import { DatePicker } from "@/components/ui/date-picker";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/axios";
import { formatIDR, formatLocalDate } from "@/lib/utils";

type Props = {
  open: boolean;
  invoice?: PlatformInvoice;
  onClose: () => void;
};

export function InvoiceFormPanel({ open, invoice, onClose }: Props) {
  const isEdit = !!invoice;
  return (
    <Drawer
      open={open}
      title={isEdit ? `Edit Invoice #${invoice.number}` : "Invoice Baru"}
      subtitle={isEdit ? invoice.bill_to_name : "Nominal dan deskripsi diisi manual."}
      width="lg"
      onClose={onClose}
    >
      <InvoiceForm key={invoice?.id ?? "new"} invoice={invoice} onClose={onClose} />
    </Drawer>
  );
}

function InvoiceForm({ invoice, onClose }: { invoice?: PlatformInvoice; onClose: () => void }) {
  const isEdit = !!invoice;
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice(invoice?.id ?? "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { data: workspaceData } = useWorkspaces({ limit: 200 });
  const workspaces = workspaceData?.items ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      workspace_id: invoice?.workspace_id ?? "",
      bill_to_name: invoice?.bill_to_name ?? "",
      bill_to_address: invoice?.bill_to_address ?? "",
      invoice_date: invoice?.invoice_date ?? formatLocalDate(new Date()),
      payment_terms: invoice?.payment_terms ?? "",
      po_number: invoice?.po_number ?? "",
      notes: invoice?.notes ?? "",
      items: invoice?.items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        rate: it.rate,
      })) ?? [{ description: "", quantity: 1, rate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const items = watch("items");
  const total = items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.rate) || 0),
    0,
  );

  const pending = createMutation.isPending || updateMutation.isPending;

  const ids = {
    workspace: useId(),
    billToName: useId(),
    billToAddress: useId(),
    paymentTerms: useId(),
    poNumber: useId(),
    notes: useId(),
  };

  const onSubmit = async (data: InvoiceInput) => {
    setErrorMsg(null);
    const payload = {
      ...data,
      workspace_id: data.workspace_id ? data.workspace_id : null,
    };
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Terjadi kesalahan. Coba lagi.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col gap-6">
      {errorMsg && (
        <div
          role="alert"
          className="rounded-lg border border-danger-soft bg-danger-soft/60 px-3 py-2 text-sm text-danger"
        >
          {errorMsg}
        </div>
      )}

      <Section title="Bill To">
        <div className="space-y-1.5">
          <label htmlFor={ids.billToName} className="block text-sm font-medium">
            Nama Penerima
          </label>
          <input
            id={ids.billToName}
            type="text"
            className={`input ${errors.bill_to_name ? "error" : ""}`}
            placeholder="RW 29 Perum Tre Vista Residence"
            disabled={pending}
            {...register("bill_to_name")}
          />
          {errors.bill_to_name && <p className="text-xs text-danger">{errors.bill_to_name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.billToAddress} className="block text-sm font-medium">
            Alamat <span className="text-muted">(opsional)</span>
          </label>
          <textarea
            id={ids.billToAddress}
            rows={2}
            className="input min-h-20 py-2"
            disabled={pending}
            {...register("bill_to_address")}
          />
          {errors.bill_to_address && (
            <p className="text-xs text-danger">{errors.bill_to_address.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.workspace} className="block text-sm font-medium">
            Workspace <span className="text-muted">(opsional, untuk filter)</span>
          </label>
          <select
            id={ids.workspace}
            className="input"
            disabled={pending}
            {...register("workspace_id")}
          >
            <option value="">— Tidak dikaitkan —</option>
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.display_name}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Detail Invoice">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Tanggal</label>
            <DatePicker
              value={watch("invoice_date")}
              onChange={(value) => setValue("invoice_date", value, { shouldValidate: true })}
              disabled={pending}
            />
            {errors.invoice_date && (
              <p className="text-xs text-danger">{errors.invoice_date.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor={ids.paymentTerms} className="block text-sm font-medium">
              Payment Terms
            </label>
            <input
              id={ids.paymentTerms}
              type="text"
              className="input"
              placeholder="1"
              disabled={pending}
              {...register("payment_terms")}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.poNumber} className="block text-sm font-medium">
            PO Number
          </label>
          <input
            id={ids.poNumber}
            type="text"
            className="input"
            placeholder="TRV1-03-2026"
            disabled={pending}
            {...register("po_number")}
          />
        </div>
      </Section>

      <Section title="Item">
        {errors.items?.message && <p className="text-xs text-danger">{errors.items.message}</p>}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border border-border bg-surface p-3 space-y-3">
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  className={`input flex-1 ${errors.items?.[index]?.description ? "error" : ""}`}
                  placeholder="Maintenance & Support Bulan Juli 2026 (Monthly)"
                  disabled={pending}
                  {...register(`items.${index}.description`)}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={pending || fields.length === 1}
                  aria-label={`Hapus item ${index + 1}`}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-foreground/50 transition hover:bg-danger-soft/60 hover:text-danger disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {errors.items?.[index]?.description && (
                <p className="text-xs text-danger">{errors.items[index]?.description?.message}</p>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="input"
                    disabled={pending}
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted">Rate</label>
                  <div className="flex items-stretch overflow-hidden rounded-[0.625rem] border border-border focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
                    <span className="grid place-items-center bg-surface-muted px-3 text-xs font-medium text-muted">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="h-11 w-full flex-1 bg-surface px-3 text-sm outline-none disabled:opacity-65"
                      disabled={pending}
                      value={formatIDR(items[index]?.rate ?? 0)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, "");
                        setValue(`items.${index}.rate`, raw === "" ? 0 : Number(raw), {
                          shouldValidate: true,
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted">Amount</label>
                  <div className="flex h-11 items-center rounded-[0.625rem] border border-border/50 bg-surface-muted px-3 text-sm font-medium">
                    Rp{" "}
                    {formatIDR(
                      (Number(items[index]?.quantity) || 0) * (Number(items[index]?.rate) || 0),
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => append({ description: "", quantity: 1, rate: 0 })}
          disabled={pending || fields.length >= 50}
          className="rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-foreground/70 transition hover:border-brand hover:text-brand disabled:opacity-50"
        >
          + Tambah item
        </button>

        <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
          <span className="text-sm font-medium text-muted">Total Invoice</span>
          <span className="text-lg font-semibold">Rp {formatIDR(total)}</span>
        </div>
      </Section>

      <Section title="Catatan">
        <textarea
          id={ids.notes}
          rows={2}
          className="input min-h-20 py-2"
          placeholder="Catatan tambahan yang tampil di bawah PDF (opsional)"
          disabled={pending}
          {...register("notes")}
        />
      </Section>

      <div className="mt-auto flex items-center justify-end gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-surface-muted hover:text-foreground"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong disabled:opacity-60"
        >
          {pending && <Spinner />}
          {isEdit ? "Simpan perubahan" : "Buat Invoice"}
        </button>
      </div>

      <FormStyles />
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
