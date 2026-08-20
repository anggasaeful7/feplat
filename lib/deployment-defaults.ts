import type { WorkspaceDeploymentInput } from "@/lib/validations/workspace-deployment";

export type DeploymentDefaults = Omit<WorkspaceDeploymentInput, "is_active">;

/**
 * Default deployment addresses for a workspace that has none yet.
 *
 * Every workspace in a given cluster shares these — the hostnames encode the
 * environment and the service, not the workspace — so they are read from the
 * server environment, not derived from the workspace record.
 *
 * Server-only: call this from a server component and pass the result down.
 */
export function deploymentDefaults(): DeploymentDefaults {
  const env = process.env.DEPLOYMENT_ENV ?? "prod";
  const domain = process.env.DEPLOYMENT_DOMAIN ?? "iplsistem.id";

  const api = (service: string) => `https://api-${env}-${service}.${domain}`;
  const grpc = (service: string) => `grpc-${env}-${service}.${domain}:443`;

  return {
    region: process.env.DEPLOYMENT_REGION ?? "id-jkt",
    cluster_id: process.env.DEPLOYMENT_CLUSTER_ID ?? "Cluster-1",
    grpc_addr: grpc("platform"),
    mobile_base_url: api("user"),
    mobile_grpc_addr: grpc("user"),
    api_base_url: api("operator"),
    operator_grpc_addr: grpc("operator"),
    payment_base_url: api("payment"),
    payment_grpc_addr: grpc("payment"),
  };
}
