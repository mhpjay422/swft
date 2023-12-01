import { useLocation } from "@remix-run/react";
import {
  FolderIcon,
  UsersIcon,
  ListBulletIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const location = useLocation();
  const itemsNavigation = [
    {
      name: "My Workspace",
      href: "/my-workspace",
      icon: UsersIcon,
      current: location.pathname === "/my-workspace",
    },
  ];
  const homeItem = {
    name: "Home",
    href: "/",
    icon: HomeIcon,
    current: location?.pathname === "/",
  };
  const projectsNavigation = [
    {
      name: "My Project",
      href: "/users/admin",
      icon: FolderIcon,
      current: location?.pathname === "/users/admin",
    },
  ];

  return (
    <div className="h-screen">
      <div className="h-full md:flex md:w-72 md:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-gray-100 pt-2">
          <div className="flex flex-grow flex-col">
            <nav className="flex flex-col px-2 pb-4 h-full justify-between">
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

                {itemsNavigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`
                      ${
                        item.current
                          ? "bg-slate-200 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
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
                ))}
              </div>

              <div className="flex flex-col mb-32">
                <a
                  key="Settings"
                  href="/settings"
                  className={`
                    ${
                      location.pathname === "/settings"
                        ? "bg-slate-200 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
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
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
