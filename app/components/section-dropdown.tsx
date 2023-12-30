import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#app/components/ui/dropdown-menu.tsx";
import RedTrashCan from "#public/red-trash.tsx";
import { useFetcher } from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";

export function SectionDropdown({ sectionId }: { sectionId: string }) {
  const deleteSectionFetcher = useFetcher({ key: "delete-section" });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="h-8 w-8 hover:bg-gray-50 rounded-md items-center outline-none ring-none">
          <div className="pb-4 h-6">•••</div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <div className="hover:cursor-pointer">
            <deleteSectionFetcher.Form method="DELETE" action="/section-delete">
              <AuthenticityTokenInput />
              <input type="hidden" name="sectionId" value={sectionId} />
              <div className="flex flex-row">
                <RedTrashCan />
                <button type="submit" className=" text-red-600">
                  Delete Section
                </button>
              </div>
            </deleteSectionFetcher.Form>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
