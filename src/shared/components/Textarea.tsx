import { forwardRef } from "react";
import { useFormField } from "./Form";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", rows = 4, id: customId, ...props }, ref) => {
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

    const cls = `focus-ring w-full rounded-sm border border-border bg-input-bg px-4 py-2.5 text-sm text-ink placeholder:text-muted transition-colors ${
      error ? "border-red-500/70 focus-visible:outline-red-400" : ""
    } ${className}`;

    return (
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : descriptionId}
        className={cls}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
