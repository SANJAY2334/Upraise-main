import { Plus, Trash2 } from "lucide-react";
import { Input } from "./Input";

type Props = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
};

export default function DynamicListField({ label, values, onChange }: Props) {
  const handleAdd = () => {
    onChange([...values, ""]);
  };

  const handleItemChange = (index: number, val: string) => {
    const copy = [...values];
    copy[index] = val;
    onChange(copy);
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between border-b border-border pb-1">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</span>
        <button
          type="button"
          onClick={handleAdd}
          className="focus-ring inline-flex items-center gap-1 text-xs font-bold text-gold hover:text-gold-bright"
          aria-label={`Add item to ${label}`}
        >
          <Plus size={14} aria-hidden="true" /> Add Item
        </button>
      </div>
      <div className="grid gap-2">
        {values.map((val, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              type="text"
              value={val}
              onChange={(e) => handleItemChange(index, e.target.value)}
              placeholder={`Item #${index + 1}`}
              aria-label={`${label} item ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="focus-ring p-2 text-muted hover:text-red-400 transition"
              aria-label={`Remove item ${index + 1} from ${label}`}
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </div>
        ))}
        {values.length === 0 && <p className="text-xs text-muted/60 italic">No entries added yet.</p>}
      </div>
    </div>
  );
}
