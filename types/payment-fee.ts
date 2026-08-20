export type PaymentFee = {
  id: string;
  workspace_id: string;
  payment_method: string;
  payment_per_month: number;
  maximum_payment: number;
  maximum_month: number;
  is_flat: boolean;
  flat_value: number;
  created_at: string;
  updated_at: string;
};

export type PaymentFeeListResponse = {
  items: PaymentFee[];
};

export type PaymentFeePayload = {
  payment_method: string;
  payment_per_month: number;
  maximum_payment: number;
  maximum_month: number;
  is_flat: boolean;
  flat_value: number;
};
