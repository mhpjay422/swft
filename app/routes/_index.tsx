import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "SWFT" },
    { name: "description", content: "Welcome to SWFT!" },
  ];
};

export default function Index() {
  return (
    <div className="h-screen flex flex-col w-screen">
      <div className="flex flex-1 min-w-screen">
        <div className="flex flex-col w-[30%] mx-auto mt-[15%]">
          <div className="text-3xl text-center text-gray-800">
            The platform for organizing your projects
          </div>
          <div className="text-center mt-8 text-4xl">
            <span
              className={`font-semibold inline mt-4 ${
                process.env.NODE_ENV === "development"
                  ? "text-red-300"
                  : "text-black"
              }`}
            >
              {process.env.NODE_ENV === "development" ? "DEV" : null} SWFT
            </span>
            ly
          </div>
          <p className="text-xl text-center mt-12">
            Want to streamline your workflows efficiently? SWFT makes it easy
            and intuitive to manage your projects.
          </p>
        </div>
      </div>
    </div>
  );
}
