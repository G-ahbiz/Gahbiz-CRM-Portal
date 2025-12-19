import { USER_TYPES } from '@shared/config/constants';

/**
 * Role-based permission constants
 * Based on the Authorization & Access Control Document
 */

// Customer Module Permissions
export const CUSTOMER_DELETE_ROLES = [USER_TYPES.ADMIN, USER_TYPES.MANAGER];
export const CUSTOMER_VIEW_ROLES = [USER_TYPES.ADMIN, USER_TYPES.MANAGER, USER_TYPES.SALES_AGENT];

// Leads Module Permissions
export const LEAD_DELETE_ROLES = [USER_TYPES.ADMIN, USER_TYPES.MANAGER];
export const LEAD_IMPORT_ROLES = [
  USER_TYPES.ADMIN,
  USER_TYPES.MANAGER,
  USER_TYPES.SALES_AGENT_PROVIDER,
];
export const LEAD_VIEW_ROLES = [USER_TYPES.ADMIN, USER_TYPES.MANAGER, USER_TYPES.SALES_AGENT];
export const LEAD_ADD_ROLES = [USER_TYPES.ADMIN, USER_TYPES.MANAGER, USER_TYPES.SALES_AGENT];

// Sales Agent Management Permissions
export const ASSIGN_TASK_ROLES = [USER_TYPES.ADMIN, USER_TYPES.MANAGER];
export const ADD_SALES_AGENT_ROLES = [USER_TYPES.ADMIN, USER_TYPES.MANAGER];
export const VIEW_SALES_AGENTS_ROLES = [USER_TYPES.ADMIN, USER_TYPES.MANAGER, USER_TYPES.SALES_AGENT];

// Invoice Module Permissions
export const INVOICE_DELETE_ROLES = [USER_TYPES.ADMIN, USER_TYPES.MANAGER];
export const INVOICE_VIEW_ROLES = [USER_TYPES.ADMIN, USER_TYPES.MANAGER, USER_TYPES.SALES_AGENT];

// Operations Module Permissions
export const OPERATIONS_VIEW_ROLES = [
  USER_TYPES.ADMIN,
  USER_TYPES.OPERATION_TEAM_LEADER,
  USER_TYPES.OPERATION_AGENT,
];
export const OPERATIONS_UPDATE_STATUS_ROLES = [
  USER_TYPES.ADMIN,
  USER_TYPES.OPERATION_TEAM_LEADER,
  USER_TYPES.OPERATION_AGENT,
];

// Orders Module Permissions
export const ORDERS_VIEW_ROLES = [USER_TYPES.ADMIN, USER_TYPES.MANAGER, USER_TYPES.SALES_AGENT];

// Reports Module Permissions
export const REPORTS_VIEW_ROLES = [USER_TYPES.ADMIN];

// Team Statistics Permissions
export const TEAM_STATISTICS_ROLES = [USER_TYPES.ADMIN, USER_TYPES.MANAGER];

/**
 * Helper function to check if a user role is included in allowed roles
 */
export function hasPermission(userRole: string | undefined | null, allowedRoles: string[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

