import { ReactNode } from "react";
import { useCan } from "../hooks/useCan";

interface CanProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
};

// componente criado para validar permissões e roles do usuário
export const Can = ({ children, roles, permissions }: CanProps) => {
  const userCanSeeComponent = useCan({
    permissions, 
    roles,
  });

  if (!userCanSeeComponent) { // caso o usuário não tenha as devidas permissões ou roles, retorna, ele não pode ter acesso ao componente
    return null;
  };

  return (
    <>
      { children }
    </>
  );
};