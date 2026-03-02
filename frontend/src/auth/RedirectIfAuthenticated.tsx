import { Navigate } from "react-router-dom";
import { getToken } from "./token";

type Props = {
  children: React.ReactNode;
};

export function RedirectIfAuthenticated({ children }: Props) {
  const token = getToken();

  if (token) {
    return <Navigate to="/tasks" replace />;
  }

  return <>{children}</>;
}