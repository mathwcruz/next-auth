interface User {
  permissions: string[];
  roles: string[];
}

interface ValidateUserPermissionsParams {
  user: User;
  permissions?: string[];
  roles?: string[];
}

export const validateUserPermissions = ({
  user,
  roles,
  permissions,
}: ValidateUserPermissionsParams) => {
  if (permissions?.length > 0) {
    const hasAllPermissions = permissions?.every((permission) => {
      return user.permissions?.includes(permission);
    });

    if (!hasAllPermissions) return false;
  }

  if (roles?.length > 0) {
    const hasAtLeastOneRole = roles?.some((role) => {
      return user?.roles?.includes(role);
    });

    if (!hasAtLeastOneRole) return false;
  }

  return true;
};
