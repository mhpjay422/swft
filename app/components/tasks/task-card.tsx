import { type Task } from "#app/routes/users+/$username_+/project.$projectId.index.tsx";

interface TaskProps {
  task?: Task;
  setIsTaskModalOpenAndData?: React.Dispatch<
    React.SetStateAction<[boolean, Task | null]>
  >;
  title?: string;
}

export const TaskCard: React.FC<TaskProps> = ({
  task,
  setIsTaskModalOpenAndData,
  title,
}) => {
  const isCreatedTask = !!task;
  const handleClick =
    isCreatedTask && setIsTaskModalOpenAndData
      ? () => setIsTaskModalOpenAndData([true, task])
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
