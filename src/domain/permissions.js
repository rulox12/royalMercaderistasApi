const ALL_PERMISSIONS = [
  'dashboard.local',
  'dashboard.categories',
  'orders.view',
  'reports.view',
  'real-sales.manage',
  'users.manage',
  'roles.manage',
  'settings.catalogs',
  'processes.run',
];

const normalizeRoleName = (name = '') => String(name)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

const isAdminRoleName = (name) => ['admin', 'administrador'].includes(normalizeRoleName(name));

const resolveRolePermissions = (role) => {
  if (isAdminRoleName(role?.name)) {
    return ALL_PERMISSIONS;
  }

  return Array.isArray(role?.permissions) ? role.permissions : [];
};

module.exports = {
  ALL_PERMISSIONS,
  isAdminRoleName,
  resolveRolePermissions,
};