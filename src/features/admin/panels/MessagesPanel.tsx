import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  ConfirmDialog,
  Pagination,
  SearchBar,
  Skeleton,
  EmptyState,
  useToast,
  Badge,
  Button
} from "../../../shared/components";
import { api } from "../../../shared/services";

export default function MessagesPanel() {
  const toast = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "messages", page, search],
    queryFn: () => api.messages({ page, search: search || undefined })
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.deleteMessage(id),
    onSuccess: () => {
      setDeleteId(null);
      void qc.invalidateQueries({ queryKey: ["admin", "messages"] });
      toast("success", "Message deleted.");
    },
    onError: (e) => toast("error", e instanceof Error ? e.message : "Delete failed.")
  });

  return (
    <div className="space-y-4">
      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
      />
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Inbox}
          title="Failed to load messages"
          message="An error occurred while fetching the message list. Please check your connection."
        >
          <Button onClick={() => void refetch()} variant="primary">
            Retry Connection
          </Button>
        </EmptyState>
      ) : !data?.data.length ? (
        <EmptyState icon={Inbox} message="No messages found matching search query." />
      ) : (
        <div className="space-y-2">
          {data.data.map((msg) => (
            <div key={msg.id} className="border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    {msg.name} <span className="font-normal text-muted">({msg.email})</span>
                  </p>
                  <p className="mt-0.5 text-xs text-gold">{msg.interest}</p>
                  <p className="mt-2 text-xs leading-6 text-muted line-clamp-2">{msg.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  {msg.lead && (
                    <Badge variant={msg.lead.status === "CONVERTED" ? "green" : "gray"}>{msg.lead.status}</Badge>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteId(msg.id)}
                    className="focus-ring text-muted hover:text-red-400 p-1"
                    aria-label={`Delete message from ${msg.name}`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {data && <Pagination page={page} total={data.total} limit={data.limit} onPage={setPage} />}
      <ConfirmDialog
        open={!!deleteId}
        description="Delete this contact message permanently?"
        loading={deleteMut.isPending}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
