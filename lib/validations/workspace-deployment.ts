import { z } from "zod";

export const workspaceDeploymentSchema = z.object({
  api_base_url: z.string().min(1, "API Base URL is required"),
  cluster_id: z.string().min(1, "Cluster ID is required"),
  grpc_addr: z.string().min(1, "GRPC Address is required"),
  is_active: z.boolean(),
  mobile_base_url: z.string().min(1, "Mobile Base URL is required"),
  mobile_grpc_addr: z.string().min(1, "Mobile GRPC Address is required"),
  operator_grpc_addr: z.string().min(1, "Operator GRPC Address is required"),
  payment_base_url: z.string().min(1, "Payment Base URL is required"),
  payment_grpc_addr: z.string().min(1, "Payment GRPC Address is required"),
  region: z.string().min(1, "Region is required"),
});

export type WorkspaceDeploymentInput = z.infer<typeof workspaceDeploymentSchema>;
