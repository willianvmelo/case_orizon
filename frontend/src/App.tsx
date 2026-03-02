import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import TasksPage from "./pages/TasksPage";
import { RequireAuth } from "./auth/RequireAuth";
import { RedirectIfAuthenticated } from "./auth/RedirectIfAuthenticated";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tasks" replace />} />
      <Route
        path="/auth"
        element={
          <RedirectIfAuthenticated>
            <AuthPage />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/tasks"
        element={
          <RequireAuth>
            <TasksPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/tasks" replace />} />
    </Routes>
  );
}