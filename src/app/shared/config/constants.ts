import { CountryCodes } from '@shared/interfaces/country-codes';

export const ROUTES = {
  home: '/',
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  confirmEmail: '/auth/confirm-email',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  checkout: '/checkout',
  completeProfile: '/complete-profile',
  appointmentService: '/appointment-service',
  wishlist: '/wishlist',
  allServices: '/all-services',
  leadsDetails: '/main/sales/leads/leads-details',
  addLead: '/main/sales/leads/add-lead',
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
