import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../auth/token";
import { createTask, listTasks, updateTask } from "../api/tasks";
import type { Task, Paginated } from "../api/tasks";

type CompletedFilter = "" | "true" | "false";

export default function TasksPage() {
  const navigate = useNavigate();

  const [newTitle, setNewTitle] = useState("");
  const [completed, setCompleted] = useState<CompletedFilter>("");
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("-created_at");

  const [data, setData] = useState<Paginated<Task>>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = useMemo(() => {
    const pageSize = 10;
    return Math.max(1, Math.ceil(data.count / pageSize));
  }, [data.count]);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const params: Record<string, any> = { page };

      if (completed !== "") params.completed = completed;
      if (search.trim()) params.search = search.trim();
      if (ordering) params.ordering = ordering;

      const res = await listTasks(params);
      setData(res);
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 401) {
        clearToken();
        navigate("/auth", { replace: true });
        return;
      }

      setError("Erro ao carregar tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, completed, ordering]);

  function onApplySearch() {
    setPage(1);
    load();
  }

  async function onCreate(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const title = newTitle.trim();
    if (!title) return;

    try {
      await createTask({ title });
      setNewTitle("");
      setPage(1);
      await load();
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 401) {
        clearToken();
        navigate("/auth", { replace: true });
        return;
      }

      setError("Erro ao criar task");
    }
  }

  async function onToggle(t: Task) {
    setError("");

    try {
      await updateTask(t.id, { completed: !t.completed });
      await load();
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 401) {
        clearToken();
        navigate("/auth", { replace: true });
        return;
      }

      setError("Erro ao atualizar task");
    }
  }

  function logout() {
    clearToken();
    navigate("/auth", { replace: true });
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Tasks</h2>
        <button onClick={logout}>Sair</button>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label>
          Status:&nbsp;
          <select
            value={completed}
            onChange={(e) => {
              setPage(1);
              setCompleted(e.target.value as CompletedFilter);
            }}
          >
            <option value="">Todas</option>
            <option value="false">Pendentes</option>
            <option value="true">Concluídas</option>
          </select>
        </label>

        <label>
          Ordenar por:&nbsp;
          <select
            value={ordering}
            onChange={(e) => {
              setPage(1);
              setOrdering(e.target.value);
            }}
          >
            <option value="-created_at">Mais recentes</option>
            <option value="created_at">Mais antigas</option>
            <option value="title">Título (A–Z)</option>
            <option value="-title">Título (Z–A)</option>
            <option value="completed">Concluídas primeiro</option>
            <option value="-completed">Pendentes primeiro</option>
            <option value="-updated_at">Última atualização</option>
          </select>
        </label>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onApplySearch();
          }}
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título/descrição"
          />
          <button type="submit" disabled={loading}>
            Buscar
          </button>
        </form>

        <div style={{ marginLeft: "auto" }}>
          <small>
            Total: {data.count} • Página {page} de {totalPages}
          </small>
        </div>
      </div>

      <form onSubmit={onCreate} style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          style={{ flex: 1 }}
          placeholder="Nova task"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          Adicionar
        </button>
      </form>

      {error && <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>}
      {loading && <div style={{ marginTop: 12 }}>Carregando...</div>}

      <ul style={{ listStyle: "none", padding: 0, marginTop: 16, display: "grid", gap: 10 }}>
        {data.results.map((t) => (
          <li key={t.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, textDecoration: t.completed ? "line-through" : "none" }}>
                  {t.title}
                </div>
                <small style={{ color: "#666" }}>id: {t.id}</small>
              </div>

              <button onClick={() => onToggle(t)}>
                {t.completed ? "Marcar como pendente" : "Marcar como concluída"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
        <button disabled={!data.previous || page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Anterior
        </button>
        <button disabled={!data.next} onClick={() => setPage((p) => p + 1)}>
          Próxima
        </button>
      </div>
    </div>
  );
}