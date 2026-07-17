import { X } from "lucide-react";

type Props = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export default function Modal({ title, children, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="flex min-h-full items-start justify-center p-4 pt-20">
        <div className="premium-border w-full max-w-2xl bg-surface p-6 shadow-gold">
          <div className="flex items-center justify-between">
            <p className="font-display text-2xl font-semibold text-white">{title}</p>
            <button
              type="button"
              onClick={onClose}
              className="focus-ring text-muted hover:text-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export { Modal as FormModal };
