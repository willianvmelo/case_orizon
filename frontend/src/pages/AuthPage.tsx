import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http";
import { setToken } from "../auth/token";

type JwtResponse = {
  access: string;
  refresh: string;
};

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  re_password?: string;
};

async function loginAndStoreToken(username: string, password: string) {
  const res = await http.post<JwtResponse>("/api/auth/jwt/create/", { username, password });
  setToken(res.data.access);
}

export default function AuthPage() {
  const navigate = useNavigate();

  // Register
  const [rUsername, setRUsername] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPassword, setRPassword] = useState("");
  const [rPassword2, setRPassword2] = useState("");

  // Login
  const [lUsername, setLUsername] = useState("");
  const [lPassword, setLPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onRegister = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: RegisterPayload = {
        username: rUsername.trim(),
        email: rEmail.trim(),
        password: rPassword,
        re_password: rPassword2,
      };

      // Djoser: cria usuário
      await http.post("/api/auth/users/", payload);

      // auto-login
      await loginAndStoreToken(payload.username, payload.password);

      navigate("/tasks");
    } catch (err: any) {
      const data = err?.response?.data;

      // Djoser costuma devolver erros por campo em formato de lista
      if (data && typeof data === "object") {
        const firstField = Object.keys(data)[0];
        const msg = Array.isArray(data[firstField]) ? data[firstField][0] : String(data[firstField]);
        setError(`${firstField}: ${msg}`);
      } else {
        setError(err?.response?.data?.detail ?? "Falha ao cadastrar");
      }
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginAndStoreToken(lUsername.trim(), lPassword);
      navigate("/tasks");
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Falha no login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: "50px auto", fontFamily: "sans-serif", padding: 16 }}>
      <h2 style={{ marginBottom: 16 }}>To-Do — Acesso</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Register */}
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h3>Cadastro</h3>
          <form onSubmit={onRegister} style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <input value={rUsername} onChange={(e) => setRUsername(e.target.value)} placeholder="usuário" />
            <input value={rEmail} onChange={(e) => setREmail(e.target.value)} placeholder="email" />
            <input value={rPassword} onChange={(e) => setRPassword(e.target.value)} placeholder="senha" type="password" />
            <input value={rPassword2} onChange={(e) => setRPassword2(e.target.value)} placeholder="confirme a senha" type="password" />
            <button type="submit" disabled={loading}>
              {loading ? "Aguarde..." : "Criar conta e entrar"}
            </button>
          </form>
        </div>

        {/* Login */}
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h3>Login</h3>
          <form onSubmit={onLogin} style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <input value={lUsername} onChange={(e) => setLUsername(e.target.value)} placeholder="usuário" />
            <input value={lPassword} onChange={(e) => setLPassword(e.target.value)} placeholder="senha" type="password" />
            <button type="submit" disabled={loading}>
              {loading ? "Aguarde..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 14, color: "crimson" }}>
          {error}
        </div>
      )}
      
    </div>
  );
}