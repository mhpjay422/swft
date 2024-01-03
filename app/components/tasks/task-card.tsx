import { type Task } from "#app/routes/users+/$username_+/project.$projectId.index.tsx";
import TaskCompleteCheckIcon from "#public/task-complete-check.tsx";
import TaskNotCompleteCheckIcon from "#public/task-not-complete-check.tsx";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { useFetcher } from "@remix-run/react";
import { useRef } from "react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { z } from "zod";

export const ToggleTaskCompletionFormSchema = z.object({
  taskId: z.string(),
  ownerId: z.string().min(5),
  completed: z.string(),
});

interface TaskProps {
  task?: Task;
  title?: string;
  deleteTaskIsSubmitting?: boolean;
  setTaskModalData?: React.Dispatch<React.SetStateAction<Task | null>>;
}

export const TaskCard: React.FC<TaskProps> = ({
  task,
  title,
  deleteTaskIsSubmitting,
  setTaskModalData,
}) => {
  const toggleTaskCompletionFetcher = useFetcher({
    key: `toggle-task-completion-${task?.id}`,
  });
  const toggleTaskCompletionRef = useRef<HTMLFormElement>(null);
  const taskCompleteIcon = useRef<HTMLDivElement>(null);
  const isCreatedTask = !!task;
  const handleClick = (event: React.MouseEvent) => {
    if (
      isCreatedTask &&
      setTaskModalData &&
      !deleteTaskIsSubmitting &&
      !toggleTaskCompletionRef.current?.contains(event.target as Node)
    ) {
      setTaskModalData(task);
    }
  };

  const [form, fields] = useForm({
    id: `toggle-task-completion-form-${task?.id}`,
    constraint: getFieldsetConstraint(ToggleTaskCompletionFormSchema),
    onValidate({ formData }) {
      return parse(formData, { schema: ToggleTaskCompletionFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <div
      className={`flex flex-row task ${
        isCreatedTask && setTaskModalData && !deleteTaskIsSubmitting
          ? "hover:cursor-pointer"
          : "hover:cursor-wait"
      }`}
      onClick={handleClick}
    >
      <toggleTaskCompletionFetcher.Form
        {...form.props}
        method="PUT"
        action="/task-toggle-completion"
        ref={toggleTaskCompletionRef}
        onClick={() => {
          toggleTaskCompletionFetcher.submit(toggleTaskCompletionRef.current);
        }}
      >
        <AuthenticityTokenInput />
        <input
          {...conform.input(fields.taskId, {
            type: "hidden",
          })}
          value={task?.id}
        />
        <input
          {...conform.input(fields.ownerId, {
            type: "hidden",
          })}
          value={task?.ownerId}
        />
        <input
          {...conform.input(fields.completed, {
            type: "hidden",
          })}
          value={task?.completed.toString()}
        />
        <div ref={taskCompleteIcon}>
          {/* NOTE: Add optimistic update for task completion toggle */}
          {/* {task?.completed && toggleTaskCompletionRef.state !== "idle" ? ( */}
          {task?.completed ? (
            // Remix is not importing TaskCompleteCheckIcon correctly if the
            // import is a SVG wrapped in a div. Moved div here to fix.
            <div className="w-4 h-4 mt-1.5 ml-0.5 mr-2.5 rounded-full bg-green-700 flex items-center">
              <TaskCompleteCheckIcon />
            </div>
          ) : (
            <TaskNotCompleteCheckIcon />
          )}
        </div>
      </toggleTaskCompletionFetcher.Form>
      {isCreatedTask ? task?.title : title}
    </div>
  );
};
