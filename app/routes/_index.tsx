import type { MetaFunction } from "@remix-run/node";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import * as LabelPrimitive from "@radix-ui/react-label";
import { clsx } from "clsx";
import React from "react";

interface CheckboxProps {}

export const meta: MetaFunction = () => {
  return [
    { title: "SWFT" },
    { name: "description", content: "Welcome to SWFT!" },
  ];
};

const Checkbox = (props: CheckboxProps) => {
  return (
    <form className="flex items-center">
      <CheckboxPrimitive.Root
        id="c1"
        defaultChecked
        className={clsx(
          "flex h-5 w-5 items-center justify-center rounded",
          "radix-state-checked:bg-purple-600 radix-state-unchecked:bg-gray-100 dark:radix-state-unchecked:bg-gray-900",
          "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75"
        )}
      >
        <CheckboxPrimitive.Indicator>
          <CheckIcon className="h-4 w-4 self-center text-white" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      <LabelPrimitive.Label
        htmlFor="c1"
        className="ml-3 select-none text-sm font-medium text-gray-900"
      >
        Accept terms and conditions
      </LabelPrimitive.Label>
    </form>
  );
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div className="text-red-400">Welcome to Remix</div>
      {Checkbox({})}
    </div>
  );
}
