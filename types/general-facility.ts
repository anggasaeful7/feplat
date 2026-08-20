export type GeneralFacility = {
  id: string;
  name: string;
  is_active: boolean;
  is_auto_suspend: boolean;
  created_at: string;
  updated_at: string;
};

export type GeneralFacilityListResponse = {
  items: GeneralFacility[];
  total: number;
  limit: number;
  offset: number;
};

export type GeneralFacilityWritePayload = {
  name: string;
  is_active: boolean;
  is_auto_suspend: boolean;
};

export const DEFAULT_GENERAL_FACILITIES_PAGE_SIZE = 10;
