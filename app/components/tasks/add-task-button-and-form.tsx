import { DynamicErrorBoundary } from "#app/components/error-boundary.tsx";
import { type ElementRef, useRef, forwardRef } from "react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import type { ZodObject, ZodString } from "zod";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { flushSync } from "react-dom";
import { type FetcherWithComponents } from "@remix-run/react";

interface AddTaskButtonProps {
  ref: React.Ref<HTMLButtonElement>;
  AddTaskFormSchema: ZodObject<{
    title: ZodString;
    ownerId: ZodString;
    sectionId: ZodString;
  }>;
  // NOTE: Figure out how to Type this
  submissionData: any;
  sectionOwnerId: string;
  sectionId: string;
  sectionRef: React.RefObject<HTMLDivElement>;
  fetcher: FetcherWithComponents<unknown>;
  sectionEmptyAndIdle: boolean;
  isEditing: boolean;
  sectionHasOptimisticTaskCreation: boolean;
  setEditingSectionId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsTempBlurSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddTaskButtonAndForm = forwardRef<
  HTMLButtonElement,
  AddTaskButtonProps
>(
  (
    {
      AddTaskFormSchema,
      submissionData,
      sectionOwnerId,
      sectionId,
      sectionRef,
      fetcher,
      sectionEmptyAndIdle,
      isEditing,
      sectionHasOptimisticTaskCreation,
      setEditingSectionId,
      setIsTempBlurSubmitting,
    },
    ref
  ) => {
    const formRef = useRef<ElementRef<"form">>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollDownIntoView = () => {
      const current = sectionRef.current;

      if (current) {
        current.scrollTop = current.scrollHeight;
      }
    };

    const [form, fields] = useForm({
      id: "add-task-form",
      constraint: getFieldsetConstraint(AddTaskFormSchema),
      lastSubmission: submissionData,
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
              setEditingSectionId(null);
            }}
            onBlur={() => {
              let formData;
              if (formRef.current) {
                formData = new FormData(formRef.current);
              }
              flushSync(() => {
                // This is a hack to have the parent component UI update before closing the form
                setIsTempBlurSubmitting(true);
                setEditingSectionId(null);
              });
              if (formData && String(formData?.get("title"))) {
                fetcher.submit(formData, { method: "post" });
              }
              setIsTempBlurSubmitting(false);
              formRef.current?.reset();
              scrollDownIntoView();
            }}
            className="h-28 p-3 pb-8 rounded-lg bg-white space-y-4 border border-gray-400"
          >
            <AuthenticityTokenInput />
            <input
              ref={inputRef}
              {...conform.input(fields.title)}
              className="text-base px-2 pt-1 h-7 font-medium border-transparent hover:border-input focus:border-input transition"
              placeholder="Enter task title..."
              onFocus={scrollDownIntoView}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setEditingSectionId(null);
                }
              }}
            />
            <input
              {...conform.input(fields.ownerId, { type: "hidden" })}
              value={sectionOwnerId}
            />
            <input
              {...conform.input(fields.sectionId, { type: "hidden" })}
              value={sectionId}
            />
          </fetcher.Form>
        ) : !sectionHasOptimisticTaskCreation ? (
          <button
            ref={ref}
            onClick={() => {
              // flushSync allows you to perform synchronous DOM actions immediately after the update is flushed to the DOM.
              flushSync(() => {
                setEditingSectionId(sectionId);
              });
              inputRef.current?.select();
              scrollDownIntoView();
            }}
            className={`w-full rounded-md ${
              sectionEmptyAndIdle ? "bg-gray-50" : "bg-white"
            } hover:bg-gray-100 transition p-3 flex items-center font-medium text-sm`}
          >
            <div className="mx-auto">+ Add a Task</div>
          </button>
        ) : null}
      </div>
    );
  }
);

AddTaskButtonAndForm.displayName = "AddTaskButtonAndForm";

export function ErrorBoundary() {
  return <DynamicErrorBoundary />;
}
