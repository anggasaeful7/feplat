export type TipeWorkspaceCode = "residence" | "apartement" | "kost";

export type TipeWorkspace = {
  code: TipeWorkspaceCode;
  name: string;
  description: string;
};

export const TIPE_WORKSPACE_CODES: TipeWorkspaceCode[] = [
  "residence",
  "apartement",
  "kost",
];

export const TIPE_WORKSPACE_DEFAULT: TipeWorkspaceCode = "residence";

export const TIPE_WORKSPACE_LABELS: Record<TipeWorkspaceCode, string> = {
  residence: "Residence",
  apartement: "Apartement",
  kost: "Kost",
};

export type Workspace = {
  id: string;
  display_name: string;
  slug: string;
  logo: string;
  tipe_workspace: TipeWorkspaceCode;
  tipe_workspace_name: string;
  expired_at: string;
  created_at: string;
  updated_at: string;
  tenant_id?: string;
  code?: string;
  rw?: string;
};

export type WorkspaceListResponse = {
  items: Workspace[];
  total: number;
  limit: number;
  offset: number;
};

export type WorkspaceCreateResponse = {
  workspace: Workspace;
  admin_email: string;
  admin_user_id: string;
};

export type WorkspaceWritePayload = {
  display_name: string;
  slug: string;
  logo?: string;
  tipe_workspace?: TipeWorkspaceCode;
  expired_at?: string;
  tenant_id?: string;
  code?: string;
  admin_name?: string;
  admin_email?: string;
  rw?: string;
  payout_bank?: {
    bank_merchant_id: string;
    bank_account_number: string;
    bank_account_name: string;
  };
  doku_sub_account?: {
    email: string;
    type: "STANDARD";
    name: string;
  };
};

export type DokuSubAccount = {
  id: string;
  workspace_id: string;
  account_id: string;
  account_name: string;
  account_type: string;
  account_email: string;
  provisioning_status: string;
  last_error?: string | null;
  created_at: string;
  updated_at: string;
};

export type PayoutBank = {
  id: string;
  workspace_id: string;
  bank_merchant_id: string;
  bank_name: string;
  bank_code: string;
  bank_swift_code: string;
  bank_account_number: string;
  bank_account_name: string;
  is_active: boolean;
  verification_status: string;
  created_at: string;
  updated_at: string;
};

export type WorkspaceDeployment = {
  api_base_url: string;
  cluster_id: string;
  grpc_addr: string;
  is_active: boolean;
  mobile_base_url: string;
  mobile_grpc_addr: string;
  operator_grpc_addr: string;
  payment_base_url: string;
  payment_grpc_addr: string;
  region: string;
};

/**
 * The PUT /deployment response. The deployment row is saved before the operator
 * sync runs, so a failed sync still returns 200 — `synced: false` is how the
 * partial success is reported. Absent on plain reads, which cannot know.
 */
export type WorkspaceDeploymentResult = WorkspaceDeployment & {
  workspace_id: string;
  synced?: boolean;
  sync_error?: string;
};

export type WorkspaceDetailResponse = {
  workspace: Workspace;
  admin_user_id?: string;
  admin_email?: string;
  doku_sub_account?: DokuSubAccount | null;
  payout_bank?: PayoutBank | null;
  deployment?: WorkspaceDeployment | null;
};

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const DEFAULT_PAGE_SIZE = 10;

export type WorkspaceBalance = {
  account_id: string;
  available_amount: number;
  checked_at: string;
  pending_amount: number;
  workspace_id: string;
};
