import { DynamicErrorBoundary } from "#app/components/error-boundary.tsx";
import { type ElementRef, useRef, useState } from "react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import type { ZodObject, ZodString } from "zod";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { flushSync } from "react-dom";
import { type FetcherWithComponents } from "@remix-run/react";

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
  fetcher: FetcherWithComponents<unknown>;
  sectionEmpty: boolean;
  setTaskEditingId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const AddTaskButtonAndForm: React.FC<AddTaskButtonProps> = ({
  AddTaskFormSchema,
  actionData,
  ownerId,
  sectionId,
  sectionRef,
  fetcher,
  sectionEmpty,
  setTaskEditingId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

  const scrollIntoView = () => {
    const current = sectionRef.current;

    if (current) {
      current.scrollTop = current.scrollHeight;
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

  return (
    <div>
      {isEditing ? (
        <fetcher.Form
          {...form.props}
          method="POST"
          ref={formRef}
          onSubmit={() => {
            setIsEditing(false);
            setTaskEditingId(null);
          }}
          onBlur={() => {
            if (formRef.current?.value !== "") {
              fetcher.submit(formRef.current);
            }
            setIsEditing(false);
            setTaskEditingId(null);
            formRef.current?.reset();
            scrollIntoView();
          }}
          className="p-3 pb-8 rounded-md bg-white space-y-4 border border-gray-400"
        >
          <AuthenticityTokenInput />
          <input
            ref={inputRef}
            {...conform.input(fields.title)}
            className="text-sm px-2 pt-1 h-7 font-medium border-transparent hover:border-input focus:border-input transition"
            placeholder="Enter task title..."
            onFocus={scrollIntoView}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsEditing(false);
                setTaskEditingId(null);
              }
            }}
          />
          <input
            {...conform.input(fields.ownerId, { type: "hidden" })}
            value={ownerId}
          />
          <input
            {...conform.input(fields.sectionId, { type: "hidden" })}
            value={sectionId}
          />
        </fetcher.Form>
      ) : (
        <button
          onClick={() => {
            // This allows you to perform synchronous DOM actions immediately after the update is flushed to the DOM.
            flushSync(() => {
              setIsEditing(true);
              setTaskEditingId(sectionId);
            });
            inputRef.current?.select();
            scrollIntoView();
          }}
          className={`w-full rounded-md ${
            sectionEmpty ? "bg-gray-50" : "bg-white/80"
          } hover:bg-gray-100 transition p-3 flex items-center font-medium text-sm`}
        >
          <div className="mx-auto">+ Add a Task</div>
        </button>
      )}
    </div>
  );
};

export function ErrorBoundary() {
  return <DynamicErrorBoundary />;
}
