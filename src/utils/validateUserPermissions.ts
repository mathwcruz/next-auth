interface User {
  permissions: string[];
  roles: string[];
};

interface ValidateUserPermissionsParams {
  user: User;
  permissions?: string[];
  roles?: string[];
};

export const validateUserPermissions = ({ user, roles, permissions }: ValidateUserPermissionsParams) => {
  if (permissions?.length > 0) { // se há alguma permissão para o usuário
    const hasAllPermissions = permissions.every(permission => { // verificando se o usuário tem todas as permissões
      return user.permissions.includes(permission); // verifica se a permissão que foi passada ao hook está inclusa na permissao do usuário que está logado
    });

    if (!hasAllPermissions) { // caso não tenha todas as permissões, retorna
      return false;
    };
  };

  if (roles?.length > 0) { // se há alguma role para o usuário
    const hasAllRoles = roles.some(role => { // verificando se o usuário tem pelo menos uma das roles
      return user.roles.includes(role); // verifica se a role que foi passada ao hook está inclusa na role do usuário que está logado
    });

    if (!hasAllRoles) { // caso não tenha todas as roles, retorna
      return false;
    };
  };

  // caso passe por todas as verificações anteriores e nao caiu em nenhuma delas, o usuário tem permissao
  return true;
};