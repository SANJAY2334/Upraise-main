import { forwardRef } from "react";
import { useFormField } from "./Form";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{ label: string; value: string } | string>;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", options, id: customId, ...props }, ref) => {
    let id = customId;
    let error: string | undefined;
    let errorId: string | undefined;
    let descriptionId: string | undefined;

    try {
      const formField = useFormField();
      id = formField.id;
      error = formField.error;
      errorId = formField.errorId;
      descriptionId = formField.descriptionId;
    } catch {
      // Outside FormField
    }

    const cls = `focus-ring w-full rounded-sm border border-border bg-input-bg px-4 py-3 text-sm text-ink transition-colors ${
      error ? "border-red-500/70 focus-visible:outline-red-400" : ""
    } ${className}`;

    return (
      <select
        id={id}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : descriptionId}
        className={cls}
        {...props}
      >
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const lbl = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={val} value={val} className="bg-surface text-ink">
              {lbl}
            </option>
          );
        })}
      </select>
    );
  }
);

Select.displayName = "Select";
export default Select;
