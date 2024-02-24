import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#app/components/ui/dropdown-menu.tsx";
import Pencil from "#public/pencil.tsx";
import RedTrashCan from "#public/red-trash.tsx";
import { useFetcher } from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";

export function SectionDropdown({
  sectionId,
  focusCurrentEditSection,
}: {
  sectionId: string;
  focusCurrentEditSection: () => void;
}) {
  const deleteSectionFetcher = useFetcher({ key: "delete-section" });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="h-8 w-8 mb-2 hover:bg-gray-50 rounded-md outline-none ring-none">
          <div className="h-8">•••</div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0">
        <DropdownMenuItem className="p-0">
          <div
            className="p-2 flex flex-row hover:cursor-pointer"
            onClick={focusCurrentEditSection}
          >
            <div className="w-6 pl-0.5 mr-1">
              <Pencil />
            </div>
            <div>Rename Section</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem className="p-0">
          <deleteSectionFetcher.Form method="DELETE" action="/section-delete">
            <AuthenticityTokenInput />
            <input type="hidden" name="sectionId" value={sectionId} />
            <button type="submit" className=" text-red-600 p-2">
              <div className="flex flex-row">
                <div className="w-6 mr-1">
                  <RedTrashCan />
                </div>
                <div>Delete Section</div>
              </div>
            </button>
          </deleteSectionFetcher.Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
