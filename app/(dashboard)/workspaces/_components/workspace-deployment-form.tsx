"use client";

import { useId, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  workspaceDeploymentSchema,
  type WorkspaceDeploymentInput,
} from "@/lib/validations/workspace-deployment";
import { useUpdateWorkspaceDeployment } from "@/hooks/api/use-workspace";
import { WorkspaceDeployment } from "@/types";
import { FormStyles } from "@/components/form-styles";
import { ApiError } from "@/lib/axios";
import { Spinner } from "@/components/ui/spinner";
import type { DeploymentDefaults } from "@/lib/deployment-defaults";

type Props = {
  workspaceId: string;
  deployment: WorkspaceDeployment | null | undefined;
  defaults: DeploymentDefaults;
};

export function WorkspaceDeploymentForm({ workspaceId, deployment, defaults }: Props) {
  const mutation = useUpdateWorkspaceDeployment(workspaceId);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Blank fields fall back to the cluster defaults, so a freshly created
  // workspace lands here with the addresses already filled in.
  const initialValues: WorkspaceDeploymentInput = {
    api_base_url: deployment?.api_base_url || defaults.api_base_url,
    cluster_id: deployment?.cluster_id || defaults.cluster_id,
    grpc_addr: deployment?.grpc_addr || defaults.grpc_addr,
    is_active: deployment?.is_active ?? true,
    mobile_base_url: deployment?.mobile_base_url || defaults.mobile_base_url,
    mobile_grpc_addr: deployment?.mobile_grpc_addr || defaults.mobile_grpc_addr,
    operator_grpc_addr: deployment?.operator_grpc_addr || defaults.operator_grpc_addr,
    payment_base_url: deployment?.payment_base_url || defaults.payment_base_url,
    payment_grpc_addr: deployment?.payment_grpc_addr || defaults.payment_grpc_addr,
    region: deployment?.region || defaults.region,
  };

  const prefilled = !deployment;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<WorkspaceDeploymentInput>({
    resolver: zodResolver(workspaceDeploymentSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (data: WorkspaceDeploymentInput) => {
    setErrorMsg(null);
    try {
      await mutation.mutateAsync(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    }
  };

  const ids = {
    apiBaseUrl: useId(),
    clusterId: useId(),
    grpcAddr: useId(),
    isActive: useId(),
    mobileBaseUrl: useId(),
    mobileGrpcAddr: useId(),
    operatorGrpcAddr: useId(),
    paymentBaseUrl: useId(),
    paymentGrpcAddr: useId(),
    region: useId(),
  };

  const pending = mutation.isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-border bg-surface p-8 shadow-[0_1px_2px_rgba(15,31,26,0.04)] space-y-6"
    >
      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-semibold text-foreground">Deployment</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure the cluster, service addresses, and base URLs for this workspace deployment.
        </p>
      </div>

      {prefilled && (
        <div role="status" className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-xs text-muted">
          This workspace has no deployment yet, so the fields below are pre-filled with
          the cluster defaults. Check them before saving.
        </div>
      )}

      {errorMsg && (
        <div role="alert" className="rounded-lg border border-danger-soft bg-danger-soft/60 px-3 py-2 text-sm text-danger">
          {errorMsg}
        </div>
      )}

      {mutation.isSuccess && mutation.data?.synced === false ? (
        <div role="alert" className="rounded-lg border border-warning-soft bg-warning-soft/60 px-3 py-2 text-sm text-warning">
          Deployment saved, but the operator service did not accept it, so this
          workspace is not active on the operator side yet. Save again once the
          operator service is reachable.
          {mutation.data.sync_error ? (
            <span className="mt-1 block font-mono text-xs opacity-80">{mutation.data.sync_error}</span>
          ) : null}
        </div>
      ) : mutation.isSuccess ? (
        <div role="alert" className="rounded-lg border border-success-soft bg-success-soft/60 px-3 py-2 text-sm text-success">
          Deployment configuration updated successfully.
        </div>
      ) : null}

      {/* General */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-widest">General</h4>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor={ids.region} className="block text-sm font-medium">
              Region
            </label>
            <input
              id={ids.region}
              type="text"
              placeholder="e.g. ap-southeast-1"
              className={`input ${errors.region ? "error" : ""}`}
              disabled={pending}
              autoComplete="off"
              {...register("region")}
            />
            {errors.region ? (
              <p className="text-xs text-danger">{errors.region.message}</p>
            ) : (
              <p className="text-xs text-muted">Cloud region where this workspace is deployed.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor={ids.clusterId} className="block text-sm font-medium">
              Cluster ID
            </label>
            <input
              id={ids.clusterId}
              type="text"
              placeholder="e.g. cluster-prod-01"
              className={`input ${errors.cluster_id ? "error" : ""}`}
              disabled={pending}
              autoComplete="off"
              {...register("cluster_id")}
            />
            {errors.cluster_id ? (
              <p className="text-xs text-danger">{errors.cluster_id.message}</p>
            ) : (
              <p className="text-xs text-muted">Identifier of the Kubernetes / VM cluster.</p>
            )}
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <Controller
              control={control}
              name="is_active"
              render={({ field }) => (
                <button
                  type="button"
                  id={ids.isActive}
                  role="switch"
                  aria-checked={field.value}
                  disabled={pending}
                  onClick={() => field.onChange(!field.value)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    field.value ? "bg-brand" : "bg-surface-muted"
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${
                      field.value ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              )}
            />
            <label htmlFor={ids.isActive} className="text-sm font-medium cursor-pointer select-none">
              Active
              <span className="ml-2 text-xs text-muted font-normal">
                Enable this deployment to serve traffic.
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* PLATFORM */}
      <div className="space-y-4 border-t border-border pt-5">
        <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-widest">Platform</h4>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor={ids.grpcAddr} className="block text-sm font-medium">
              Platform GRPC Address
            </label>
            <input
              id={ids.grpcAddr}
              type="text"
              placeholder="api.example.com:9090"
              className={`input ${errors.grpc_addr ? "error" : ""}`}
              disabled={pending}
              autoComplete="off"
              {...register("grpc_addr")}
            />
            {errors.grpc_addr ? (
              <p className="text-xs text-danger">{errors.grpc_addr.message}</p>
            ) : (
              <p className="text-xs text-muted">gRPC address for the platform API service (host:port).</p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="space-y-4 border-t border-border pt-5">
        <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-widest">Mobile</h4>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor={ids.mobileBaseUrl} className="block text-sm font-medium">
              Mobile Base URL
            </label>
            <input
              id={ids.mobileBaseUrl}
              type="text"
              placeholder="https://mobile-api.example.com"
              className={`input ${errors.mobile_base_url ? "error" : ""}`}
              disabled={pending}
              autoComplete="off"
              {...register("mobile_base_url")}
            />
            {errors.mobile_base_url ? (
              <p className="text-xs text-danger">{errors.mobile_base_url.message}</p>
            ) : (
              <p className="text-xs text-muted">HTTP base URL for the mobile app API service.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor={ids.mobileGrpcAddr} className="block text-sm font-medium">
              Mobile GRPC Address
            </label>
            <input
              id={ids.mobileGrpcAddr}
              type="text"
              placeholder="mobile.example.com:9090"
              className={`input ${errors.mobile_grpc_addr ? "error" : ""}`}
              disabled={pending}
              autoComplete="off"
              {...register("mobile_grpc_addr")}
            />
            {errors.mobile_grpc_addr ? (
              <p className="text-xs text-danger">{errors.mobile_grpc_addr.message}</p>
            ) : (
              <p className="text-xs text-muted">gRPC address for the mobile service (host:port).</p>
            )}
          </div>
        </div>
      </div>

      {/* Operator */}
      <div className="space-y-4 border-t border-border pt-5">
        <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-widest">Operator</h4>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor={ids.apiBaseUrl} className="block text-sm font-medium">
              Operator Base URL
            </label>
            <input
              id={ids.apiBaseUrl}
              type="text"
              placeholder="https://api.example.com"
              className={`input ${errors.api_base_url ? "error" : ""}`}
              disabled={pending}
              autoComplete="off"
              {...register("api_base_url")}
            />
            {errors.api_base_url ? (
              <p className="text-xs text-danger">{errors.api_base_url.message}</p>
            ) : (
              <p className="text-xs text-muted">HTTP base URL for the operator API service.</p>
            )}
          </div>
          <div className="space-y-1.5 md:grid-cols-2">
            <label htmlFor={ids.operatorGrpcAddr} className="block text-sm font-medium">
              Operator GRPC Address
            </label>
            <input
              id={ids.operatorGrpcAddr}
              type="text"
              placeholder="operator.example.com:9090"
              className={`input ${errors.operator_grpc_addr ? "error" : ""}`}
              disabled={pending}
              autoComplete="off"
              {...register("operator_grpc_addr")}
            />
            {errors.operator_grpc_addr ? (
              <p className="text-xs text-danger">{errors.operator_grpc_addr.message}</p>
            ) : (
              <p className="text-xs text-muted">gRPC address for the operator service (host:port).</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="space-y-4 border-t border-border pt-5">
        <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-widest">Payment</h4>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor={ids.paymentBaseUrl} className="block text-sm font-medium">
              Payment Base URL
            </label>
            <input
              id={ids.paymentBaseUrl}
              type="text"
              placeholder="https://payment.example.com"
              className={`input ${errors.payment_base_url ? "error" : ""}`}
              disabled={pending}
              autoComplete="off"
              {...register("payment_base_url")}
            />
            {errors.payment_base_url ? (
              <p className="text-xs text-danger">{errors.payment_base_url.message}</p>
            ) : (
              <p className="text-xs text-muted">HTTP base URL for the payment service.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor={ids.paymentGrpcAddr} className="block text-sm font-medium">
              Payment GRPC Address
            </label>
            <input
              id={ids.paymentGrpcAddr}
              type="text"
              placeholder="payment.example.com:9090"
              className={`input ${errors.payment_grpc_addr ? "error" : ""}`}
              disabled={pending}
              autoComplete="off"
              {...register("payment_grpc_addr")}
            />
            {errors.payment_grpc_addr ? (
              <p className="text-xs text-danger">{errors.payment_grpc_addr.message}</p>
            ) : (
              <p className="text-xs text-muted">gRPC address for the payment service (host:port).</p>
            )}
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong disabled:opacity-60"
        >
          {pending && <Spinner />}
          Save changes
        </button>
      </footer>

      <FormStyles />
    </form>
  );
}
