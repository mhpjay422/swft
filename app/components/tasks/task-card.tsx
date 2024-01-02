import { type Task } from "#app/routes/users+/$username_+/project.$projectId.index.tsx";
import TaskCompleteCheckIcon from "#public/task-complete-check.tsx";
import TaskNotCompleteCheckIcon from "#public/task-not-complete-check.tsx";
import { useRef } from "react";

interface TaskProps {
  task?: Task;
  setTaskModalData?: React.Dispatch<React.SetStateAction<Task | null>>;
  title?: string;
  deleteTaskIsSubmitting?: boolean;
}

export const TaskCard: React.FC<TaskProps> = ({
  task,
  title,
  deleteTaskIsSubmitting,
  setTaskModalData,
}) => {
  const isCreatedTask = !!task;
  const taskCompleteIcon = useRef<HTMLDivElement>(null);
  const handleClick = (event: React.MouseEvent) => {
    if (
      isCreatedTask &&
      setTaskModalData &&
      !deleteTaskIsSubmitting &&
      !taskCompleteIcon.current?.contains(event.target as Node)
    ) {
      setTaskModalData(task);
    }
  };

  return (
    <div
      className={`flex flex-row task ${
        isCreatedTask && setTaskModalData && !deleteTaskIsSubmitting
          ? "hover:cursor-pointer"
          : "hover:cursor-wait"
      }`}
      onClick={handleClick}
    >
      <div ref={taskCompleteIcon}>
        {!task?.completed ? (
          <TaskCompleteCheckIcon />
        ) : (
          <TaskNotCompleteCheckIcon />
        )}
      </div>
      {isCreatedTask ? task?.title : title}
    </div>
  );
};
