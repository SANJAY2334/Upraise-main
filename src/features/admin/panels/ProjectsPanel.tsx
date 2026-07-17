import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Edit2, Layers, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import {
  Button,
  ConfirmDialog,
  Pagination,
  Dialog,
  Input,
  Textarea,
  Checkbox,
  DynamicListField,
  SearchBar,
  Skeleton,
  EmptyState,
  useToast,
  Form,
  FormField,
  FormLabel,
  FormMessage
} from "../../../shared/components";
import { api, type ApiProject } from "../../../shared/services";

const emptyProject: Omit<ApiProject, "id" | "createdAt"> = {
  title: "",
  slug: "",
  category: "",
  clientName: "",
  story: "",
  results: [],
  isFeatured: false,
  isPublished: false
};

const projectSchema = z.object({
  title: z.string().min(1, "Title is required."),
  slug: z.string().min(1, "Slug is required."),
  category: z.string().min(1, "Category is required."),
  clientName: z.string().min(1, "Client Name is required."),
  story: z.string().min(10, "Story must be at least 10 characters.")
});

export default function ProjectsPanel() {
  const toast = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [form, setForm] = useState<Omit<ApiProject, "id" | "createdAt"> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "projects", page, search],
    queryFn: () => api.projects({ page, search: search || undefined })
  });

  const saveMut = useMutation({
    mutationFn: (d: Omit<ApiProject, "id" | "createdAt">) =>
      editId ? api.updateProject(editId, d) : api.createProject(d),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      setForm(null);
      setEditId(null);
      setErrors({});
      toast("success", editId ? "Project updated." : "Project created.");
    },
    onError: (e) => toast("error", e instanceof Error ? e.message : "Save failed.")
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      setDeleteId(null);
      void qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      toast("success", "Project deleted.");
    },
    onError: (e) => toast("error", e instanceof Error ? e.message : "Delete failed.")
  });

  const openEdit = (p: ApiProject) => {
    setEditId(p.id);
    setErrors({});
    setForm({
      title: p.title,
      slug: p.slug,
      category: p.category,
      clientName: p.clientName,
      story: p.story,
      results: p.results || [],
      isFeatured: p.isFeatured,
      isPublished: p.isPublished
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form) return;
    setErrors({});

    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") || "");
    const slug = String(fd.get("slug") || "");
    const category = String(fd.get("category") || "");
    const clientName = String(fd.get("clientName") || "");
    const story = String(fd.get("story") || "");
    const isFeatured = fd.get("isFeatured") === "on";
    const isPublished = fd.get("isPublished") === "on";

    const payload = {
      title,
      slug,
      category,
      clientName,
      story
    };

    // Client-side layered validation with Zod
    const result = projectSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        if (issue.path[0]) {
          fieldErrors[String(issue.path[0])] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    saveMut.mutate({
      ...form,
      title,
      slug,
      category,
      clientName,
      story,
      results: (form.results || []).map((x) => x.trim()).filter((x) => x.length > 0),
      isFeatured,
      isPublished
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        <Button
          onClick={() => {
            setEditId(null);
            setErrors({});
            setForm(emptyProject);
          }}
          className="ml-auto gap-2"
        >
          <Plus size={16} aria-hidden="true" /> New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Layers}
          title="Failed to load projects"
          message="An error occurred while fetching the project list. Please check your connection."
        >
          <Button onClick={() => void refetch()} variant="primary">
            Retry Connection
          </Button>
        </EmptyState>
      ) : !data?.data.length ? (
        <EmptyState icon={Layers} message="No projects found matching search query." />
      ) : (
        <div className="space-y-2">
          {data.data.map((p) => (
            <div key={p.id} className="flex items-center justify-between border border-border bg-surface p-4">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{p.title}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {p.category} · {p.clientName}
                </p>
              </div>
              <div className="flex items-center gap-2 pl-4">
                {p.isFeatured && <CheckCircle size={14} className="text-gold" aria-label="Featured project" />}
                <span className={`text-xs ${p.isPublished ? "text-gold" : "text-muted"}`}>
                  {p.isPublished ? "Published" : "Draft"}
                </span>
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="focus-ring text-muted hover:text-ink p-1"
                  aria-label={`Edit ${p.title}`}
                >
                  <Edit2 size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(p.id)}
                  className="focus-ring text-muted hover:text-red-400 p-1"
                  aria-label={`Delete ${p.title}`}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {data && <Pagination page={page} total={data.total} limit={data.limit} onPage={setPage} />}

      {/* Form Dialog */}
      <Dialog
        open={form !== null}
        title={editId ? "Edit Project" : "New Project"}
        onClose={() => {
          setForm(null);
          setEditId(null);
          setErrors({});
        }}
      >
        {form !== null && (
          <Form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField name="title" error={errors.title}>
              <FormLabel required>Title</FormLabel>
              <Input name="title" defaultValue={form.title} required />
              <FormMessage />
            </FormField>

            <FormField name="slug" error={errors.slug}>
              <FormLabel required>Slug</FormLabel>
              <Input name="slug" defaultValue={form.slug} required />
              <FormMessage />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField name="category" error={errors.category}>
                <FormLabel required>Category</FormLabel>
                <Input name="category" defaultValue={form.category} required />
                <FormMessage />
              </FormField>

              <FormField name="clientName" error={errors.clientName}>
                <FormLabel required>Client Name</FormLabel>
                <Input name="clientName" defaultValue={form.clientName} required />
                <FormMessage />
              </FormField>
            </div>

            <FormField name="story" error={errors.story}>
              <FormLabel required>Story</FormLabel>
              <Textarea name="story" defaultValue={form.story} required />
              <FormMessage />
            </FormField>

            <DynamicListField
              label="Results"
              values={form.results}
              onChange={(next) => setForm({ ...form, results: next })}
            />

            <div className="flex gap-6">
              <Checkbox name="isFeatured" defaultChecked={form.isFeatured} label="Featured" />
              <Checkbox name="isPublished" defaultChecked={form.isPublished} label="Published" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={saveMut.isPending}>
                Save
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setForm(null);
                  setEditId(null);
                  setErrors({});
                }}
              >
                Cancel
              </Button>
            </div>
          </Form>
        )}
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        description="Delete this project permanently?"
        loading={deleteMut.isPending}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
