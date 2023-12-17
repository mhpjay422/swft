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
  sectionRef: React.RefObject<HTMLDivElement>;
}

export const AddTaskButton: React.FC<AddTaskButtonProps> = ({
  AddTaskFormSchema,
  actionData,
  ownerId,
  sectionId,
  sectionRef,
}) => {
  const fetcher = useFetcher();
  const isSubmitting = useIsSubmitting();
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);
  const submitRef = useRef<ElementRef<"button">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const uniqueId = useId();

  const disableEditing = () => {
    setIsEditing(false);
  };

  const enableEditing = () => {
    setIsEditing(true);
    setTaskTitle("");
    setTimeout(() => {
      inputRef.current?.focus();
      scrollIntoView();
    });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      disableEditing();
    }
  };

  const scrollIntoView = () => {
    const current = sectionRef.current;
    console.log("current", current);
    console.log("sectionRef", sectionRef);

    if (current) {
      current.scrollTop = current.scrollHeight;
    }
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(event.target as Node)) {
      disableEditing();
      formRef.current.submit();
      setTaskTitle("");
    }
  };

  const [form, fields] = useForm({
    id: "add-task-form",
    constraint: getFieldsetConstraint(AddTaskFormSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: AddTaskFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  useEventListener("keydown", onKeyDown);
  useClickOutside(formRef, handleOutsideClick);

  return (
    <div>
      {isEditing ? (
        <fetcher.Form
          {...form.props}
          method="POST"
          ref={formRef}
          onSubmit={disableEditing}
          className="w-64 p-3 pb-8 rounded-md bg-white space-y-4 border border-gray-400"
        >
          <AuthenticityTokenInput />
          <input
            ref={inputRef}
            {...conform.input(fields.title)}
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="text-sm px-2 pt-1 h-7 font-medium border-transparent hover:border-input focus:border-input transition"
            placeholder="Enter task title..."
            onFocus={scrollIntoView}
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
          className="w-full rounded-md bg-white/80 hover:bg-gray-100 transition p-3 flex items-center font-medium text-sm"
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
