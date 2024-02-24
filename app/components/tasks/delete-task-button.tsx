import { type useFetcher } from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";

interface TaskProps {
  taskModalDataId: string;
  deleteTaskFetcher: ReturnType<typeof useFetcher>;
  invokeSetTaskModalData: (data: null) => void;
}

export const DeleteTaskButton: React.FC<TaskProps> = ({
  taskModalDataId,
  deleteTaskFetcher,
  invokeSetTaskModalData,
}) => {
  return (
    <deleteTaskFetcher.Form
      method="DELETE"
      action="/task-delete"
      onSubmit={() => invokeSetTaskModalData(null)}
    >
      <AuthenticityTokenInput />
      <input type="hidden" name="taskId" value={taskModalDataId} />
      <button
        type="submit"
        className="bg-red-500 text-white h-10 w-20 rounded-lg border border-gray-100 hover:bg-red-600 text-center self-center text-base"
      >
        Delete
      </button>
    </deleteTaskFetcher.Form>
  );
};
