import type { MetaFunction } from "@remix-run/node";
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
        <div className="flex flex-1">
          <div className="mx-auto self-center">Body</div>
        </div>
        <div className="flex justify-items-center h-16 text-red-400 border-b-gray-800 bg-black">
          <div className="mx-auto self-center">Footer</div>
        </div>
      </div>
    </div>
  );
}
