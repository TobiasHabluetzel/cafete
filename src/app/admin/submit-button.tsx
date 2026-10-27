"use client";

import { useFormStatus } from "react-dom";

/**
 * A submit button that says something while the form is in flight.
 *
 * The admin's actions are server actions, so a click causes no navigation and
 * no spinner — the page simply sits there for as long as the round trip takes.
 * On a save that changes nothing visible, that is indistinguishable from a
 * dead button, which is exactly how this one was read.
 *
 * `useFormStatus` has to be read from inside the form, which is why this is a
 * child component rather than part of the form itself.
 */
export function SubmitButton({
  children,
  pendingLabel,
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`cursor-pointer disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

/**
 * The "Gespeichert" note, hidden again the moment another save starts — so a
 * second edit cannot show a stale confirmation from the first.
 */
export function SavedNote({ show }: { show: boolean }) {
  const { pending } = useFormStatus();
  if (!show || pending) return null;

  return (
    <span role="status" className="text-sm font-semibold text-emerald-700">
      Gespeichert
    </span>
  );
}
