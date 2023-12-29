import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#app/components/ui/dropdown-menu.tsx";
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1"
                  stroke="rgb(220 38 38 / var(--tw-text-opacity))"
                  className="w-5 h-5 mr-1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>

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
