import { forwardRef } from "react";
import { useFormField } from "./Form";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: React.ReactNode;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", label, id: customId, ...props }, ref) => {
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

    return (
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : descriptionId}
          className={`focus-ring mt-1 h-4 w-4 rounded-sm border-border bg-input-bg text-gold transition-colors focus:ring-0 focus:ring-offset-0 cursor-pointer ${className}`}
          {...props}
        />
        {label && (
          <label htmlFor={id} className="text-sm leading-6 text-muted cursor-pointer select-none">
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
