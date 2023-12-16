import { DynamicErrorBoundary } from "#app/components/error-boundary.tsx";
import { useFetcher } from "@remix-run/react";
import { type ElementRef, useRef, useState } from "react";
import { useClickOutside } from "#app/hooks/useClickOutside.ts";
import { useEventListener } from "#app/hooks/useEventListener.ts";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import type { ZodObject, ZodString } from "zod";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { ErrorList } from "#app/utils/forms.tsx";
import { useId } from "react";
import { useIsSubmitting } from "#app/hooks/useIsSubmitting.ts";

interface AddTaskButtonProps {
  AddTaskFormSchema: ZodObject<{
    title: ZodString;
    ownerId: ZodString;
    sectionId: ZodString;
  }>;
  // NOTE: Figure out how to Type this
  actionData: any;
  ownerId: string;
  sectionId: string;
}

export const AddTaskButton: React.FC<AddTaskButtonProps> = ({
  AddTaskFormSchema,
  actionData,
  ownerId,
  sectionId,
}) => {
  const fetcher = useFetcher();
  const isSubmitting = useIsSubmitting();
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);
  const submitRef = useRef<ElementRef<"button">>(null);
  const [isEditing, setIsEditing] = useState(false);

  const disableEditing = () => {
    setIsEditing(false);
  };

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      disableEditing();
    }
  };

  const uniqueId = useId();

  useEventListener("keydown", onKeyDown);
  useClickOutside(formRef, disableEditing);

  const [form, fields] = useForm({
    id: "add-task-form",
    constraint: getFieldsetConstraint(AddTaskFormSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: AddTaskFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <div>
      {isEditing ? (
        <fetcher.Form
          {...form.props}
          method="POST"
          ref={formRef}
          onSubmit={disableEditing}
          className="w-full p-3 rounded-md bg-white space-y-4 shadow-md"
        >
          <AuthenticityTokenInput />
          <input
            ref={inputRef}
            {...conform.input(fields.title)}
            className="text-sm px-2 py-1 h-7 font-medium border-transparent hover:border-input focus:border-input transition"
            placeholder="Enter list title..."
          />
          <ErrorList id={`error-${uniqueId}`} errors={fields.title.errors} />
          <input
            {...conform.input(fields.ownerId, { type: "hidden" })}
            value={ownerId}
          />
          <input
            {...conform.input(fields.sectionId, { type: "hidden" })}
            value={sectionId}
          />
          <div className="flex items-center gap-x-1">
            <button ref={submitRef} disabled={isSubmitting}>
              Save Task
            </button>
            <button type="button" onClick={disableEditing}>
              X
            </button>
          </div>
        </fetcher.Form>
      ) : (
        <button
          onClick={enableEditing}
          className="w-full rounded-md bg-white/80 hover:bg-white/50 transition p-3 flex items-center font-medium text-sm"
        >
          + Add a Task
        </button>
      )}
    </div>
  );
};

export function ErrorBoundary() {
  return <DynamicErrorBoundary />;
}
