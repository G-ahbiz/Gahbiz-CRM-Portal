import { CountryCodes } from '@shared/interfaces/country-codes';

export const ROUTES = {
  // Auth
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  confirmEmail: '/auth/confirm-email',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  // Main
  home: '/',
  // Sales
  leadsDetails: '/main/sales/leads/leads-details',
  addLead: '/main/sales/leads/add-lead',
  leadsTable: '/main/sales/leads/leads-main',
  // Customer
  customersTable: '/main/customers/customers-main',
  addCustomer: '/main/customers/add-customer',
  customerDetails: '/main/customers/customer-details',
  // Checkout
  checkout: '/checkout',
  completeProfile: '/complete-profile',
  appointmentService: '/appointment-service',
  wishlist: '/wishlist',
  allServices: '/all-services',

  // Invoices
  invoiceMain: '/main/invoices/invoice-main',
  getInvoiceDeatils: '/main/invoices/invoice-details',
  updateInvoice: '/main/invoices/update-invoice',
  addInvoice: '/main/invoices/add-invoice',

  unauthorized: '/unauthorized',
  //Operations
  getOperationFiles: (id: string) => `main/operations/operation-files/${id}`,
  operations: '/main/operations',
  // Reports
  reports: '/main/reports',
  salesReports: '/main/reports/sales',
  leadsReports: '/main/reports/leads',

  dashboard: 'https://serva-best-dashboard.netlify.app',
};

export const USER_TYPES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  SUPERVISOR: 'Supervisor',
  SALES_AGENT: 'Salesagent',
  CLIENT: 'Client',
  SERVICE_PROVIDER: 'ServiceProvider',

  OPERATION_TEAM_LEADER: 'OperationTeamLeader',
  OPERATION_AGENT: 'OperationAgent',

  SALES_AGENT_PROVIDER: 'SalesAgentProvider',
  USER: 'User',
  CUSTOMER: 'Customer',
};

// Role groups for easier management
export const ALL_CRM_ROLES = [
  USER_TYPES.ADMIN,
  USER_TYPES.MANAGER,
  USER_TYPES.SALES_AGENT,
  USER_TYPES.OPERATION_TEAM_LEADER,
  USER_TYPES.OPERATION_AGENT,
  USER_TYPES.SALES_AGENT_PROVIDER,
];

export const SALES_ROLES = [USER_TYPES.ADMIN, USER_TYPES.MANAGER, USER_TYPES.SALES_AGENT];
export const CRM_HIGH_LEVEL_ROLES = [USER_TYPES.ADMIN, USER_TYPES.MANAGER];

export const OPERATIONS_ROLES = [
  USER_TYPES.ADMIN,
  USER_TYPES.OPERATION_TEAM_LEADER,
  USER_TYPES.OPERATION_AGENT,
];

export const COUNTRIES: CountryCodes[] = [
  { name: 'United States', dialCode: '+1', iso2: 'us' },
  { name: 'Egypt', dialCode: '+20', iso2: 'eg' },
  { name: 'Spain', dialCode: '+34', iso2: 'es' },
  { name: 'United Kingdom', dialCode: '+44', iso2: 'gb' },
  { name: 'Saudi Arabia', dialCode: '+966', iso2: 'sa' },
  { name: 'UAE', dialCode: '+971', iso2: 'ae' },
  { name: 'Canada', dialCode: '+1', iso2: 'ca' },
  { name: 'India', dialCode: '+91', iso2: 'in' },
  { name: 'Germany', dialCode: '+49', iso2: 'de' },
  { name: 'France', dialCode: '+33', iso2: 'fr' },
  { name: 'Brazil', dialCode: '+55', iso2: 'br' },
  { name: 'Japan', dialCode: '+81', iso2: 'jp' },
  { name: 'China', dialCode: '+86', iso2: 'cn' },
  { name: 'South Africa', dialCode: '+27', iso2: 'za' },
];

export const LANGUAGES = {
  ENGLISH: 'English',
  ARABIC: 'Arabic',
  SPANISH: 'Spanish',
};

export const GENDERS = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
  PREFER_NOT_TO_SAY: 'PreferNotToSay',
};

export const SIGNUP_CONSTANTS = {
  NAME_MIN: 3,
  NAME_MAX: 50,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 64,
};

export const OTP_CONSTANTS = {
  MIN: 6,
  MAX: 6,
  COOLDOWN: 60,
};

export const OTP_OPERATIONS = {
  CONFIRM_EMAIL: 'confirm-email',
  FORGOT_PASSWORD: 'forgot-password',
  CHANGE_EMAIL: 'change-email',
};

export const SIGNUP_STORAGE_KEYS = {
  KEY_USER_ID: 'signup:userId',
  KEY_EMAIL: 'signup:email',
  KEY_TOKEN: 'signup:token',
  KEY_TOKEN_EXPIRES: 'signup:token_expires',
};

export const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_DATA_KEY: 'user_data',
  APPOINTMENT_METADATA_KEY: 'appointment-metadata',
};

export const REG_EXP = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
  OTP: /^\d{6}$/,
  NAME_PATTERN: /^[a-zA-Z\s\-']+$/,
  SSN_PATTERN: /^\d{3}-?\d{2}-?\d{4}$/,
  ZIP_CODE_PATTERN: /^\d{5}(-\d{4})?$/,
};

export const CART_ITEMS = {
  APPOINTMENT_SERVICE: '9defe476-1fdb-4050-a15b-a1e04985d854',
};

export const ACTIVITY_TYPES = [
  { value: 'None', label: 'Select Type' },
  { value: 'PhoneCall', label: 'Phone Call' },
  { value: 'OnlineChat', label: 'Online Chat' },
  { value: 'Email', label: 'Email' },
  { value: 'Other', label: 'Other' },
];

export const TRAFFIC_TYPES = [
  { value: 'None', label: 'Select Traffic' },
  { value: 'Outgoing', label: 'Outgoing' },
  { value: 'Incoming', label: 'Incoming' },
];

export const STATUS_TYPES = [
  { value: 'None', label: 'Select Status' },
  { value: 'Positive', label: 'Positive' },
  { value: 'Negative', label: 'Negative' },
  { value: 'WrongData', label: 'Wrong Data' },
];

export const CALL_STATUS_TYPES = [
  { value: 'None', label: 'Select Call Status' },
  { value: 'Response', label: 'Response' },
  { value: 'NoResponse', label: 'No Response' },
];

export const SOURCE_TYPES = [
  { value: 'None', label: 'LEADS.SOURCE_TYPES.SELECT_SOURCE' },
  { value: 'FacebookAds', label: 'LEADS.SOURCE_TYPES.FACEBOOK_ADS' },
  { value: 'GoogleAds', label: 'LEADS.SOURCE_TYPES.GOOGLE_ADS' },
  { value: 'Referral', label: 'LEADS.SOURCE_TYPES.REFERRAL' },
  { value: 'WebsiteForm', label: 'LEADS.SOURCE_TYPES.WEBSITE_FORM' },
  { value: 'TradeShow', label: 'LEADS.SOURCE_TYPES.TRADE_SHOW' },
  { value: 'Manual', label: 'LEADS.SOURCE_TYPES.MANUAL' },
  { value: 'Provider', label: 'LEADS.SOURCE_TYPES.PROVIDER' },
];

export const ORDER_STATUS_OPTION = [
  { value: 'Created', label: 'ORDERS.order-details.created' },
  { value: 'Paid', label: 'ORDERS.order-details.paid' },
  { value: 'Pending', label: 'ORDERS.order-details.pending' },
  { value: 'Processing', label: 'ORDERS.order-details.processing' },
  { value: 'Completed', label: 'ORDERS.order-details.completed' },
  { value: 'Cancelled', label: 'ORDERS.order-details.cancelled' },
  { value: 'Refunded', label: 'ORDERS.order-details.refunded' },
];

export const INVOICES_STATUS_OPTION = [
  { label: 'INVOICES.status-option.all', value: '' },
  { label: 'INVOICES.status-option.paid', value: 'Paid' },
  { label: 'INVOICES.status-option.unpaid', value: 'Unpaid' },
  { label: 'INVOICES.status-option.partiallyPaid', value: 'PartiallyPaid' },
];

export const INVOICES_PERIOD_OPTION = [
  { label: 'INVOICES.period.AllTime', value: 'AllTime' },
  { label: 'INVOICES.period.ThisMonth', value: 'ThisMonth' },
  { label: 'INVOICES.period.LastMonth', value: 'LastMonth' },
  { label: 'INVOICES.period.ThisYear', value: 'ThisYear' },
  { label: 'INVOICES.period.LastYear', value: 'LastYear' },
  { label: 'INVOICES.period.Last3Months', value: 'Last3Months' },
  { label: 'INVOICES.period.Last6Months', value: 'Last6Months' },
  { label: 'INVOICES.period.Last12Months', value: 'Last12Months' },
];

export enum ClientServiceStatus {
  Created = 'Created',
  Submitted = 'Submitted',
  UnderReview = 'UnderReview',
  PendingClientAction = 'PendingClientAction',
  InProgress = 'InProgress',
  AwaitingExternalResponse = 'AwaitingExternalResponse',
  Verified = 'Verified',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Rejected = 'Rejected',
}
