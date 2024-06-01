import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { Navigate } from "react-router-dom";

interface RoleBasedRouteProps {
  roles: string[];
  children: React.ReactNode;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ roles, children }) => {
  const { isAuthenticated, roles: userRoles } = useSelector(
    (state: RootState) => state.auth
  );

  const hasAccess = roles.some((role) => userRoles.includes(role));

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  if (!hasAccess) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
