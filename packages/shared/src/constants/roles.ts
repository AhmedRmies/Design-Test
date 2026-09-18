export const ROLES = ['CUSTOMER', 'SELLER', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

/** Simple capability map used by the API RolesGuard and the web UI. */
export const PERMISSIONS: Record<Role, string[]> = {
  CUSTOMER: ['design:create', 'design:read:own', 'order:create', 'order:read:own'],
  SELLER: [
    'design:create',
    'design:read:own',
    'product:publish',
    'product:read:own',
    'payout:read:own',
    'order:read:own',
  ],
  ADMIN: ['*'],
};

export function can(role: Role, permission: string): boolean {
  const list = PERMISSIONS[role] ?? [];
  return list.includes('*') || list.includes(permission);
}
