import { useFetcher } from "@remix-run/react";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { useRef } from "react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { ToggleTaskCompletionFormSchema } from "#app/components/tasks/task-card.tsx";

interface TaskProps {
  submissionData: any;
  taskModalDataId: string;
  taskModalDataOwnerId: string;
  taskModalDataIsCompleted: boolean;
  invokeSetTaskModalData: (data: { completed: boolean } | null) => void;
}

export const ToggleTaskCompletionButton: React.FC<TaskProps> = ({
  submissionData,
  taskModalDataId,
  taskModalDataOwnerId,
  taskModalDataIsCompleted,
  invokeSetTaskModalData,
}) => {
  const toggleTaskCompletionModalRef = useRef<HTMLFormElement>(null);
  const toggleTaskCompletionModalFetcher = useFetcher({
    key: `toggle-task-completion-${taskModalDataId}`,
  });
  const taskCompleteModalIcon = useRef<HTMLDivElement>(null);
  const [toggleTaskCompletionForm, toggleTaskCompletionFields] = useForm({
    id: `toggle-task-completion-form-modal-${taskModalDataId}`,
    constraint: getFieldsetConstraint(ToggleTaskCompletionFormSchema),
    lastSubmission: submissionData,
    onValidate({ formData }) {
      return parse(formData, { schema: ToggleTaskCompletionFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <toggleTaskCompletionModalFetcher.Form
      {...toggleTaskCompletionForm.props}
      method="PUT"
      action="/task-toggle-completion"
      ref={toggleTaskCompletionModalRef}
      onClick={() => {
        toggleTaskCompletionModalFetcher.submit(
          toggleTaskCompletionModalRef.current
        );
        invokeSetTaskModalData({
          completed: !taskModalDataIsCompleted,
        });
      }}
    >
      <AuthenticityTokenInput />
      <input
        {...conform.input(toggleTaskCompletionFields.taskId, {
          type: "hidden",
        })}
        value={taskModalDataId}
      />
      <input
        {...conform.input(toggleTaskCompletionFields.ownerId, {
          type: "hidden",
        })}
        value={taskModalDataOwnerId}
      />
      <input
        {...conform.input(toggleTaskCompletionFields.completed, {
          type: "hidden",
        })}
        value={taskModalDataIsCompleted.toString()}
      />
      <div ref={taskCompleteModalIcon}>
        {/* NOTE: Add optimistic update for task completion toggle */}
        <div
          className={`group h-7 px-2 text-xs flex items-center rounded-md hover:cursor-pointer border ${
            taskModalDataIsCompleted
              ? "completed-checkmark"
              : "not-completed-checkmark"
          }`}
        >
          <svg
            data-slot="icon"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className={`mr-1 h-3.5 w-4 ${
              taskModalDataIsCompleted
                ? "completed-checkmark-svg"
                : "not-completed-checkmark-svg"
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            ></path>
          </svg>
          <div>{taskModalDataIsCompleted ? "Completed" : "Mark complete"}</div>
        </div>
      </div>
    </toggleTaskCompletionModalFetcher.Form>
  );
};
