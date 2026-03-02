import { Navigate } from "react-router-dom";
import { getToken } from "./token";

type Props = { children: React.ReactNode };

export function RequireAuth({ children }: Props) {
  const token = getToken();
  if (!token) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}