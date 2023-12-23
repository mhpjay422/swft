import { type Task } from "#app/routes/users+/$username_+/project.$projectId.index.tsx";

interface TaskProps {
  task?: Task;
  setTaskModalData?: React.Dispatch<React.SetStateAction<Task | null>>;
  title?: string;
  deleteTaskIsSubmitting?: boolean;
}

export const TaskCard: React.FC<TaskProps> = ({
  task,
  setTaskModalData,
  title,
  deleteTaskIsSubmitting,
}) => {
  const isCreatedTask = !!task;
  const handleClick =
    isCreatedTask && setTaskModalData && !deleteTaskIsSubmitting
      ? () => setTaskModalData(task)
      : undefined;

  return (
    <div
      className={`task ${
        handleClick ? "hover:cursor-pointer" : "hover:cursor-wait"
      }`}
      onClick={handleClick}
    >
      {isCreatedTask ? task?.title : title}
    </div>
  );
};
