import { useClickOutside } from "#app/hooks/useClickOutside.ts";
import { useFetcher } from "@remix-run/react";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { type ElementRef, useRef } from "react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { z } from "zod";

export const EditTaskDescriptionFormSchema = z.object({
  taskId: z.string(),
  ownerId: z.string().min(5),
  description: z.string().optional(),
});

interface TaskProps {
  actionData: any;
  ownerId: string;
  taskModalDataId: string;
  taskModalDataDescription: string | null | undefined;
  taskModalRef: React.RefObject<HTMLDivElement>;
  invokeSetTaskModalData: (
    data: { description: string | undefined } | null
  ) => void;
}

export const EditTaskDescription: React.FC<TaskProps> = ({
  actionData,
  ownerId,
  taskModalDataId,
  taskModalDataDescription,
  taskModalRef,
  invokeSetTaskModalData,
}) => {
  const editTaskDescriptionFormRef = useRef<ElementRef<"form">>(null);
  const editTaskDescriptionTextAreaRef = useRef<ElementRef<"textarea">>(null);
  const editTaskDescriptionFetcher = useFetcher({
    key: "edit-task-description",
  });

  useClickOutside(taskModalRef, () => {
    if (editTaskDescriptionFormRef.current) {
      editTaskDescriptionFetcher.submit(editTaskDescriptionFormRef.current);
    }
    invokeSetTaskModalData(null);
  });

  const [editTaskDescriptionForm, editTaskDescriptionFields] = useForm({
    id: "edit-task-description-form",
    constraint: getFieldsetConstraint(EditTaskDescriptionFormSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: EditTaskDescriptionFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <editTaskDescriptionFetcher.Form
      {...editTaskDescriptionForm.props}
      method="PUT"
      action="/task-edit-description"
      ref={editTaskDescriptionFormRef}
      onBlur={() => {
        console.log("task", editTaskDescriptionFormRef.current);

        editTaskDescriptionFetcher.submit(editTaskDescriptionFormRef.current);
        invokeSetTaskModalData({
          description: editTaskDescriptionTextAreaRef.current?.value,
        });

        editTaskDescriptionFormRef.current?.reset();
      }}
      className="h-full w-full "
    >
      <AuthenticityTokenInput />
      <textarea
        ref={editTaskDescriptionTextAreaRef}
        {...conform.input(editTaskDescriptionFields.description)}
        className="w-full h-full text-base p-4 border-transparent hover:border-input focus:border-input transition bg-gray-100 outline-none rounded-lg resize-none"
        placeholder={
          taskModalDataDescription ? undefined : "What is this task about?"
        }
        defaultValue={taskModalDataDescription || ""}
      ></textarea>
      <input
        {...conform.input(editTaskDescriptionFields.ownerId, {
          type: "hidden",
        })}
        value={ownerId}
      />
      <input
        {...conform.input(editTaskDescriptionFields.taskId, {
          type: "hidden",
        })}
        value={taskModalDataId}
      />
    </editTaskDescriptionFetcher.Form>
  );
};
