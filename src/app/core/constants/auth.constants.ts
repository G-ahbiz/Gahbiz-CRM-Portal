export const ALLOWED_ROLES = [
  'Admin',
  'Manager',
  'Supervisor',
  'Salesagent',
  'ServiceProvider',
  'OperationTeamLeader',
  'OperationAgent',
  'SalesAgentProvider',
] as const;

export type AllowedRole = (typeof ALLOWED_ROLES)[number];

export function isAllowedRole(role?: string | null): boolean {
  if (!role) return false;
  return ALLOWED_ROLES.includes(role as AllowedRole);
}

export function isAnyAllowedRole(userRoles?: string[] | string | null): boolean {
  if (!userRoles) return false;
  if (Array.isArray(userRoles)) {
    return userRoles.some((r) => isAllowedRole(r));
  }
  return isAllowedRole(userRoles);
}
