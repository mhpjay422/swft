import type { MetaFunction } from "@remix-run/node";
import { Checkbox } from "../components/checkbox";

export const meta: MetaFunction = () => {
  return [
    { title: "SWFT" },
    { name: "description", content: "Welcome to SWFT!" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div className="text-red-400">Welcome to Remix</div>
      <div className="ml-4">
        <Checkbox />
      </div>
    </div>
  );
}
