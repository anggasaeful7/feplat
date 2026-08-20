export type BankMerchant = {
  bank_code: string;
  bank_name: string;
  bank_swift_code: string;
  created_at: string;
  document_id: string;
  id: string;
  is_active: boolean;
  published_at: string;
  updated_at: string;
};

export type BankMerchantListResponse = {
  items: BankMerchant[];
};
