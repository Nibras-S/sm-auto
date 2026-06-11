// Customer self-service (My Account) transport shapes.

export interface CustomerAddressDTO {
  id?: string;
  label?: string;
  contactName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  area?: string;
  city?: string;
  emirate?: string;
  country?: string;
  isDefault?: boolean;
}

export interface CustomerVehicleDTO {
  id?: string;
  label?: string;
  brand: string;
  model?: string;
  generation?: string;
  year?: number;
  engineType?: string;
  vin?: string;
}

export interface CustomerProfileDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  emailVerified: boolean;
  marketingOptIn?: boolean;
}
