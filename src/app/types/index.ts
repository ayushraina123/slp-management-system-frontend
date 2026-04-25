export type DonationType = 'ONLINE_UPI' | 'CASH' | 'CHEQUE' | 'OTHER_ONLINE_SERVICE';

export type ExpenseType =
  | 'CONSTRUCTION'
  | 'MAINTENANCE'
  | 'ELECTRICITY'
  | 'WATER'
  | 'FUNCTION'
  | 'DONATION_OUTFLOW'
  | 'PURCHASES'
  | 'SALARIES'
  | 'DECORATION'
  | 'SECURITY'
  | 'CLEANING'
  | 'RENOVATION'
  | 'MARKETING'
  | 'LEGAL_FEES'
  | 'PROPERTY_TAX'
  | 'MISCELLANEOUS';

export interface AddressDto {
  id?: number;
  houseNumber: string;
  city: string;
  state: string;
  country: string;
  pincode: number | '';
}

export interface DonationDto {
  id?: number;
  amount: number | '';
  donationType: DonationType;
  receiptNumber: string;
  createdOn?: string;
}

export interface DevoteeDto {
  id?: number;
  firstName: string;
  lastName: string;
  fatherName: string;
  address: AddressDto;
  donation: DonationDto[];
}

export interface DonationRecordDto {
  id?: number;
  devoteeId?: number;
  devoteeName?: string;
  amount: number | '';
  donationType: DonationType;
  receiptNumber: string;
  createdOn?: string;
}

export interface ExpenseDto {
  id?: number;
  name: string;
  amount: number | '';
  expenseType: ExpenseType;
  createdOn?: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface ApiProblem {
  title?: string;
  detail?: string;
  errors?: Record<string, string> | string[];
}

export interface DashboardBreakdownDto {
  key: string;
  value: number;
}

export interface DashboardMonthlyTrendDto {
  month: string;
  donations: number;
  expenses: number;
}

export interface DashboardSummaryDto {
  balance: number;
  devoteeCount: number;
  donationCount: number;
  expenseCount: number;
  totalDonations: number;
  totalExpenses: number;
  recentDonations: DonationRecordDto[];
  recentExpenses: ExpenseDto[];
  donationBreakdown: DashboardBreakdownDto[];
  expenseBreakdown: DashboardBreakdownDto[];
  monthlyTrend: DashboardMonthlyTrendDto[];
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
