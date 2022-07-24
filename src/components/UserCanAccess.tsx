import { ReactNode } from "react";

import { usePermission } from "../hooks/usePermission";

interface CanProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
}

export const UserCanAccess = ({ children, roles, permissions }: CanProps) => {
  const userCanAccessComponent = usePermission({
    permissions,
    roles,
  });

  if (!userCanAccessComponent) return null;

  return <>{children}</>;
};
