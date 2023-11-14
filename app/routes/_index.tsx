import type { MetaFunction } from "@remix-run/node";
import { Footer } from "~/components/footer";
import { Header } from "~/components/header";

export const meta: MetaFunction = () => {
  return [
    { title: "SWFT" },
    { name: "description", content: "Welcome to SWFT!" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 bg-gray-100 min-w-screen">
          <div className="self-center flex flex-col w-[30%] mx-auto">
            <div className="text-3xl bg-gray-100 text-center text-gray-800">
              The platform for organizing your projects
            </div>
            <div className="bg-gray-100 text-center mt-8 text-4xl">
              <span className="font-semibold inline mt-4 text-black">
                {" "}
                SWFT
              </span>
              ly
            </div>
            <p className="text-xl text-center mt-12">
              Want to streamline your workflows efficiently? SWFT makes it easy
              and intuitive to manage your projects.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
