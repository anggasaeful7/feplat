export type PayoutFee = {
  code: string;
  description: string;
  value: number;
  updated_at: string;
};

export type PayoutFeePayload = {
  code: string;
  value: number;
};
