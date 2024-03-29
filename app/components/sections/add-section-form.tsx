import { useFetcher } from "@remix-run/react";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { z } from "zod";
import { flushSync } from "react-dom";
import { useClickOutside } from "#app/hooks/useClickOutside.ts";
import { type ElementRef, useRef, useState, useEffect } from "react";

export const AddSectionFormSchema = z.object({
  title: z.string().min(1).max(32),
  ownerId: z.string().min(5),
  projectId: z.string().min(5),
});

interface TaskProps {
  submissionData: any;
  ownerId: string;
  projectId: string | undefined;
  scrollRightIntoView: () => void;
}

export const AddSectionForm: React.FC<TaskProps> = ({
  submissionData,
  ownerId,
  projectId,
  scrollRightIntoView,
}) => {
  const [addSectionCreateFormIsOpen, setAddSectionCreateFormIsOpen] =
    useState(false);
  const [addSectionForm, addSectionFields] = useForm({
    id: "add-section-form",
    constraint: getFieldsetConstraint(AddSectionFormSchema),
    lastSubmission: submissionData,
    onValidate({ formData }) {
      return parse(formData, { schema: AddSectionFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  const addSectionRef = useRef<ElementRef<"form">>(null);
  const addSectionInputRef = useRef<ElementRef<"input">>(null);
  const addSectionFetcher = useFetcher({ key: "add-section" });

  useClickOutside(
    addSectionRef,
    () => {
      setAddSectionCreateFormIsOpen(false);
    },
    "ignore-click-outside"
  );

  useEffect(() => {
    if (addSectionCreateFormIsOpen) {
      scrollRightIntoView();
      addSectionInputRef.current?.select();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addSectionCreateFormIsOpen]);

  return (
    <div
      className="w-full"
      onClick={() => {
        flushSync(() => {
          setAddSectionCreateFormIsOpen((prevState) => !prevState);
        });
      }}
    >
      {addSectionCreateFormIsOpen ? (
        <addSectionFetcher.Form
          {...addSectionForm.props}
          method="POST"
          action="/section-create"
          ref={addSectionRef}
          onSubmit={() => {
            setAddSectionCreateFormIsOpen(false);
            scrollRightIntoView();
          }}
          onBlur={() => {
            if (addSectionRef.current?.value !== "") {
              addSectionFetcher.submit(addSectionRef.current);
            }
            addSectionRef.current?.reset();
          }}
        >
          <AuthenticityTokenInput />
          <input
            ref={addSectionInputRef}
            type="text"
            {...conform.input(addSectionFields.title)}
            className="w-64 mb-2.5 text-base px-2 h-[30px] font-medium border-transparent hover:border-input focus:border-input transition"
            placeholder="Enter section title..."
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setAddSectionCreateFormIsOpen(false);
              }
            }}
          />
          <input
            {...conform.input(addSectionFields.ownerId, { type: "hidden" })}
            value={ownerId}
          />
          <input
            {...conform.input(addSectionFields.projectId, { type: "hidden" })}
            value={projectId}
          />
        </addSectionFetcher.Form>
      ) : (
        <div className="font-semibold mt-0.5 mb-[6px] pl-2 h-8 w-64 text-gray-500 group-hover:bg-gray-100 hover:cursor-pointer rounded-lg group-hover:text-gray-600">
          {" "}
          + Add section
        </div>
      )}
      <div className="overflow-x-hidden overflow-y-auto section-max-height h-screen rounded-lg ignore-click-outside">
        <div className="w-64 h-full rounded-lg bg-gray-50 group-hover:bg-gray-100"></div>
      </div>
    </div>
  );
};
