import { useAuth } from "../contexts/AuthContext";
import { validateUserPermissions } from "../utils/validateUserPermissions";

export const usePermission = ({ permissions, roles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return false;

  const userHasValidPermissions = validateUserPermissions({
    user,
    permissions,
    roles,
  });

  return userHasValidPermissions;
};
