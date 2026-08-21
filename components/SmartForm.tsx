"use client";

import {
  createContext,
  useContext,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { useToast } from "./Toast";
import { Spinner } from "./Spinner";

type FormActionFn = (formData: FormData) => Promise<void>;

const FormPendingContext = createContext(false);

function useFormPending() {
  return useContext(FormPendingContext);
}

// Drop-in replacement for `<form action={serverAction}>` that keeps the
// exact same server action signature, but submits it from the client so we
// can show a pending state and a toast on success/failure.
export function SmartForm({
  action,
  children,
  className,
  successMessage = "Saved.",
  resetOnSuccess = false,
}: {
  action: FormActionFn;
  children: ReactNode;
  className?: string;
  successMessage?: string;
  resetOnSuccess?: boolean;
}) {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await action(formData);
        showToast(successMessage, "success");
        if (resetOnSuccess) form.reset();
      } catch (error) {
        showToast(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
          "error"
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <FormPendingContext.Provider value={pending}>
        {children}
      </FormPendingContext.Provider>
    </form>
  );
}

// A submit button that reads pending state from the nearest SmartForm.
export function SubmitButton({
  children,
  pendingLabel,
  className,
  spinnerClassName = "h-3.5 w-3.5",
}: {
  children: ReactNode;
  pendingLabel?: ReactNode;
  className?: string;
  spinnerClassName?: string;
}) {
  const pending = useFormPending();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <Spinner className={spinnerClassName} />}
      {pending ? pendingLabel ?? children : children}
    </button>
  );
}
