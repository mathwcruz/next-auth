import { useAuth } from "../contexts/AuthContext";
import { validateUserPermissions } from "../utils/validateUserPermissions";

interface UseCanParams {
  permissions?: string[];
  roles?: string[];
};

export const useCan = ({ permissions, roles }: UseCanParams) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) { // caso ele nao esteja autenticado, retorna pois ele nao tem permissão
    return false;
  };

  const userHasValidPermissions = validateUserPermissions({ // validando as permissões e roles do user
    user,
    permissions,
    roles,
  });

  return userHasValidPermissions; // retornando se o usuário tem roles e permissões válidas
};