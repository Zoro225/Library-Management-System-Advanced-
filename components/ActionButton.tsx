"use client";

import { useTransition, type ReactNode } from "react";
import { useToast } from "./Toast";
import { Spinner } from "./Spinner";

// A button that invokes a server action directly (rather than via a plain
// `<form action={...}>`), giving us a pending state and toast feedback on
// both success and failure without changing the action's own behavior.
export function ActionButton({
  action,
  children,
  pendingLabel,
  className = "",
  successMessage,
  disabled = false,
  confirmMessage,
  spinnerClassName = "h-3.5 w-3.5",
}: {
  action: () => Promise<void>;
  children: ReactNode;
  pendingLabel?: ReactNode;
  className?: string;
  successMessage?: string;
  disabled?: boolean;
  confirmMessage?: string;
  spinnerClassName?: string;
}) {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;

    startTransition(async () => {
      try {
        await action();
        if (successMessage) showToast(successMessage, "success");
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
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || pending}
      className={className}
    >
      {pending && <Spinner className={spinnerClassName} />}
      {pending ? pendingLabel ?? children : children}
    </button>
  );
}
