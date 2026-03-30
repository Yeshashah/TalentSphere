// Backend role authorization utility
export function checkRole(userRole, requiredRoles) {
  const allowed = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return allowed.includes(userRole);
}

export function requireRole(userRole, requiredRoles) {
  if (!checkRole(userRole, requiredRoles)) {
    throw new Error('403 Forbidden - Insufficient permissions');
  }
}