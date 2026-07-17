import { forwardRef } from "react";
import { useFormField } from "./Form";

type FieldProps = {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  multiline?: boolean;
  type?: string;
};

// Legacy Field component for backward compatibility
export default function Field({ label, name, defaultValue, required, multiline, type = "text" }: FieldProps) {
  const cls =
    "focus-ring mt-1 w-full rounded-sm border border-border bg-input-bg px-4 py-2.5 text-sm text-ink placeholder:text-muted";
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</span>
      {multiline ? (
        <textarea name={name} defaultValue={defaultValue} required={required} rows={4} className={cls} />
      ) : (
        <input type={type} name={name} defaultValue={defaultValue} required={required} className={cls} />
      )}
    </label>
  );
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

// Standard accessible Input component
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type = "text", leftIcon, rightIcon, id: customId, ...props }, ref) => {
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
      // Fallback outside FormField
    }

    const cls = `focus-ring w-full rounded-sm border border-border bg-input-bg py-2.5 text-sm text-ink placeholder:text-muted transition-colors ${
      leftIcon ? "pl-10" : "pl-4"
    } ${rightIcon ? "pr-10" : "pr-4"} ${error ? "border-red-500/70 focus-visible:outline-red-400" : ""} ${className}`;

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          type={type}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : descriptionId}
          className={cls}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Field as LegacyInput };
