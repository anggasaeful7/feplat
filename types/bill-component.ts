export type BillComponent = {
  id: string;
  name: string;
  description: string;
  amount: number;
  is_variable: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BillComponentListResponse = {
  items: BillComponent[];
  total: number;
  limit: number;
  offset: number;
};

export type BillComponentWritePayload = {
  name: string;
  description: string;
  amount: number;
  is_variable: boolean;
  is_active: boolean;
  sort_order: number;
};

export const DEFAULT_BILL_COMPONENTS_PAGE_SIZE = 10;
