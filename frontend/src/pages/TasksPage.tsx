import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../auth/token";

import { createTask, listTasks, updateTask } from "../api/tasks";
import type { Task, Paginated } from "../api/tasks";

import { createCategory, listCategories } from "../api/categories";
import type { Category } from "../api/categories";

import { shareTask, unshareTask } from "../api/sharing";
import type { ShareResult } from "../api/sharing";

type CompletedFilter = "" | "true" | "false";

function parseEmails(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function TasksPage() {
  const navigate = useNavigate();

  // Tasks filters
  const [completed, setCompleted] = useState<CompletedFilter>("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("-created_at");

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Create task
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");

  // Share modal
  const [shareOpen, setShareOpen] = useState(false);
  const [shareTaskItem, setShareTaskItem] = useState<Task | null>(null);
  const [shareEmailsRaw, setShareEmailsRaw] = useState("");
  const [shareMsg, setShareMsg] = useState("");

  // Data
  const [data, setData] = useState<Paginated<Task>>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = useMemo(() => {
    const pageSize = 10; // DRF PAGE_SIZE
    return Math.max(1, Math.ceil(data.count / pageSize));
  }, [data.count]);

  function handleAuthError(err: any): boolean {
    const status = err?.response?.status;
    if (status === 401) {
      clearToken();
      navigate("/auth", { replace: true });
      return true;
    }
    return false;
  }

  async function loadTasks() {
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
      if (handleAuthError(err)) return;
      setError("Erro ao carregar tasks");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const res = await listCategories();
      const items = Array.isArray(res) ? res : res.results;

      setCategories(items);

      if (items.length > 0 && selectedCategoryId === "") {
        setSelectedCategoryId(items[0].id);
      }
    } catch (err: any) {
      if (handleAuthError(err)) return;
    }
  }

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, completed, ordering]);

  function onApplySearch() {
    setPage(1);
    loadTasks();
  }

  async function onCreateCategory(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const name = newCategoryName.trim();
    if (!name) return;

    try {
      const created = await createCategory({ name });
      setNewCategoryName("");
      setCategories((prev) => [created, ...prev]);
      setSelectedCategoryId(created.id);
    } catch (err: any) {
      if (handleAuthError(err)) return;

      const data = err?.response?.data;
      if (data?.name?.[0]) setError(`Categoria: ${data.name[0]}`);
      else setError("Erro ao criar categoria");
    }
  }

  async function onCreateTask(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const title = newTitle.trim();
    if (!title) return;

    try {
      await createTask({
        title,
        description: newDescription.trim(),
        category: selectedCategoryId === "" ? null : selectedCategoryId,
      });

      setNewTitle("");
      setNewDescription("");
      setPage(1);
      await loadTasks();
    } catch (err: any) {
      if (handleAuthError(err)) return;
      setError("Erro ao criar task");
    }
  }

  async function onToggleCompleted(t: Task) {
    setError("");

    try {
      await updateTask(t.id, { completed: !t.completed });
      await loadTasks();
    } catch (err: any) {
      if (handleAuthError(err)) return;
      setError("Erro ao atualizar task");
    }
  }

  function openShareModal(t: Task) {
    setShareTaskItem(t);
    setShareEmailsRaw("");
    setShareMsg("");
    setShareOpen(true);
  }

  function closeShareModal() {
    setShareOpen(false);
    setShareTaskItem(null);
    setShareEmailsRaw("");
    setShareMsg("");
  }

  function formatShareResult(r: ShareResult) {
    if (typeof r.shared_added === "number") return `Compartilhados: +${r.shared_added}`;
    if (typeof r.shared_removed === "number") return `Removidos: -${r.shared_removed}`;
    return "OK";
  }

  async function onShare() {
    if (!shareTaskItem) return;
    setShareMsg("");

    const emails = parseEmails(shareEmailsRaw);
    if (emails.length === 0) {
      setShareMsg("Informe ao menos 1 email (separado por vírgula).");
      return;
    }

    try {
      const r = await shareTask(shareTaskItem.id, { emails });
      setShareMsg(formatShareResult(r));
      await loadTasks();
    } catch (err: any) {
      if (handleAuthError(err)) return;

      const status = err?.response?.status;
      if (status === 403) {
        setShareMsg("Você não pode compartilhar esta task (apenas o owner).");
        return;
      }
      if (status === 404) {
        setShareMsg("Task não encontrada (ou você não tem acesso).");
        return;
      }

      setShareMsg("Erro ao compartilhar.");
    }
  }

  async function onUnshare() {
    if (!shareTaskItem) return;
    setShareMsg("");

    const emails = parseEmails(shareEmailsRaw);
    if (emails.length === 0) {
      setShareMsg("Informe ao menos 1 email (separado por vírgula).");
      return;
    }

    try {
      const r = await unshareTask(shareTaskItem.id, { emails });
      setShareMsg(formatShareResult(r));
      await loadTasks();
    } catch (err: any) {
      if (handleAuthError(err)) return;

      const status = err?.response?.status;
      if (status === 403) {
        setShareMsg("Você não pode remover compartilhamento (apenas o owner).");
        return;
      }
      if (status === 404) {
        setShareMsg("Task não encontrada (ou você não tem acesso).");
        return;
      }

      setShareMsg("Erro ao remover compartilhamento.");
    }
  }

  function logout() {
    clearToken();
    navigate("/auth", { replace: true });
  }

  return (
    <div style={{ maxWidth: 1200, margin: "32px auto", fontFamily: "sans-serif", padding: 16 }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>To-Do</h2>
        <button onClick={logout}>Sair</button>
      </div>

      {error && <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>}

      {/* 2-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16, marginTop: 16 }}>
        {/* LEFT: Create */}
        <aside style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>Criar</h3>

          {/* Create category */}
          <div style={{ marginTop: 10 }}>
            <h4 style={{ margin: "0 0 8px 0" }}>Categoria</h4>
            <form onSubmit={onCreateCategory} style={{ display: "grid", gap: 8 }}>
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nome da categoria"
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" disabled={loading}>
                  Criar
                </button>
                <button type="button" onClick={loadCategories} disabled={loading}>
                  Atualizar lista
                </button>
              </div>
            </form>
          </div>

          <hr style={{ margin: "16px 0" }} />

          {/* Create task */}
          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>Task</h4>
            <form onSubmit={onCreateTask} style={{ display: "grid", gap: 8 }}>
              <input placeholder="Título" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />

              <textarea
                placeholder="Descrição (opcional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={4}
              />

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, color: "#444" }}>Categoria</span>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">Sem categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <button type="submit" disabled={loading}>
                Adicionar task
              </button>
            </form>
          </div>
        </aside>

        {/* RIGHT: Filters + List */}
        <main style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
          {/* Filters */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
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
                <option value="-completed">Concluídas primeiro</option>
                <option value="completed">Pendentes primeiro</option>
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
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar" />
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

          {loading && <div style={{ marginTop: 12 }}>Carregando...</div>}

          {/* List */}
          <ul style={{ listStyle: "none", padding: 0, marginTop: 14, display: "grid", gap: 10 }}>
            {data.results.map((t) => (
              <li key={t.id} style={{ border: "1px solid #e3e3e3", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, textDecoration: t.completed ? "line-through" : "none" }}>
                      {t.title}
                    </div>

                    <div style={{ marginTop: 4, color: "#444" }}>
                      <small>Categoria: {t.category_name ?? "Sem categoria"}</small>
                    </div>

                    {t.description?.trim() && (
                      <div style={{ marginTop: 8, color: "#333", whiteSpace: "pre-wrap" }}>{t.description}</div>
                    )}

                    
                  </div>

                  <div style={{ display: "grid", gap: 8 }}>
                    <button onClick={() => onToggleCompleted(t)}>{t.completed ? "Pendente" : "Concluir"}</button>
                    <button onClick={() => openShareModal(t)}>Compartilhar</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
            <button disabled={!data.previous || page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Anterior
            </button>
            <button disabled={!data.next} onClick={() => setPage((p) => p + 1)}>
              Próxima
            </button>
          </div>
        </main>
      </div>

      {/* Share Modal */}
      {shareOpen && shareTaskItem && (
        <div
          onClick={closeShareModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(520px, 100%)",
              background: "#fff",
              borderRadius: 12,
              padding: 14,
              border: "1px solid #ddd",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Compartilhar Task</h3>
              <button onClick={closeShareModal}>Fechar</button>
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 600 }}>{shareTaskItem.title}</div>
              <small style={{ color: "#666" }}>id: {shareTaskItem.id}</small>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, color: "#444" }}>E-mails (separados por vírgula)</span>
                <input
                  value={shareEmailsRaw}
                  onChange={(e) => setShareEmailsRaw(e.target.value)}
                  placeholder="ex: bob@b.com, carol@c.com"
                />
              </label>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={onShare}>Compartilhar</button>
                <button onClick={onUnshare}>Remover compartilhamento</button>
              </div>

              {shareMsg && <div style={{ marginTop: 6, color: "#333" }}>{shareMsg}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}