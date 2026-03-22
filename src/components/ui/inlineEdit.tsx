"use client";

import { useState, useTransition } from "react";
import { updateProfileField } from "@/app/_actions/authActions";
import { useRouter } from "next/navigation";

type InlineEditProps = {
  field: string;
  value: string;
  placeholder?: string;
  type?: "text" | "email";
  inputMode?: "text" | "numeric" | "email";
};

export function InlineEdit({
  field,
  value,
  placeholder = "Click to edit",
  type = "text",
  inputMode = "text",
}: InlineEditProps) {
  const router = useRouter();
  const [localValue, setLocalValue] = useState(value);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function saveValue(nextValue: string) {
    setEditing(false);
    setError(null);
    setMessage(null);

    if (nextValue === value) return;

    const previous = value;

    startTransition(async () => {
      try {
        const result = await updateProfileField(field, nextValue);
        if (result?.message) {
          setMessage(result.message);
        }
        router.refresh();
      } catch {
        setLocalValue(previous);
        setError("Could not save changes");
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      {editing ? (
        <input
          autoFocus
          type={type}
          inputMode={inputMode}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => saveValue(localValue)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setLocalValue(value);
              setEditing(false);
              setError(null);
              setMessage(null);
            }
          }}
          className="w-full min-w-[220px] rounded-md border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-900 outline-none ring-0 transition placeholder:text-stone-400 focus:border-rose-400 sm:min-w-[280px]"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            if (isPending) return;
            setLocalValue(value);
            setEditing(true);
          }}
          className={`rounded-md border border-transparent px-3 py-1.5 text-sm text-left text-rose-900 transition hover:border-rose-100 hover:bg-rose-50 ${
            isPending ? "opacity-50" : ""
          }`}
        >
          {(isPending ? localValue : value) || (
            <span className="text-stone-400">{placeholder}</span>
          )}
        </button>
      )}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {message ? <p className="text-xs text-rose-600">{message}</p> : null}
      {isPending ? <p className="text-xs text-rose-500">Saving...</p> : null}
    </div>
  );
}
