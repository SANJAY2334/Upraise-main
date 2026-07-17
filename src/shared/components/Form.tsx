import { createContext, useContext, useId, type ReactNode } from "react";

type FormFieldContextValue = {
  id: string;
  name: string;
  error?: string | undefined;
  descriptionId: string;
  errorId: string;
};

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export function FormField({
  name,
  error,
  children
}: {
  name: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  return (
    <FormFieldContext.Provider value={{ id, name, error, descriptionId, errorId }}>
      <div className="grid gap-1.5">{children}</div>
    </FormFieldContext.Provider>
  );
}

export function useFormField() {
  const context = useContext(FormFieldContext);
  if (!context) {
    throw new Error("useFormField must be used within FormField");
  }
  return context;
}

export function FormLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  const { id } = useFormField();
  return (
    <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-muted select-none">
      {children}{" "}
      {required && (
        <span className="text-red-400" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

export function FormMessage() {
  const { error, errorId } = useFormField();
  if (!error) return null;
  return (
    <p id={errorId} className="text-xs font-medium text-red-400" role="alert">
      {error}
    </p>
  );
}

export function Form({ children, onSubmit, ...props }: React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form onSubmit={onSubmit} {...props}>
      {children}
    </form>
  );
}
