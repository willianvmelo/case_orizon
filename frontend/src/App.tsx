import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TasksPage from "./pages/TasksPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}