import { useFetcher } from "@remix-run/react";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { type ElementRef, useRef, useState } from "react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { z } from "zod";
import { flushSync } from "react-dom";

export const EditTaskTitleFormSchema = z.object({
  taskId: z.string(),
  ownerId: z.string().min(5),
  title: z.string(),
});

interface TaskProps {
  actionData: any;
  taskModalDataId: string;
  taskModalDataOwnerId: string;
  taskModalDataTitle: string | null | undefined;
  invokeSetTaskModalData: (data: { title: string | undefined } | null) => void;
}

export const EditTaskTitleInput: React.FC<TaskProps> = ({
  actionData,
  taskModalDataId,
  taskModalDataOwnerId,
  taskModalDataTitle,
  invokeSetTaskModalData,
}) => {
  const [editingTaskTitleId, setEditingTaskTitleId] = useState<string | null>(
    null
  );
  const editTaskTitleFormRef = useRef<ElementRef<"form">>(null);
  const editTaskTitleInputRef = useRef<ElementRef<"input">>(null);
  const editTaskTitleFetcher = useFetcher({
    key: "edit-task-title",
  });

  const [editTaskTitleForm, editTaskTitleFields] = useForm({
    id: "edit-task-title-form",
    constraint: getFieldsetConstraint(EditTaskTitleFormSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: EditTaskTitleFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return editingTaskTitleId ? (
    <editTaskTitleFetcher.Form
      {...editTaskTitleForm.props}
      method="PUT"
      action="/task-edit-title"
      ref={editTaskTitleFormRef}
      onSubmit={() => {
        setEditingTaskTitleId(null);
        invokeSetTaskModalData({
          title: editTaskTitleInputRef.current?.value,
        });
      }}
      onBlur={() => {
        editTaskTitleFetcher.submit(editTaskTitleFormRef.current);
        invokeSetTaskModalData({
          title: editTaskTitleInputRef.current?.value,
        });
        setEditingTaskTitleId(null);
        editTaskTitleFormRef.current?.reset();
      }}
      className="h-full w-full mr-2"
    >
      <AuthenticityTokenInput />
      {/* Hidden submit button to submit form onEnter keypress */}
      <button type="submit" className="hidden" />
      <input
        ref={editTaskTitleInputRef}
        {...conform.input(editTaskTitleFields.title)}
        className="w-full h-full text-base p-4 border-transparent hover:border-input focus:border-input transition bg-gray-100 rounded-lg"
        placeholder={taskModalDataTitle ? undefined : "Write a task title"}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setEditingTaskTitleId(null);
          }
        }}
        defaultValue={taskModalDataTitle || ""}
      />
      <input
        {...conform.input(editTaskTitleFields.ownerId, {
          type: "hidden",
        })}
        value={taskModalDataOwnerId}
      />
      <input
        {...conform.input(editTaskTitleFields.taskId, {
          type: "hidden",
        })}
        value={taskModalDataId}
      />
    </editTaskTitleFetcher.Form>
  ) : (
    <div
      className="h-full w-full text-base"
      onClick={() => {
        flushSync(() => {
          setEditingTaskTitleId(taskModalDataId);
        });
        editTaskTitleInputRef.current?.select();
      }}
    >
      <div
        className={`${
          taskModalDataTitle ? "text-gray-600" : "text-gray-400"
        } pl-4 mt-2`}
      >
        {editTaskTitleFetcher.state !== "idle"
          ? editTaskTitleFetcher.formData?.get("title")?.toString()
          : taskModalDataTitle || "Write a task title"}
      </div>
    </div>
  );
};
