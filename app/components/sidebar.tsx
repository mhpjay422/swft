import { useLocation } from "@remix-run/react";
import {
  BookOpenIcon,
  UserGroupIcon,
  ListBulletIcon,
  HomeModernIcon,
} from "@heroicons/react/24/outline";
import { useLoggedInUser } from "#app/utils/user.ts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#app/components/ui/popover.tsx";

export default function Sidebar() {
  const location = useLocation();
  const itemsNavigation = [
    {
      name: "My Workspace",
      href: "/my-workspace",
      icon: UserGroupIcon,
      current: location.pathname === "/my-workspace",
    },
  ];
  const loggedInUserPathname = useLoggedInUser()?.username;
  const homeItem = {
    name: "Home",
    href: "/",
    icon: HomeModernIcon,
    current: location?.pathname === "/",
  };
  const projectsNavigation = [
    {
      name: "My Project",
      href: "/users/" + loggedInUserPathname,
      icon: BookOpenIcon,
      current: location?.pathname === "/users/" + loggedInUserPathname,
    },
  ];

  return (
    <div className="h-screen">
      <div className="h-full flex w-64 flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-gray-50 pt-2 mb-32">
          <div className="flex flex-grow flex-col">
            <nav className="flex flex-col px-2 h-full justify-between">
              <div>
                <a
                  href={homeItem.href}
                  className={`${
                    homeItem.current
                      ? "bg-slate-200 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-6`}
                >
                  <homeItem.icon
                    className={`
                      ${homeItem.current}
                        ? "text-gray-800"
                        : "text-gray-400 group-hover:text-gray-500"
                      mr-3 flex-shrink-0 h-6 w-6`}
                    aria-hidden="true"
                  />
                  {homeItem.name}
                </a>

                <div className="mb-6">
                  <p className="text-xs uppercase font-semibold text-gray-600 mb-2 pl-2">
                    Projects
                  </p>
                  {projectsNavigation.map((project) => (
                    <a
                      key={project.name}
                      href={project.href}
                      className={`
                      ${
                        project.current
                          ? "bg-slate-200 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                      group flex projects-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <project.icon
                        className={`
                        ${
                          project.current
                            ? "text-gray-800"
                            : "text-gray-400 group-hover:text-gray-500"
                        }
                        mr-3 flex-shrink-0 h-6 w-6`}
                        aria-hidden="true"
                      />
                      {project.name}
                    </a>
                  ))}
                </div>

                <p className="text-xs uppercase font-semibold text-gray-600 mb-2 pl-2">
                  Team
                </p>

                <div className="w-full flex flex-grow min-w-max">
                  {itemsNavigation.map((item) => (
                    <Popover key={item.name}>
                      <PopoverTrigger>
                        <div className="cursor-not-allowed w-[239px]">
                          <a
                            href={item.href}
                            className={`
                      ${
                        item.current
                          ? "bg-slate-200 text-gray-900"
                          : "text-gray-300 hover:bg-gray-50 hover:text-gray-900"
                      }
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md pointer-events-none w-full`}
                          >
                            <item.icon
                              className={`
                        ${
                          item.current
                            ? "text-gray-800"
                            : "text-gray-400 group-hover:text-gray-500"
                        }
                        mr-3 flex-shrink-0 h-6 w-6`}
                              aria-hidden="true"
                            />
                            {item.name}
                          </a>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="text-sm">
                        <p>This feature is coming soon...</p>
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              </div>

              <Popover>
                <PopoverTrigger>
                  <div className="flex flex-col cursor-not-allowed">
                    <a
                      key="Settings"
                      href="/settings"
                      className={`
                    ${
                      location.pathname === "/settings"
                        ? "bg-slate-200 text-gray-900"
                        : "text-gray-300 hover:bg-gray-50 hover:text-gray-900"
                    }
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full pointer-events-none`}
                    >
                      <ListBulletIcon
                        className={`
                      ${
                        location.pathname === "/settings"
                          ? "text-gray-800"
                          : "text-gray-400 group-hover:text-gray-500"
                      }
                      mr-3 flex-shrink-0 h-6 w-6`}
                        aria-hidden="true"
                      />
                      Settings
                    </a>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="text-sm">
                  <p>This feature is coming soon...</p>
                </PopoverContent>
              </Popover>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
