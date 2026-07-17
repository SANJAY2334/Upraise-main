import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useState } from "react";
import { Button, Pagination, Skeleton, EmptyState, useToast, Select } from "../../../shared/components";
import { api } from "../../../shared/services";

const LEAD_STATUSES = ["NEW", "CONTACTED", "DISCUSSION", "PROPOSAL_SENT", "CONVERTED", "CLOSED"];

export default function LeadsPanel() {
  const toast = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "leads", page, status],
    queryFn: () => api.leads({ page, status: status || undefined })
  });

  const mutation = useMutation({
    mutationFn: ({ id, status: s }: { id: string; status: string }) => api.updateLeadStatus(id, s),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "leads"] });
      toast("success", "Lead status updated.");
    },
    onError: (e) => toast("error", e instanceof Error ? e.message : "Update failed.")
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {["", ...LEAD_STATUSES].map((s) => (
          <Button
            key={s || "all"}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            variant={status === s ? "primary" : "secondary"}
            className="px-3 py-1.5 text-xs font-semibold"
          >
            {s || "All"}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Users}
          title="Failed to load leads"
          message="An error occurred while fetching the lead list. Please check your connection."
        >
          <Button onClick={() => void refetch()} variant="primary">
            Retry Connection
          </Button>
        </EmptyState>
      ) : !data?.data.length ? (
        <EmptyState icon={Users} message="No leads found matching query." />
      ) : (
        <div className="space-y-2">
          {data.data.map((lead) => (
            <div
              key={lead.id}
              className="flex flex-wrap items-center justify-between gap-3 border border-border bg-surface p-4"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{lead.name}</p>
                <p className="text-xs text-muted">{lead.email}</p>
              </div>
              <div className="max-w-[160px]">
                <Select
                  value={lead.status}
                  disabled={mutation.isPending}
                  onChange={(e) => mutation.mutate({ id: lead.id, status: e.target.value })}
                  options={LEAD_STATUSES}
                  className="py-1 px-2 text-xs"
                  aria-label={`Change status for ${lead.name}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {data && <Pagination page={page} total={data.total} limit={data.limit} onPage={setPage} />}
    </div>
  );
}
