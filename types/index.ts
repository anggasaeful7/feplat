export * from "./auth";
export * from "./workspace";
export * from "./user";
export * from "./audit-log";
export * from "./stat";
export * from "./upload";
export * from "./tenant";
export * from "./payment-fee";
export * from "./bank-merchant";
export * from "./bill-component";
export * from "./general-facility";
export * from "./payout";
export * from "./payout-fee";
export * from "./invoice";
export * from "./property";
export * from "./floorplan";
export { SLUG_PATTERN } from "./workspace";


export type ApiEnvelope<T> = { data: T };

export type ApiErrorBody = {
  error: { code: string; message: string; details?: Record<string, unknown> };
};

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  per_page: number;
};
