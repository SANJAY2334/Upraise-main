import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, Trash2, UploadCloud } from "lucide-react";
import { useState, useRef } from "react";
import { Button, ConfirmDialog, Pagination, Skeleton, useToast, EmptyState } from "../../../shared/components";
import { api } from "../../../shared/services";

export default function MediaPanel() {
  const toast = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "media", page],
    queryFn: () => api.media({ page })
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => api.uploadMedia(file, file.name),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast("success", "Asset uploaded.");
    },
    onError: (e) => toast("error", e instanceof Error ? e.message : "Upload failed.")
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.deleteMedia(id),
    onSuccess: () => {
      setDeleteId(null);
      void qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast("success", "Asset deleted.");
    },
    onError: (e) => toast("error", e instanceof Error ? e.message : "Delete failed.")
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMut.mutate(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => fileRef.current?.click()} loading={uploadMut.isPending} className="gap-2">
          <UploadCloud size={16} aria-hidden="true" /> Upload Asset
        </Button>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={UploadCloud}
          title="Failed to load media assets"
          message="An error occurred while fetching the media files. Please check your connection."
        >
          <Button onClick={() => void refetch()} variant="primary">
            Retry Connection
          </Button>
        </EmptyState>
      ) : !data?.data.length ? (
        <EmptyState
          icon={UploadCloud}
          title="No media assets yet"
          message="Upload images or videos to display. Requires Cloudinary environment variables configuration."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.data.map((asset) => (
            <div key={asset.id} className="group relative border border-border bg-surface overflow-hidden">
              {asset.resourceType === "image" ? (
                <img src={asset.url} alt={asset.alt ?? "media"} className="aspect-square w-full object-cover" />
              ) : (
                <div className="grid aspect-square place-items-center bg-black/40">
                  <ImageIcon size={28} className="text-muted" aria-hidden="true" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                <Button
                  onClick={() => setDeleteId(asset.id)}
                  className="bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500 border-none"
                  aria-label={`Delete media asset ${asset.alt || asset.publicId}`}
                >
                  <Trash2 size={13} aria-hidden="true" />
                </Button>
              </div>
              <div className="p-2">
                <p className="truncate text-xs text-muted">{asset.alt ?? asset.publicId}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {data && <Pagination page={page} total={data.total} limit={data.limit} onPage={setPage} />}

      <ConfirmDialog
        open={!!deleteId}
        description="Delete this media asset permanently?"
        loading={deleteMut.isPending}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
