import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Edit2, Plus, Trash2 } from "lucide-react";
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
import { api, type ApiService } from "../../../shared/services";

const emptyService: Omit<ApiService, "id"> = {
  title: "",
  slug: "",
  description: "",
  deliverables: [],
  benefits: [],
  successStories: [],
  isPublished: false,
  sortOrder: 0
};

const serviceSchema = z.object({
  title: z.string().min(1, "Title is required."),
  slug: z.string().min(1, "Slug is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  sortOrder: z.number({ invalid_type_error: "Must be a number." }).int().nonnegative("Must be non-negative.")
});

export default function ServicesPanel() {
  const toast = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [form, setForm] = useState<Omit<ApiService, "id"> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "services", page, search],
    queryFn: () => api.services({ page, search: search || undefined })
  });

  const saveMut = useMutation({
    mutationFn: (d: Omit<ApiService, "id">) => (editId ? api.updateService(editId, d) : api.createService(d)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "services"] });
      setForm(null);
      setEditId(null);
      setErrors({});
      toast("success", editId ? "Service updated." : "Service created.");
    },
    onError: (e) => toast("error", e instanceof Error ? e.message : "Save failed.")
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.deleteService(id),
    onSuccess: () => {
      setDeleteId(null);
      void qc.invalidateQueries({ queryKey: ["admin", "services"] });
      toast("success", "Service deleted.");
    },
    onError: (e) => toast("error", e instanceof Error ? e.message : "Delete failed.")
  });

  const openEdit = (s: ApiService) => {
    setEditId(s.id);
    setErrors({});
    setForm({
      title: s.title,
      slug: s.slug,
      description: s.description,
      deliverables: s.deliverables || [],
      benefits: s.benefits || [],
      successStories: s.successStories || [],
      isPublished: s.isPublished,
      sortOrder: s.sortOrder
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form) return;
    setErrors({});

    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") || "");
    const slug = String(fd.get("slug") || "");
    const description = String(fd.get("description") || "");
    const sortOrder = Number(fd.get("sortOrder") ?? 0);
    const isPublished = fd.get("isPublished") === "on";

    const payload = {
      title,
      slug,
      description,
      sortOrder
    };

    // Client-side layered validation with Zod
    const result = serviceSchema.safeParse(payload);
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
      description,
      deliverables: (form.deliverables || []).map((x) => x.trim()).filter((x) => x.length > 0),
      benefits: (form.benefits || []).map((x) => x.trim()).filter((x) => x.length > 0),
      successStories: (form.successStories || []).map((x) => x.trim()).filter((x) => x.length > 0),
      sortOrder,
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
            setForm(emptyService);
          }}
          className="ml-auto gap-2"
        >
          <Plus size={16} aria-hidden="true" /> New Service
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
          icon={Briefcase}
          title="Failed to load services"
          message="An error occurred while fetching the service list. Please check your connection."
        >
          <Button onClick={() => void refetch()} variant="primary">
            Retry Connection
          </Button>
        </EmptyState>
      ) : !data?.data.length ? (
        <EmptyState icon={Briefcase} message="No services found matching search query." />
      ) : (
        <div className="space-y-2">
          {data.data.map((s) => (
            <div key={s.id} className="flex items-center justify-between border border-border bg-surface p-4">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{s.title}</p>
                <p className="mt-0.5 truncate text-sm text-muted">{s.description}</p>
              </div>
              <div className="flex items-center gap-2 pl-4">
                <span className={`text-xs ${s.isPublished ? "text-gold" : "text-muted"}`}>
                  {s.isPublished ? "Published" : "Draft"}
                </span>
                <button
                  type="button"
                  onClick={() => openEdit(s)}
                  className="focus-ring text-muted hover:text-ink p-1"
                  aria-label={`Edit ${s.title}`}
                >
                  <Edit2 size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(s.id)}
                  className="focus-ring text-muted hover:text-red-400 p-1"
                  aria-label={`Delete ${s.title}`}
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
        title={editId ? "Edit Service" : "New Service"}
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

            <FormField name="description" error={errors.description}>
              <FormLabel required>Description</FormLabel>
              <Textarea name="description" defaultValue={form.description} required />
              <FormMessage />
            </FormField>

            <DynamicListField
              label="Deliverables"
              values={form.deliverables}
              onChange={(next) => setForm({ ...form, deliverables: next })}
            />
            <DynamicListField
              label="Benefits"
              values={form.benefits}
              onChange={(next) => setForm({ ...form, benefits: next })}
            />
            <DynamicListField
              label="Success Stories"
              values={form.successStories}
              onChange={(next) => setForm({ ...form, successStories: next })}
            />

            <FormField name="sortOrder" error={errors.sortOrder}>
              <FormLabel>Sort Order</FormLabel>
              <Input name="sortOrder" type="number" defaultValue={String(form.sortOrder)} />
              <FormMessage />
            </FormField>

            <Checkbox name="isPublished" defaultChecked={form.isPublished} label="Published" />

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
        description="Delete this service permanently?"
        loading={deleteMut.isPending}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
