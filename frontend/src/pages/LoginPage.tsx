import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http";
import { setToken } from "../auth/token";

type JwtResponse = {
  access: string;
  refresh: string;
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res = await http.post<JwtResponse>("/api/auth/jwt/create/", {
        username,
        password,
      });

      setToken(res.data.access);
      navigate("/tasks");
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Falha no login");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", fontFamily: "sans-serif" }}>
      <h2>Login</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
        />

        <button type="submit">Entrar</button>

        {error && <div style={{ color: "crimson" }}>{error}</div>}
      </form>
    </div>
  );
}